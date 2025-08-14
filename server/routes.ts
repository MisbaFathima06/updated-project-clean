import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import complaintsRouter from "./routes/complaints.js";
import zkIdentityRouter from "./routes/zk-identity.js";
import emergencyRouter from "./routes/emergency.js";
import upvotingRouter from "./routes/upvoting.js";
import i18nRouter from "./routes/i18n.js";
import authoritiesRouter from "./routes/authorities.js";
import { ipfsService } from "./services/ipfs.js";
import { blockchainService } from "./services/blockchain.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      const ipfsStats = await ipfsService.getStats();
      const blockchainStats = await blockchainService.getNetworkStats();

      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        services: {
          database: "connected",
          ipfs: ipfsStats.connected ? "connected" : "fallback",
          blockchain: blockchainStats.connected ? "connected" : "fallback",
          encryption: "active",
          zkIdentity: "active",
          emergency: "active"
        }
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        error: error.message
      });
    }
  });

  // Register route modules
  app.use("/api/complaints", complaintsRouter);
  app.use("/api/zk", zkIdentityRouter);
  app.use("/api/emergency", emergencyRouter);
  app.use("/api/i18n", i18nRouter);
  app.use("/api/upvote", upvotingRouter);
  app.use("/api/authorities", authoritiesRouter);

  // Create HTTP server
  const httpServer = createServer(app);

  // Add WebSocket server for real-time notifications
  const wss = new WebSocketServer({
    server: httpServer,
    path: '/ws',
    perMessageDeflate: false,
    clientTracking: true,
    maxPayload: 16 * 1024
  });

  // WebSocket connection handling with better error management
  wss.on('connection', (ws: WebSocket, req) => {
    console.log('🔌 WebSocket client connected from:', req.socket.remoteAddress);

    // Set up heartbeat
    let isAlive = true;
    const heartbeat = () => { isAlive = true; };
    
    ws.on('pong', heartbeat);

    // Send welcome message safely
    try {
      ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to SpeakSecure real-time service',
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to send welcome message:', error);
    }

    // Handle client messages
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('📨 WebSocket message received:', message.type);

        // Reset heartbeat on any message
        isAlive = true;

        // Handle different message types
        switch (message.type) {
          case 'ping':
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            }
            break;
          case 'subscribe':
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'subscribed',
                channel: message.channel,
                timestamp: Date.now()
              }));
            }
            break;
          default:
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Unknown message type',
                timestamp: Date.now()
              }));
            }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        try {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Invalid message format',
              timestamp: Date.now()
            }));
          }
        } catch (sendError) {
          console.error('Failed to send error message:', sendError);
        }
      }
    });

    // Handle client disconnect
    ws.on('close', (code, reason) => {
      console.log('🔌 WebSocket client disconnected:', code, reason.toString());
      isAlive = false;
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      isAlive = false;
    });

    // Set up heartbeat interval for this connection
    const pingInterval = setInterval(() => {
      if (!isAlive) {
        console.log('🔌 WebSocket connection terminated due to no heartbeat');
        clearInterval(pingInterval);
        return ws.terminate();
      }
      
      isAlive = false;
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 30000);

    // Clean up interval when connection closes
    ws.on('close', () => {
      clearInterval(pingInterval);
    });
  });

  // Broadcast function for real-time updates
  const broadcast = (message: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  };

  // Add broadcast to app for use in routes
  app.set('broadcast', broadcast);

  console.log('✅ All routes registered successfully');
  console.log('🔌 WebSocket server ready on /ws');

  return httpServer;
}