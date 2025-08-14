import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export const log = (message: string) => {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [express] ${message}`);
};

// WebSocket setup for development
export const setupWebSocket = async (server: any) => {
  try {
    const { WebSocketServer } = await import('ws');
    const wss = new WebSocketServer({ 
      server,
      path: '/ws',
      perMessageDeflate: false,
      clientTracking: true
    });

    wss.on('connection', (ws: any, req: any) => {
      console.log('WebSocket client connected from:', req.socket.remoteAddress);

      // Send ping every 30 seconds to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === 1) { // OPEN
          ws.ping();
        }
      }, 30000);

      ws.on('message', (message: string) => {
        try {
          console.log('WebSocket message:', message.toString());
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('pong', () => {
        console.log('WebSocket pong received');
      });

      ws.on('error', (error: any) => {
        console.error('WebSocket error:', error);
        clearInterval(pingInterval);
      });

      ws.on('close', (code: number, reason: string) => {
        console.log('WebSocket client disconnected:', code, reason.toString());
        clearInterval(pingInterval);
      });
    });

    wss.on('error', (error: any) => {
      console.error('WebSocket server error:', error);
    });

    return wss;
  } catch (error) {
    console.error('Failed to setup WebSocket server:', error);
    return null;
  }
};

export async function setupVite(app: Express, server: Server): Promise<void> {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = await vite.transformIndexHtml(url, template);
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}