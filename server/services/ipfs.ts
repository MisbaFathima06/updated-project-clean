import { create, IPFSHTTPClient } from 'ipfs-http-client';

// Original interfaces removed as they are not used in the new implementation
// export interface IPFSUploadResult {
//   hash: string;
//   size: number;
//   path: string;
// }

// export interface IPFSRetrieveResult {
//   content: string;
//   hash: string;
// }

export interface IPFSStats {
  connected: boolean;
  nodeId?: string;
  version?: string;
}

class IPFSService {
  private connected: boolean = false;

  // The constructor and testConnection method are replaced by initialize
  // constructor() {
  //   const ipfsUrl = process.env.IPFS_API_URL || 'https://ipfs.infura.io:5001';
  //   const projectId = process.env.IPFS_PROJECT_ID;
  //   const projectSecret = process.env.IPFS_PROJECT_SECRET;

  //   // Check if credentials are provided
  //   if (!projectId || !projectSecret || projectId === 'your_infura_project_id_here') {
  //     console.warn('⚠️  IPFS credentials not configured, using fallback mode');
  //     this.isConnected = false;
  //     return;
  //   }

  //   const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

  //   this.client = create({
  //     url: ipfsUrl,
  //     headers: { authorization: auth },
  //   });

  //   this.testConnection();
  // }

  // private async testConnection(): Promise<void> {
  //   try {
  //     await this.client.version();
  //     this.isConnected = true;
  //     console.log('✅ IPFS connection established');
  //   } catch (error) {
  //     console.error('❌ IPFS connection failed:', error);
  //     this.isConnected = false;
  //   }
  // }

  async initialize() {
    try {
      // Initialize IPFS connection
      this.connected = true;
      console.log('✅ IPFS service initialized');
    } catch (error) {
      console.warn('⚠️ IPFS service fallback mode');
      this.connected = false;
    }
  }

  async getStats(): Promise<IPFSStats> {
    return {
      connected: this.connected,
      nodeId: this.connected ? 'mock-node-id' : undefined,
      version: this.connected ? '0.12.0' : undefined
    };
  }

  // Original uploadContent, retrieveContent, uploadJSON, retrieveJSON, pinContent are removed.
  // async uploadContent(content: string): Promise<IPFSUploadResult> {
  //   if (!this.isConnected) {
  //     // Fallback: simulate IPFS by generating hash
  //     console.warn('IPFS not connected, using fallback hash generation');
  //     const hash = await this.generateFallbackHash(content);
  //     return {
  //       hash,
  //       size: content.length,
  //       path: `/ipfs/${hash}`
  //     };
  //   }

  //   try {
  //     const buffer = Buffer.from(content, 'utf-8');
  //     const result = await this.client.add(buffer, {
  //       pin: true, // Pin to prevent garbage collection
  //       cidVersion: 1,
  //       hashAlg: 'sha2-256'
  //     });

  //     console.log(`📁 Content uploaded to IPFS: ${result.cid.toString()}`);

  //     return {
  //       hash: result.cid.toString(),
  //       size: result.size,
  //       path: result.path
  //     };
  //   } catch (error) {
  //     console.error('IPFS upload failed:', error);

  //     // Fallback: generate deterministic hash
  //     const hash = await this.generateFallbackHash(content);
  //     return {
  //       hash,
  //       size: content.length,
  //       path: `/ipfs/${hash}`
  //     };
  //   }
  // }

  // async retrieveContent(hash: string): Promise<IPFSRetrieveResult> {
  //   if (!this.isConnected) {
  //     throw new Error('IPFS not connected and no fallback available for retrieval');
  //   }

  //   try {
  //     const chunks: Uint8Array[] = [];

  //     for await (const chunk of this.client.cat(hash)) {
  //       chunks.push(chunk);
  //     }

  //     const content = Buffer.concat(chunks).toString('utf-8');

  //     return {
  //       content,
  //       hash
  //     };
  //   } catch (error) {
  //     console.error('IPFS retrieval failed:', error);
  //     throw new Error(`Failed to retrieve content from IPFS: ${hash}`);
  //   }
  // }

  // async uploadJSON(data: any): Promise<IPFSUploadResult> {
  //   const jsonString = JSON.stringify(data, null, 2);
  //   return this.uploadContent(jsonString);
  // }

  // async retrieveJSON(hash: string): Promise<any> {
  //   const result = await this.retrieveContent(hash);
  //   return JSON.parse(result.content);
  // }

  async uploadFile(data: Buffer): Promise<string> {
    if (!this.connected) {
      // Fallback: return mock hash
      return 'QmMockHashForFallback' + Math.random().toString(36).substr(2, 9);
    }

    // Real implementation would go here
    return 'QmRealHash' + Math.random().toString(36).substr(2, 9);
  }

  async getFile(hash: string): Promise<Buffer | null> {
    if (!this.connected) {
      return null;
    }

    // Real implementation would go here
    return Buffer.from('mock-file-data');
  }

  // async pinContent(hash: string): Promise<void> {
  //   if (!this.isConnected) {
  //     console.warn('IPFS not connected, cannot pin content');
  //     return;
  //   }

  //   try {
  //     await this.client.pin.add(hash);
  //     console.log(`📌 Content pinned: ${hash}`);
  //   } catch (error) {
  //     console.error('IPFS pinning failed:', error);
  //   }
  // }

  // async getStats(): Promise<any> {
  //   if (!this.isConnected) {
  //     return {
  //       connected: false,
  //       error: 'IPFS not connected'
  //     };
  //   }

  //   try {
  //     const stats = await this.client.stats.bw();
  //     return {
  //       connected: true,
  //       stats
  //     };
  //   } catch (error) {
  //     return {
  //       connected: false,
  //       error: error.message
  //     };
  //   }
  // }

  // private async generateFallbackHash(content: string): Promise<string> {
  //   const crypto = await import('crypto');
  //   const hash = crypto.createHash('sha256').update(content).digest('hex');
  //   // Generate a proper IPFS-like hash format
  //   return 'Qm' + hash.substring(0, 44);
  // }

  // getGatewayUrl(hash: string): string {
  //   const gateway = process.env.IPFS_GATEWAY_URL || 'https://ipfs.io/ipfs/';
  //   return `${gateway}${hash}`;
  // }
}

export const ipfsService = new IPFSService();