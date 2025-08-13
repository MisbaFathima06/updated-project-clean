// IPFS integration for decentralized storage

export interface IpfsUploadResult {
  cid: string;
  size: number;
  url: string;
}

// IPFS Configuration - Use runtime values instead of process.env
const IPFS_API_URL = 'https://ipfs.infura.io:5001';
const IPFS_PROJECT_ID = import.meta.env.VITE_IPFS_PROJECT_ID;
const IPFS_PROJECT_SECRET = import.meta.env.VITE_IPFS_PROJECT_SECRET;

// Upload encrypted data to IPFS
export async function uploadToIpfs(data: string | ArrayBuffer): Promise<IpfsUploadResult> {
  try {
    const formData = new FormData();

    if (typeof data === 'string') {
      const blob = new Blob([data], { type: 'text/plain' });
      formData.append('file', blob);
    } else {
      const blob = new Blob([data]);
      formData.append('file', blob);
    }

    const auth = btoa(`${IPFS_PROJECT_ID}:${IPFS_PROJECT_SECRET}`);

    const response = await fetch(`${IPFS_API_URL}/api/v0/add`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`IPFS upload failed: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      cid: result.Hash,
      size: result.Size,
      url: `https://ipfs.io/ipfs/${result.Hash}`,
    };
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error('Failed to upload to IPFS');
  }
}

// Retrieve data from IPFS
export async function retrieveFromIpfs(cid: string): Promise<string> {
  try {
    const response = await fetch(`https://ipfs.io/ipfs/${cid}`);

    if (!response.ok) {
      throw new Error(`IPFS retrieval failed: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error('IPFS retrieval error:', error);
    throw new Error('Failed to retrieve from IPFS');
  }
}

// Pin content to ensure persistence
export async function pinToIpfs(cid: string): Promise<void> {
  try {
    const auth = btoa(`${IPFS_PROJECT_ID}:${IPFS_PROJECT_SECRET}`);

    const response = await fetch(`${IPFS_API_URL}/api/v0/pin/add?arg=${cid}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });

    if (!response.ok) {
      throw new Error(`IPFS pinning failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error('IPFS pinning error:', error);
    // Don't throw here as pinning failure shouldn't break the upload
  }
}

// Upload file to IPFS
export async function uploadFileToIpfs(file: File): Promise<IpfsUploadResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const auth = btoa(`${IPFS_PROJECT_ID}:${IPFS_PROJECT_SECRET}`);

    const response = await fetch(`${IPFS_API_URL}/api/v0/add`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`File upload to IPFS failed: ${response.statusText}`);
    }

    const result = await response.json();

    // Pin the content
    await pinToIpfs(result.Hash);

    return {
      cid: result.Hash,
      size: result.Size,
      url: `https://ipfs.io/ipfs/${result.Hash}`,
    };
  } catch (error) {
    console.error('File upload to IPFS error:', error);
    throw new Error('Failed to upload file to IPFS');
  }
}