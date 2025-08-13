// Blockchain integration for complaint hash logging

// Generate hash for complaint data
export async function generateHash(data: any): Promise<string> {
  const encoder = new TextEncoder();
  const dataString = JSON.stringify(data);
  const dataBuffer = encoder.encode(dataString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export interface BlockchainLogResult {
  transactionHash: string;
  blockNumber: number;
  gasUsed: number;
}

// Ethereum configuration
const ETHEREUM_RPC_URL = process.env.VITE_ETHEREUM_RPC_URL || "https://sepolia.infura.io/v3/your-project-id";
const CONTRACT_ADDRESS = process.env.VITE_CONTRACT_ADDRESS || "0x..."; // Deploy contract and set address
const PRIVATE_KEY = process.env.VITE_PRIVATE_KEY || ""; // For signing transactions

// Smart contract ABI (simplified)
const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "complaintHash", "type": "string" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "logComplaint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "hash", "type": "string" }],
    "name": "getComplaintTimestamp",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

// Log complaint hash to blockchain
export async function logComplaintToBlockchain(complaintHash: string): Promise<BlockchainLogResult> {
  try {
    // For demo purposes, simulate blockchain logging
    // In production, use ethers.js or web3.js with actual smart contract

    const simulatedResult = {
      transactionHash: "0x" + Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0')).join(''),
      blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
      gasUsed: Math.floor(Math.random() * 50000) + 21000
    };

    // Log to backend for persistence
    await fetch("/api/blockchain/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hash: complaintHash,
        transactionHash: simulatedResult.transactionHash,
        blockNumber: simulatedResult.blockNumber,
      }),
    });

    return simulatedResult;
  } catch (error) {
    console.error('Blockchain logging error:', error);
    throw new Error('Failed to log to blockchain');
  }
}

// Verify complaint hash on blockchain
export async function verifyComplaintOnBlockchain(complaintHash: string): Promise<boolean> {
  try {
    // In production, query the smart contract
    // For demo, simulate verification
    return true;
  } catch (error) {
    console.error('Blockchain verification error:', error);
    return false;
  }
}

// Get transaction details
export async function getTransactionDetails(txHash: string): Promise<any> {
  try {
    // In production, use ethers.js to get transaction details
    return {
      hash: txHash,
      blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
      from: "0x" + Array.from(crypto.getRandomValues(new Uint8Array(20)))
        .map(b => b.toString(16).padStart(2, '0')).join(''),
      to: CONTRACT_ADDRESS,
      gasUsed: Math.floor(Math.random() * 50000) + 21000,
      status: 1,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Transaction details error:', error);
    throw new Error('Failed to get transaction details');
  }
}

// Generate blockchain explorer URL
export function getBlockchainExplorerUrl(txHash: string): string {
  return `https://sepolia.etherscan.io/tx/${txHash}`;
}