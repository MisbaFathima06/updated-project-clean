
import { Router } from 'express';
import { z } from 'zod';
import { zkIdentityService } from '../services/zk-identity.js';
import { storage } from '../storage.js';

const router = Router();

// Register ZK Identity
router.post('/identity', async (req, res) => {
  try {
    const identitySchema = z.object({
      commitment: z.string().min(1),
      nullifierHash: z.string().min(1),
      groupId: z.string().default('speaksecure-v1')
    });

    const validationResult = identitySchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid identity data',
        details: validationResult.error.errors
      });
    }

    const { commitment, nullifierHash, groupId } = validationResult.data;

    // Check if identity already exists
    const existingIdentity = await storage.getZkIdentityByCommitment(commitment);
    if (existingIdentity) {
      return res.json({
        success: true,
        data: {
          identityId: existingIdentity.id,
          commitment: existingIdentity.commitment
        }
      });
    }

    // Create new identity
    const newIdentity = await storage.createZkIdentity({
      commitment,
      nullifierHash,
      groupId
    });
    const identityId = newIdentity.id;

    console.log('✅ ZK Identity registered:', commitment.substring(0, 8) + '...');

    res.json({
      success: true,
      data: {
        identityId,
        commitment
      }
    });

  } catch (error) {
    console.error('ZK Identity registration failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register ZK identity'
    });
  }
});

// Generate ZK proof
router.post('/generate-proof', async (req, res) => {
  try {
    const proofSchema = z.object({
      action: z.string().min(1),
      data: z.any().optional(),
      commitment: z.string().min(1),
      nullifier: z.string().min(1),
      groupId: z.string().default('speaksecure-v1')
    });

    const validationResult = proofSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid proof request',
        details: validationResult.error.errors
      });
    }

    const { action, data, commitment, nullifier } = validationResult.data;

    // Verify identity exists
    const identity = await storage.getZkIdentityByCommitment(commitment);
    if (!identity) {
      return res.status(400).json({
        success: false,
        error: 'Invalid commitment'
      });
    }

    // Generate proof
    const proof = await zkIdentityService.generateProof(action, data);
    
    // Generate action-specific nullifier
    const actionNullifierHash = await zkIdentityService.generateActionNullifierHash(
      nullifier, 
      action, 
      data?.topic || ''
    );

    console.log('✅ ZK Proof generated for action:', action);

    res.json({
      success: true,
      proof: {
        ...proof,
        nullifierHash: actionNullifierHash
      }
    });

  } catch (error) {
    console.error('ZK proof generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate ZK proof'
    });
  }
});

// Verify ZK proof
router.post('/verify-proof', async (req, res) => {
  try {
    const verifySchema = z.object({
      proof: z.object({
        proof: z.string(),
        publicSignals: z.array(z.string()),
        timestamp: z.number()
      }),
      expectedAction: z.string()
    });

    const validationResult = verifySchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification request',
        details: validationResult.error.errors
      });
    }

    const { proof, expectedAction } = validationResult.data;
    const isValid = await zkIdentityService.verifyProof(proof, expectedAction);

    res.json({
      success: true,
      valid: isValid
    });

  } catch (error) {
    console.error('ZK proof verification failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify ZK proof'
    });
  }
});

// Verify nullifier hasn't been used
router.post('/verify', async (req, res) => {
  try {
    const { commitment, nullifierHash, topic } = req.body;
    
    // Verify commitment exists
    const identity = await storage.getZkIdentityByCommitment(commitment);
    if (!identity) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid commitment' 
      });
    }

    // Check if nullifier has been used for this action
    const isUsed = await storage.checkNullifierUsed(nullifierHash, 'identity_verification', topic || '');
    if (isUsed) {
      return res.status(400).json({ 
        success: false,
        error: 'Nullifier already used' 
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('ZK verification failed:', error);
    res.status(500).json({ 
      success: false,
      error: 'ZK verification failed' 
    });
  }
});

export default router;
