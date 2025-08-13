import { Router } from 'express';
import { z } from 'zod';
import { complaintService } from '../services/complaint.js';
import { emergencyService } from '../services/emergency.js';

const router = Router();

// Create complaint
router.post('/', async (req, res) => {
  try {
    const complaintSchema = z.object({
      topic: z.string().min(1, 'Topic is required'),
      description: z.string().min(10, 'Description must be at least 10 characters'),
      location: z.string().optional(),
      urgency: z.enum(['low', 'medium', 'high', 'critical']),
      isPublic: z.boolean().optional(),
      emergencyContact: z.string().optional(),
      zkProof: z.string().optional()
    });

    const validationResult = complaintSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid complaint data',
        details: validationResult.error.errors
      });
    }

    const complaintData = validationResult.data;

    // Handle emergency cases
    if (complaintData.urgency === 'critical' && complaintData.emergencyContact) {
      await emergencyService.triggerEmergencyAlert({
        message: `Critical complaint: ${complaintData.topic}`,
        location: complaintData.location,
        urgency: 'critical',
        contact: complaintData.emergencyContact
      });
    }

    const complaint = await complaintService.createComplaint(complaintData);

    res.status(201).json({
      success: true,
      data: {
        referenceId: complaint.referenceId,
        status: complaint.status,
        submittedAt: complaint.submittedAt
      }
    });

  } catch (error) {
    console.error('Failed to create complaint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create complaint'
    });
  }
});

// Get complaints with filters
router.get('/', async (req, res) => {
  try {
    const { topic, status, priority, isPublic, limit, offset } = req.query;

    const filters = {
      topic: topic as string,
      status: status as string,
      priority: priority as string,
      isPublic: isPublic === 'true',
      limit: parseInt(limit as string) || 20,
      offset: parseInt(offset as string) || 0
    };

    const complaints = await complaintService.getComplaints(filters);

    res.json({
      success: true,
      data: complaints,
      total: complaints.length
    });

  } catch (error) {
    console.error('Failed to fetch complaints:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch complaints'
    });
  }
});

// Get complaint by reference ID
router.get('/:referenceId', async (req, res) => {
  try {
    const { referenceId } = req.params;

    if (!referenceId) {
      return res.status(400).json({
        success: false,
        error: 'Reference ID is required'
      });
    }

    const complaint = await complaintService.getComplaintByReference(referenceId);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      data: {
        complaint,
        updates: [] // In production, fetch actual updates
      }
    });

  } catch (error) {
    console.error('Failed to fetch complaint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch complaint'
    });
  }
});

export default router;