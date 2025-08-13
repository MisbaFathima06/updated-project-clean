import CryptoJS from 'crypto-js';

export interface EncryptionResult {
  encryptedData: string;
  salt: string;
  iv: string;
}

// Generate a random encryption key
export function generateEncryptionKey(): string {
  return CryptoJS.lib.WordArray.random(256/8).toString();
}

// Encrypt data using AES-256-GCM
export function encryptData(data: string, key?: string): EncryptionResult {
  const encryptionKey = key || generateEncryptionKey();
  const salt = CryptoJS.lib.WordArray.random(128/8);
  const iv = CryptoJS.lib.WordArray.random(128/8);
  
  // Derive key using PBKDF2
  const derivedKey = CryptoJS.PBKDF2(encryptionKey, salt, {
    keySize: 256/32,
    iterations: 1000
  });
  
  // Encrypt using AES
  const encrypted = CryptoJS.AES.encrypt(data, derivedKey, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  
  return {
    encryptedData: encrypted.toString(),
    salt: salt.toString(),
    iv: iv.toString()
  };
}

// Decrypt data
export function decryptData(
  encryptedData: string, 
  key: string, 
  salt: string, 
  iv: string
): string {
  // Derive key using PBKDF2
  const derivedKey = CryptoJS.PBKDF2(key, CryptoJS.enc.Hex.parse(salt), {
    keySize: 256/32,
    iterations: 1000
  });
  
  // Decrypt using AES
  const decrypted = CryptoJS.AES.decrypt(encryptedData, derivedKey, {
    iv: CryptoJS.enc.Hex.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  
  return decrypted.toString(CryptoJS.enc.Utf8);
}

// Generate hash of data for integrity verification
export function generateHash(data: string): string {
  return CryptoJS.SHA256(data).toString();
}

// Encrypt file data
export function encryptFile(fileData: ArrayBuffer, key?: string): EncryptionResult {
  const base64Data = arrayBufferToBase64(fileData);
  return encryptData(base64Data, key);
}

// Decrypt file data
export function decryptFile(
  encryptedData: string, 
  key: string, 
  salt: string, 
  iv: string
): ArrayBuffer {
  const decryptedBase64 = decryptData(encryptedData, key, salt, iv);
  return base64ToArrayBuffer(decryptedBase64);
}

// Utility functions
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
