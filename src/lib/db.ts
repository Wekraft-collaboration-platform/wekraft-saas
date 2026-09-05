"use client";

/**
 * A lightweight IndexedDB wrapper for high-performance chat caching.
 * Persistent storage with significantly higher limits than localStorage.
 *
 * TTL Policy:
 * - Cache entries older than 1 hour are treated as stale and re-fetched from server.
 * - Only the 100 most recently accessed channels are kept in IndexedDB.
 * - Messages with created_at older than 30 days are stripped from the cached list
 *   so the local cache stays in sync with the server's 30-day retention policy.
 */

const DB_NAME = "wekraft_chat_cache";
const STORE_NAME = "messages";
const DB_VERSION = 1;
 
// How long before a cached channel is considered completely stale (hard miss)
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
 
// How long before we attempt a background refresh (soft miss)
const CACHE_SOFT_TTL_MS = 55 * 60 * 1000; // 55 minutes
 
// Mirrors the server-side 30-day message retention policy
const MESSAGE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
 
export interface CachedChat {
  channelId: string;
  messages: any[];
  nextCursor: string | null;
  lastAccessed: number;
  softExpiry?: number;
  __stale?: boolean;
}
 
export const chatDb = {
  async open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "channelId" });
          store.createIndex("lastAccessed", "lastAccessed", { unique: false });
        }
      };
    });
  },
 
  /**
   * Retrieves a cached channel's messages.
   * Returns null if the cache is older than CACHE_TTL_MS (hard miss).
   * If it's between CACHE_SOFT_TTL_MS and CACHE_TTL_MS, returns with __stale: true.
   */
  async get(channelId: string): Promise<CachedChat | null> {
    const db = await this.open();
    const result = await new Promise<CachedChat | null>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(channelId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
 
    if (!result) return null;
 
    const now = Date.now();
 
    // Hard TTL check: treat cache as miss if it's older than 24 hours
    if (now - result.lastAccessed > CACHE_TTL_MS) {
      return null;
    }
 
    // Strip messages older than 30 days to stay consistent with server retention
    const cutoff = now - MESSAGE_MAX_AGE_MS;
    const filteredMessages = result.messages.filter(
      (m: any) => (m.created_at ?? 0) >= cutoff
    );
 
    // If we filtered some out, persist the cleaner list back
    if (filteredMessages.length !== result.messages.length) {
      this.set(channelId, filteredMessages, result.nextCursor).catch(() => {});
    }
 
    const isStale = now > (result.softExpiry ?? (result.lastAccessed + CACHE_SOFT_TTL_MS));
 
    return { 
      ...result, 
      messages: filteredMessages,
      __stale: isStale
    };
  },
 
  /**
   * Persists a channel's messages to IndexedDB.
   * Automatically strips messages older than 30 days before saving.
   */
  async set(channelId: string, messages: any[], nextCursor: string | null) {
    const db = await this.open();
 
    // Never cache messages older than 30 days
    const cutoff = Date.now() - MESSAGE_MAX_AGE_MS;
    const freshMessages = messages.filter((m: any) => (m.created_at ?? 0) >= cutoff);
    const now = Date.now();
 
    const chat: CachedChat = {
      channelId,
      messages: freshMessages,
      nextCursor,
      lastAccessed: now,
      softExpiry: now + CACHE_SOFT_TTL_MS,
    };
 
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      store.put(chat);
      transaction.oncomplete = () => {
        // Trigger pruning in background after a successful set
        this.prune().catch(() => {});
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
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
        // Open cursor in ascending order (oldest first) to delete the least recently used
        const cursorRequest = index.openCursor(null, "next");
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
  },

  /**
   * Clears all cached data for a specific channel.
   * Call this after a message is deleted or a channel is left.
   */
  async clear(channelId: string) {
    const db = await this.open();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      store.delete(channelId);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  /**
   * Clears ALL cached chat data. Useful for sign-out or cache invalidation.
   */
  async clearAll() {
    const db = await this.open();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      store.clear();
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },
};
