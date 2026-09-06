/**
 * File: indexedDB.js
 * Date: 2026-09-04
 * Purpose: IndexedDB operations for storing encrypted master key and PIN
 * Description: Save, load, and delete user data from browser's IndexedDB
 * Author: Ekso Team
 */

const DB_NAME = 'EksoDB';
const DB_VERSION = 1;
const STORE_NAME = 'userData';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveUserData = async (data) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ id: 'user', ...data });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const loadUserData = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('user');

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

export const deleteUserData = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete('user');

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// ===== НОВЫЕ ФУНКЦИИ ДЛЯ PIN =====

export const savePin = async (pin) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ id: 'pin', value: pin });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getPinFromDB = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('pin');

    request.onsuccess = () => resolve(request.result?.value || null);
    request.onerror = () => reject(request.error);
  });
};