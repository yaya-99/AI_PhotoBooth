/**
 * Local Storage Utility for Photo Strips
 * Handles local storage operations with Firebase fallback option
 */

import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
  PHOTO_STRIPS: 'photobooth_strips',
  SETTINGS: 'photobooth_settings',
  USER_PREFERENCES: 'photobooth_preferences'
};

// Default settings
const DEFAULT_SETTINGS = {
  theme: 'classic',
  layout: 'classic',
  autoSave: true,
  quality: 'high',
  storageType: 'local' // 'local' or 'firebase'
};

/**
 * Storage Manager Class
 * Handles both local storage and Firebase storage operations
 */
class StorageManager {
  constructor() {
    this.storageType = this.getSettings().storageType || 'local';
    this.initializeStorage();
  }

  /**
   * Initialize storage based on type
   */
  initializeStorage() {
    if (this.storageType === 'local') {
      this.ensureLocalStorageStructure();
    }
    // Firebase initialization would go here in future phases
  }

  /**
   * Ensure local storage has proper structure
   */
  ensureLocalStorageStructure() {
    if (!localStorage.getItem(STORAGE_KEYS.PHOTO_STRIPS)) {
      localStorage.setItem(STORAGE_KEYS.PHOTO_STRIPS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)) {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify({}));
    }
  }

  /**
   * Save a photo strip to storage
   * @param {Object} stripData - Photo strip data
   * @returns {Promise<string>} - Strip ID
   */
  async savePhotoStrip(stripData) {
    try {
      const stripId = uuidv4();
      const timestamp = new Date().toISOString();
      
      const photoStrip = {
        id: stripId,
        ...stripData,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      if (this.storageType === 'local') {
        return await this.saveStripLocally(photoStrip);
      } else {
        // Firebase save logic would go here
        return await this.saveStripToFirebase(photoStrip);
      }
    } catch (error) {
      console.error('Error saving photo strip:', error);
      throw error;
    }
  }

  /**
   * Save strip to local storage
   * @param {Object} photoStrip - Photo strip object
   * @returns {Promise<string>} - Strip ID
   */
  async saveStripLocally(photoStrip) {
    const strips = this.getPhotoStrips();
    strips.push(photoStrip);
    localStorage.setItem(STORAGE_KEYS.PHOTO_STRIPS, JSON.stringify(strips));
    return photoStrip.id;
  }

  /**
   * Get all photo strips
   * @returns {Array} - Array of photo strips
   */
  getPhotoStrips() {
    try {
      if (this.storageType === 'local') {
        const strips = localStorage.getItem(STORAGE_KEYS.PHOTO_STRIPS);
        return strips ? JSON.parse(strips) : [];
      } else {
        // Firebase get logic would go here
        return [];
      }
    } catch (error) {
      console.error('Error getting photo strips:', error);
      return [];
    }
  }

  /**
   * Get a specific photo strip by ID
   * @param {string} stripId - Strip ID
   * @returns {Object|null} - Photo strip object or null
   */
  getPhotoStripById(stripId) {
    const strips = this.getPhotoStrips();
    return strips.find(strip => strip.id === stripId) || null;
  }

  /**
   * Delete a photo strip
   * @param {string} stripId - Strip ID
   * @returns {Promise<boolean>} - Success status
   */
  async deletePhotoStrip(stripId) {
    try {
      if (this.storageType === 'local') {
        const strips = this.getPhotoStrips();
        const filteredStrips = strips.filter(strip => strip.id !== stripId);
        localStorage.setItem(STORAGE_KEYS.PHOTO_STRIPS, JSON.stringify(filteredStrips));
        return true;
      } else {
        // Firebase delete logic would go here
        return await this.deleteStripFromFirebase(stripId);
      }
    } catch (error) {
      console.error('Error deleting photo strip:', error);
      return false;
    }
  }

  /**
   * Update a photo strip
   * @param {string} stripId - Strip ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<boolean>} - Success status
   */
  async updatePhotoStrip(stripId, updateData) {
    try {
      if (this.storageType === 'local') {
        const strips = this.getPhotoStrips();
        const stripIndex = strips.findIndex(strip => strip.id === stripId);
        
        if (stripIndex !== -1) {
          strips[stripIndex] = {
            ...strips[stripIndex],
            ...updateData,
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem(STORAGE_KEYS.PHOTO_STRIPS, JSON.stringify(strips));
          return true;
        }
        return false;
      } else {
        // Firebase update logic would go here
        return await this.updateStripInFirebase(stripId, updateData);
      }
    } catch (error) {
      console.error('Error updating photo strip:', error);
      return false;
    }
  }

  /**
   * Get settings
   * @returns {Object} - Settings object
   */
  getSettings() {
    try {
      const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error getting settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Update settings
   * @param {Object} newSettings - New settings
   * @returns {Promise<boolean>} - Success status
   */
  async updateSettings(newSettings) {
    try {
      const currentSettings = this.getSettings();
      const updatedSettings = { ...currentSettings, ...newSettings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
      
      // Update storage type if changed
      if (newSettings.storageType && newSettings.storageType !== this.storageType) {
        this.storageType = newSettings.storageType;
        this.initializeStorage();
      }
      
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  }

  /**
   * Get storage statistics
   * @returns {Object} - Storage statistics
   */
  getStorageStats() {
    const strips = this.getPhotoStrips();
    const totalStrips = strips.length;
    const totalPhotos = strips.reduce((sum, strip) => sum + (strip.photos?.length || 0), 0);
    
    // Calculate approximate storage size
    const storageSize = new Blob([JSON.stringify(strips)]).size;
    
    return {
      totalStrips,
      totalPhotos,
      storageSize,
      storageType: this.storageType,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Clear all data (with confirmation)
   * @returns {Promise<boolean>} - Success status
   */
  async clearAllData() {
    try {
      if (this.storageType === 'local') {
        localStorage.removeItem(STORAGE_KEYS.PHOTO_STRIPS);
        localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
        this.ensureLocalStorageStructure();
        return true;
      } else {
        // Firebase clear logic would go here
        return await this.clearFirebaseData();
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  /**
   * Export data for backup
   * @returns {Object} - Exported data
   */
  exportData() {
    return {
      strips: this.getPhotoStrips(),
      settings: this.getSettings(),
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  /**
   * Import data from backup
   * @param {Object} data - Imported data
   * @returns {Promise<boolean>} - Success status
   */
  async importData(data) {
    try {
      if (data.strips && Array.isArray(data.strips)) {
        localStorage.setItem(STORAGE_KEYS.PHOTO_STRIPS, JSON.stringify(data.strips));
      }
      
      if (data.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Future Firebase methods (placeholder for Phase 6)
  async saveStripToFirebase(photoStrip) {
    // Implementation for Firebase storage
    throw new Error('Firebase storage not implemented yet');
  }

  async deleteStripFromFirebase(stripId) {
    // Implementation for Firebase deletion
    throw new Error('Firebase storage not implemented yet');
  }

  async updateStripInFirebase(stripId, updateData) {
    // Implementation for Firebase update
    throw new Error('Firebase storage not implemented yet');
  }

  async clearFirebaseData() {
    // Implementation for Firebase clear
    throw new Error('Firebase storage not implemented yet');
  }
}

// Create singleton instance
const storageManager = new StorageManager();

export default storageManager;

// Export individual functions for convenience
export const {
  savePhotoStrip,
  getPhotoStrips,
  getPhotoStripById,
  deletePhotoStrip,
  updatePhotoStrip,
  getSettings,
  updateSettings,
  getStorageStats,
  clearAllData,
  exportData,
  importData
} = storageManager;
