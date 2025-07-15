import { openDB } from 'idb';

const DB_NAME = 'PhotoboothStripsDB';
const STORE_NAME = 'photoStrips';
const DB_VERSION = 1;

class PhotoStripStorage {
  async initDB() {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('userId', 'userId');
          store.createIndex('layout', 'layout');
          store.createIndex('theme', 'theme');
        }
      },
    });
  }

  async savePhotoStrip(stripData) {
    if (!this.db) await this.initDB();
    
    const photoStrip = {
      ...stripData,
      timestamp: new Date().toISOString(),
      id: Date.now(),
    };
    
    await this.db.add(STORE_NAME, photoStrip);
    return photoStrip;
  }

  async getPhotoStrips(userId = null) {
    if (!this.db) await this.initDB();
    
    if (userId) {
      return await this.db.getAllFromIndex(STORE_NAME, 'userId', userId);
    }
    return await this.db.getAll(STORE_NAME);
  }

  async getPhotoStrip(id) {
    if (!this.db) await this.initDB();
    return await this.db.get(STORE_NAME, id);
  }

  async deletePhotoStrip(id) {
    if (!this.db) await this.initDB();
    await this.db.delete(STORE_NAME, id);
  }

  async updatePhotoStrip(id, updates) {
    if (!this.db) await this.initDB();
    const strip = await this.getPhotoStrip(id);
    if (strip) {
      const updated = { ...strip, ...updates };
      await this.db.put(STORE_NAME, updated);
      return updated;
    }
    return null;
  }
}

export const photoStripStorage = new PhotoStripStorage();