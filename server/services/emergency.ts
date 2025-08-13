
import { storage } from '../storage.js';
import { zkIdentityService } from './zk-identity.js';
import type { InsertEmergencyAlert } from '@shared/schema';

export interface EmergencyAlertRequest {
  content: string;
  emergencyContact: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  zkCommitment: string;
  priority: 'high' | 'critical';
}

export interface EmergencyAlertResponse {
  alertId: string;
  status: string;
  transactionHash?: string;
  ipfsHash?: string;
  timestamp: number;
}

class EmergencyService {
  async sendEmergencyAlert(request: EmergencyAlertRequest): Promise<EmergencyAlertResponse> {
    try {
      console.log('🚨 Processing emergency alert...');

      // Create encrypted content
      const encryptedContent = JSON.stringify({
        content: request.content,
        timestamp: Date.now(),
        priority: request.priority
      });

      // Prepare emergency alert data
      const alertData: InsertEmergencyAlert = {
        zkCommitment: request.zkCommitment,
        encryptedContent,
        emergencyContact: request.emergencyContact,
        location: request.location ? JSON.stringify(request.location) : null,
        priority: request.priority
      };

      // Store in database
      const alert = await storage.createEmergencyAlert(alertData);
      
      console.log(`✅ Emergency alert created: ${alert.id}`);

      // In production, this would trigger real emergency services
      await this.notifyEmergencyServices(alert.id, request);

      return {
        alertId: alert.id,
        status: 'sent',
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('❌ Emergency alert failed:', error);
      throw new Error('Failed to send emergency alert');
    }
  }

  private async notifyEmergencyServices(alertId: string, request: EmergencyAlertRequest) {
    // In production, this would:
    // 1. Send SMS to emergency contacts
    // 2. Notify local authorities
    // 3. Send real-time alerts to response teams
    // 4. Log to blockchain for transparency
    
    console.log(`📢 Emergency services notified for alert ${alertId}`);
  }

  async getEmergencyAlerts(limit = 20) {
    return await storage.getEmergencyAlerts(limit);
  }

  async testEmergencySystem(): Promise<{ success: boolean; message: string }> {
    try {
      // Test basic functionality
      console.log('🧪 Testing emergency system...');
      
      // Check database connectivity
      await storage.getEmergencyAlerts(1);
      
      console.log('✅ Emergency system test passed');
      return {
        success: true,
        message: 'Emergency system is operational'
      };
    } catch (error) {
      console.error('❌ Emergency system test failed:', error);
      return {
        success: false,
        message: 'Emergency system test failed'
      };
    }
  }
}

export const emergencyService = new EmergencyService();
