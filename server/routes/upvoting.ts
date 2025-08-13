
import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { complaints, upvotes } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { zkIdentityService } from '../services/zk-identity.js';

const router = Router();

// Upvote complaint
router.post('/', async (req, res) => {
  try {
    const upvoteSchema = z.object({
      complaintId: z.string(),
      zkProof: z.object({
        proof: z.string(),
        publicSignals: z.array(z.string()),
        timestamp: z.number()
      })
    });

    const validationResult = upvoteSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid upvote data',
        details: validationResult.error.errors
      });
    }

    const { complaintId, zkProof } = validationResult.data;

    // Verify ZK proof
    const isValidProof = await zkIdentityService.verifyProof(zkProof, 'upvote');
    if (!isValidProof) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ZK proof'
      });
    }

    // Generate nullifier hash to prevent double voting
    const nullifierHash = await zkIdentityService.generateNullifierHash(zkProof.proof);

    // Check if already voted
    const existingUpvote = await db.select()
      .from(upvotes)
      .where(eq(upvotes.nullifierHash, nullifierHash));

    if (existingUpvote.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'You have already upvoted this complaint'
      });
    }

    // Find complaint by reference ID
    const complaint = await db.select()
      .from(complaints)
      .where(eq(complaints.referenceId, complaintId));

    if (!complaint.length) {
      return res.status(404).json({
        success: false,
        error: 'Complaint not found'
      });
    }

    // Add upvote
    await db.insert(upvotes).values({
      complaintId: complaint[0].id,
      zkProof: JSON.stringify(zkProof),
      nullifierHash
    });

    // Update complaint upvote count
    await db.update(complaints)
      .set({ 
        upvotes: complaint[0].upvotes + 1,
        updatedAt: new Date()
      })
      .where(eq(complaints.id, complaint[0].id));

    res.json({
      success: true,
      message: 'Upvote recorded successfully'
    });

  } catch (error) {
    console.error('Failed to process upvote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process upvote'
    });
  }
});

export default router;
