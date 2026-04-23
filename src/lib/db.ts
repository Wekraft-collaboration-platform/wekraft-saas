"use client";

/**
 * A lightweight IndexedDB wrapper for high-performance chat caching.
 * Persistent storage with significantly higher limits than localStorage.
 */

const DB_NAME = "wekraft_chat_cache";
const STORE_NAME = "messages";
const DB_VERSION = 1;

export interface CachedChat {
  channelId: string;
  messages: any[];
  nextCursor: string | null;
  lastAccessed: number;
}

export const chatDb = {
  async open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "channelId" });
          store.createIndex("lastAccessed", "lastAccessed", { unique: false });
        }
      };
    });
  },

  async get(channelId: string): Promise<CachedChat | null> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(channelId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  },

  async set(channelId: string, messages: any[], nextCursor: string | null) {
    const db = await this.open();
    const chat: CachedChat = {
      channelId,
      messages,
      nextCursor,
      lastAccessed: Date.now(),
    };

    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(chat);
      
      transaction.oncomplete = () => {
        // Trigger pruning in background after a successful set
        this.prune();
        resolve();
      };
      transaction.onerror = () => reject(request.error);
    });
  },

  /**
   * Keeps only the 100 most recently accessed channels to prevent unbounded growth.
   */
  async prune(maxChannels = 100) {
    const db = await this.open();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("lastAccessed");
    
    const countRequest = store.count();
    countRequest.onsuccess = () => {
      if (countRequest.result > maxChannels) {
        const toDelete = countRequest.result - maxChannels;
        const cursorRequest = index.openCursor();
        let deleted = 0;
        
        cursorRequest.onsuccess = () => {
          const cursor = cursorRequest.result;
          if (cursor && deleted < toDelete) {
            cursor.delete();
            deleted++;
            cursor.continue();
          }
        };
      }
    };
  }
};
