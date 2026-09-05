/**
 * File: encryption.js
 * Date: 2026-09-04
 * Purpose: Encryption and decryption of master key using PIN code
 * Description: Uses PBKDF2 to derive a key from PIN and AES-GCM for encryption
 * Author: Ekso Team
 */

const getKeyFromPin = async (pin, salt) => {
  const encoder = new TextEncoder();
  const pinBuffer = encoder.encode(pin);
  const saltBuffer = encoder.encode(salt);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    pinBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  );
};

export const generateSalt = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

export const generateIV = () => {
  const array = new Uint8Array(12);
  crypto.getRandomValues(array);
  return array;
};

export const encryptMasterKey = async (masterKey, pin) => {
  const salt = generateSalt();
  const iv = generateIV();
  const key = await getKeyFromPin(pin, salt);

  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encoder.encode(masterKey)
  );

  return {
    encrypted: Array.from(new Uint8Array(encrypted)),
    salt: salt,
    iv: Array.from(iv),
  };
};

export const decryptMasterKey = async (encryptedData, pin) => {
  const { encrypted, salt, iv } = encryptedData;
  const key = await getKeyFromPin(pin, salt);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(iv),
    },
    key,
    new Uint8Array(encrypted)
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
};