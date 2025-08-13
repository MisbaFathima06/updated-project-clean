
import { db } from '../db.js';
import { complaints } from '../../shared/schema.js';
import { eq, and, desc, asc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { encryptionService } from './encryption.js';
import { ipfsService } from './ipfs.js';
import { blockchainService } from './blockchain.js';

export interface CreateComplaintData {
  topic: string;
  description: string;
  location?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  isPublic?: boolean;
  emergencyContact?: string;
  zkProof?: string;
}

export interface ComplaintFilters {
  topic?: string;
  status?: string;
  priority?: string;
  isPublic?: boolean;
  limit?: number;
  offset?: number;
}

class ComplaintService {
  async createComplaint(data: CreateComplaintData) {
    try {
      const referenceId = nanoid(12).toUpperCase();
      
      // Encrypt sensitive data
      const encryptedDescription = await encryptionService.encrypt(data.description);
      const encryptedLocation = data.location ? await encryptionService.encrypt(data.location) : null;
      
      // Store on IPFS
      const ipfsHash = await ipfsService.uploadFile(Buffer.from(JSON.stringify({
        topic: data.topic,
        urgency: data.urgency,
        timestamp: new Date().toISOString(),
        referenceId
      })));
      
      // Store hash on blockchain
      const blockchainHash = await blockchainService.storeHash(ipfsHash);
      
      const complaint = await db.insert(complaints).values({
        referenceId,
        topic: data.topic,
        description: encryptedDescription,
        location: encryptedLocation,
        status: 'submitted',
        priority: data.urgency,
        isPublic: data.isPublic || false,
        emergencyContact: data.emergencyContact,
        ipfsHash,
        blockchainHash,
        zkProof: data.zkProof,
        submittedAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      return complaint[0];
    } catch (error) {
      console.error('Failed to create complaint:', error);
      throw new Error('Failed to create complaint');
    }
  }
  
  async getComplaints(filters: ComplaintFilters = {}) {
    try {
      const { limit = 20, offset = 0, ...otherFilters } = filters;
      
      let query = db.select().from(complaints);
      
      const conditions = [];
      if (otherFilters.topic) {
        conditions.push(eq(complaints.topic, otherFilters.topic));
      }
      if (otherFilters.status) {
        conditions.push(eq(complaints.status, otherFilters.status));
      }
      if (otherFilters.priority) {
        conditions.push(eq(complaints.priority, otherFilters.priority));
      }
      if (typeof otherFilters.isPublic === 'boolean') {
        conditions.push(eq(complaints.isPublic, otherFilters.isPublic));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const results = await query
        .orderBy(desc(complaints.submittedAt))
        .limit(limit)
        .offset(offset);
      
      return results;
    } catch (error) {
      console.error('Failed to get complaints:', error);
      throw new Error('Failed to fetch complaints');
    }
  }
  
  async getComplaintByReference(referenceId: string) {
    try {
      const result = await db.select()
        .from(complaints)
        .where(eq(complaints.referenceId, referenceId));
      
      return result[0] || null;
    } catch (error) {
      console.error('Failed to get complaint by reference:', error);
      throw new Error('Failed to fetch complaint');
    }
  }
  
  async updateComplaintStatus(referenceId: string, status: string, message?: string) {
    try {
      const updated = await db.update(complaints)
        .set({ 
          status, 
          updatedAt: new Date() 
        })
        .where(eq(complaints.referenceId, referenceId))
        .returning();
      
      return updated[0] || null;
    } catch (error) {
      console.error('Failed to update complaint status:', error);
      throw new Error('Failed to update complaint');
    }
  }
}

export const complaintService = new ComplaintService();
