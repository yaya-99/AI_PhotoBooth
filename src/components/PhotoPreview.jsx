import React, { useState } from 'react';

const PhotoPreview = ({ photo, onSave, onRetake, onClose }) => {
  const [saving, setSaving] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);

  // Download photo to device
  const downloadPhoto = () => {
    setSaving(true);
    
    // Create download link
    const link = document.createElement('a');
    link.href = photo.dataURL;
    link.download = `photobooth-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSavedLocally(true);
    setSaving(false);
    
    // Show success for 2 seconds
    setTimeout(() => {
      if (onSave) onSave();
    }, 2000);
  };

  // Save to IndexedDB for offline gallery
  const saveToLocalGallery = async () => {
    setSaving(true);
    
    try {
      // Open IndexedDB
      const db = await openDB();
      const transaction = db.transaction(['photos'], 'readwrite');
      const store = transaction.objectStore('photos');
      
      // Save photo data
      const photoData = {
        id: `photo-${Date.now()}`,
        dataURL: photo.dataURL,
        timestamp: photo.timestamp || Date.now(),
        width: photo.width,
        height: photo.height,
        filters: photo.filters || [],
        metadata: photo.metadata || {}
      };
      
      await store.add(photoData);
      
      setSavedLocally(true);
      setSaving(false);
      
      // Trigger download as well
      downloadPhoto();
    } catch (error) {
      console.error('Error saving to local gallery:', error);
      setSaving(false);
    }
  };

  // Open IndexedDB
  const openDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PhotoBoothDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('photos')) {
          db.createObjectStore('photos', { keyPath: 'id' });
        }
      };
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-4xl w-full">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Photo display */}
        <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
          <img 
            src={photo.dataURL} 
            alt="Captured photo" 
            className="w-full h-auto"
          />
        </div>
        
        {/* Action buttons */}
        <div className="mt-6 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          {!savedLocally ? (
            <>
              <button
                onClick={saveToLocalGallery}
                className="btn-primary flex items-center justify-center"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
                    </svg>
                    Save Photo
                  </>
                )}
              </button>
              
              <button
                onClick={onRetake}
                className="btn-outline flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retake
              </button>
            </>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center text-green-600 mb-4">
                <svg className="w-8 h-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-lg font-semibold">Photo saved successfully!</span>
              </div>
              <button
                onClick={onRetake}
                className="btn-primary"
              >
                Take Another Photo
              </button>
            </div>
          )}
        </div>
        
        {/* Photo info */}
        <div className="mt-4 text-center text-sm text-gray-400">
          <p>Resolution: {photo.width} × {photo.height}px</p>
        </div>
      </div>
    </div>
  );
};

export default PhotoPreview;