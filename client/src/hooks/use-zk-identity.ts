
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { apiRequest } from '@/lib/queryClient';

export interface ZkIdentity {
  identityId?: string;
  commitment: string;
  nullifierHash: string;
  trapdoor: string;
  nullifier: string;
  groupId: string;
  isValid: boolean;
}

export interface ZKProof {
  proof: string;
  publicSignals: string[];
  nullifierHash: string;
  timestamp: number;
}

export function useZkIdentity() {
  const [identity, setIdentity] = useState<ZkIdentity | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Load existing identity from localStorage
  useEffect(() => {
    const savedIdentity = localStorage.getItem('speaksecure-zk-identity');
    if (savedIdentity) {
      try {
        const parsed = JSON.parse(savedIdentity);
        setIdentity(parsed);
        console.log('✅ ZK Identity loaded from storage:', parsed.commitment?.substring(0, 8) + '...');
      } catch (error) {
        console.error('Failed to parse saved identity:', error);
        localStorage.removeItem('speaksecure-zk-identity');
      }
    }
  }, []);

  // Generate cryptographic components
  const generateRandomField = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return '0x' + Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const generateCommitment = async (trapdoor: string, nullifier: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(trapdoor + nullifier);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const generateNullifierHash = async (nullifier: string, groupId: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(nullifier + groupId);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const generateIdentity = useCallback(async (): Promise<ZkIdentity> => {
    if (identity) return identity;
    
    setIsGenerating(true);
    
    try {
      console.log('🔐 Generating Zero-Knowledge Identity...');
      
      // Generate cryptographic parameters
      const trapdoor = generateRandomField();
      const nullifier = generateRandomField();
      const groupId = 'speaksecure-v1';
      
      const commitment = await generateCommitment(trapdoor, nullifier);
      const nullifierHash = await generateNullifierHash(nullifier, groupId);
      
      // Register identity with backend
      const response = await apiRequest('/zk/identity', {
        method: 'POST',
        body: JSON.stringify({
          commitment,
          nullifierHash,
          groupId
        })
      });

      const data = response;
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to register ZK identity');
      }

      const newIdentity: ZkIdentity = {
        identityId: data.data?.identityId,
        commitment,
        nullifierHash,
        trapdoor,
        nullifier,
        groupId,
        isValid: true
      };

      // Save to localStorage and state
      localStorage.setItem('speaksecure-zk-identity', JSON.stringify(newIdentity));
      setIdentity(newIdentity);

      console.log('✅ ZK Identity Generated Successfully');
      toast({
        title: "Identity Generated",
        description: "Your anonymous identity is ready for secure reporting",
      });

      return newIdentity;
    } catch (error) {
      console.error('ZK identity generation failed:', error);
      toast({
        title: "Identity Generation Failed",
        description: "Failed to generate cryptographic identity. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [identity, toast]);

  const generateProofForAction = useCallback(async (action: string, data?: any): Promise<ZKProof> => {
    if (!identity) {
      throw new Error('No ZK identity found. Please generate one first.');
    }

    try {
      const response = await apiRequest('/zk/generate-proof', {
        method: 'POST',
        body: JSON.stringify({ 
          action, 
          data,
          commitment: identity.commitment,
          nullifier: identity.nullifier
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate ZK proof');
      }

      return {
        proof: result.proof.proof,
        publicSignals: result.proof.publicSignals,
        nullifierHash: result.proof.nullifierHash || identity.nullifierHash,
        timestamp: result.proof.timestamp || Date.now()
      };
    } catch (error) {
      console.error('ZK proof generation failed:', error);
      toast({
        title: "Proof Generation Failed",
        description: "Failed to generate cryptographic proof",
        variant: "destructive"
      });
      throw error;
    }
  }, [identity, toast]);

  const clearIdentity = useCallback(() => {
    localStorage.removeItem('speaksecure-zk-identity');
    setIdentity(null);
  }, []);

  return {
    identity,
    generateIdentity,
    generateProofForAction,
    clearIdentity,
    isGenerating
  };
}
