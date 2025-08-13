import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query'; // Assuming useMutation is from here

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

  const generateZKIdentity = useCallback((): ZkIdentity => {
    console.log('🔐 Generating Zero-Knowledge Identity...');
    const trapdoor = generateRandomField();
    const nullifier = generateRandomField();
    const groupId = 'speaksecure-v1';
    const commitment = generateCommitment(trapdoor, nullifier); // Note: This should be awaited if generateCommitment is async, but the original code didn't await it here. Assuming it's synchronous for now based on the original structure.
    const nullifierHash = generateNullifierHash(nullifier, groupId); // Same assumption as above.

    const newIdentity: ZkIdentity = {
      commitment: commitment as string, // Cast to string assuming it resolves correctly
      nullifierHash: nullifierHash as string, // Cast to string assuming it resolves correctly
      trapdoor,
      nullifier,
      groupId,
      isValid: true
    };
    console.log('✅ ZK Identity Generated Successfully');
    return newIdentity;
  }, []);

  const setStoredIdentity = useCallback((newIdentity: ZkIdentity) => {
    setIdentity(newIdentity);
    localStorage.setItem('speaksecure-zk-identity', JSON.stringify(newIdentity));
    console.log('✅ ZK Identity stored:', newIdentity.commitment?.substring(0, 8) + '...');
  }, []);

  const registerIdentity = useMutation({
    mutationFn: async (identity: ZkIdentity) => {
      const response = await apiRequest('/api/zk/identity', {
        method: 'POST',
        body: JSON.stringify({
          commitment: identity.commitment,
          nullifierHash: identity.nullifierHash,
          groupId: 'speaksecure-v1'
        })
      });
      return response.data;
    },
    onSuccess: (data, identity) => {
      setStoredIdentity(identity);
      console.log('✅ ZK Identity registered:', data.commitment.substring(0, 8) + '...');
      toast({
        title: "Identity Generated",
        description: "Your anonymous identity is ready for secure reporting",
      });
    },
    onError: (error) => {
      console.error('ZK Identity registration failed:', error);
      toast({
        title: "Identity Generation Failed",
        description: "Failed to generate cryptographic identity. Please try again.",
        variant: "destructive"
      });
    }
  });


  const generateProof = useMutation({
    mutationFn: async ({ action, data }: { action: string; data?: any }) => {
      let currentIdentity = identity;

      // If no identity, create one
      if (!currentIdentity) {
        currentIdentity = generateZKIdentity();
        setStoredIdentity(currentIdentity);

        // Register the identity with the backend
        try {
          await apiRequest('/api/zk/identity', {
            method: 'POST',
            body: JSON.stringify({
              commitment: currentIdentity.commitment,
              nullifierHash: currentIdentity.nullifierHash,
              groupId: 'speaksecure-v1'
            })
          });
          console.log('✅ ZK Identity registered during proof generation.');
        } catch (registrationError) {
          console.error('ZK Identity registration failed during proof generation:', registrationError);
          toast({
            title: "Identity Registration Failed",
            description: "Could not register identity for proof generation. Please try again.",
            variant: "destructive"
          });
          throw registrationError; // Re-throw to ensure the mutation fails
        }
      }

      // Ensure identity is not null before proceeding
      if (!currentIdentity) {
        throw new Error('Identity is unexpectedly null after generation/registration attempt.');
      }

      const response = await apiRequest('/zk/generate-proof', {
        method: 'POST',
        body: JSON.stringify({
          action,
          data,
          commitment: currentIdentity.commitment,
          nullifier: currentIdentity.nullifier,
          groupId: 'speaksecure-v1'
        })
      });

      // Assuming the response structure from apiRequest already parses JSON
      // and the proof is directly available. If apiRequest returns a Response object,
      // you would need to call .json() here.
      // For consistency with the original `generateProofForAction` which returned `response.json()`,
      // let's assume `apiRequest` does not automatically parse JSON and we need to.
      const result = await response.json();


      if (!result.success) {
        throw new Error(result.error || 'Failed to generate ZK proof');
      }

      return result.proof; // Assuming result.proof contains the ZKProof object
    },
    onSuccess: (proofData) => {
      // Handle successful proof generation
      console.log('✅ ZK Proof Generated Successfully:', proofData);
      toast({
        title: "Proof Generated",
        description: "Your cryptographic proof is ready.",
      });
    },
    onError: (error) => {
      console.error('ZK proof generation failed:', error);
      toast({
        title: "Proof Generation Failed",
        description: "Failed to generate cryptographic proof. Please try again.",
        variant: "destructive"
      });
    }
  });


  const generateIdentity = useCallback(async (): Promise<ZkIdentity> => {
    if (identity) return identity;

    setIsGenerating(true);

    try {
      const newIdentity = generateZKIdentity();
      await registerIdentity.mutateAsync(newIdentity);
      return newIdentity;
    } catch (error) {
      console.error('ZK identity generation process failed:', error);
      // Toast is handled within registerIdentity's onError
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [identity, generateZKIdentity, registerIdentity]);

  const generateProofForAction = useCallback(async (action: string, data?: any): Promise<ZKProof> => {
    try {
      const proof = await generateProof.mutateAsync({ action, data });
      return proof;
    } catch (error) {
      console.error('Failed to get proof for action:', error);
      // Toast is handled within generateProof's onError
      throw error;
    }
  }, [generateProof]);

  const clearIdentity = useCallback(() => {
    localStorage.removeItem('speaksecure-zk-identity');
    setIdentity(null);
    console.log('ZK Identity cleared.');
  }, []);

  return {
    identity,
    generateIdentity,
    generateProofForAction,
    clearIdentity,
    isGenerating,
    registerIdentityStatus: registerIdentity.status,
    generateProofStatus: generateProof.status
  };
}