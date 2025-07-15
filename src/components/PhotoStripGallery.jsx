import React, { useState, useEffect } from 'react';
import { Download, Share2, Trash2, Calendar, Layout } from 'lucide-react';
import storageManager from '../utils/localStorage';
import { toast } from 'react-hot-toast';

const PhotoStripGallery = ({ userId }) => {
  const [strips, setStrips] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStrips();
  }, [userId, filter]);

  const loadStrips = async () => {
    setLoading(true);
    try {
      let allStrips = storageManager.getPhotoStrips();
      
      // Apply filters
      if (filter !== 'all') {
        allStrips = allStrips.filter(strip => strip.layout === filter);
      }
      
      // Sort by newest first
      allStrips.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setStrips(allStrips);
    } catch (error) {
      console.error('Error loading strips:', error);
      toast.error('Failed to load photo strips');
    } finally {
      setLoading(false);
    }
  };

  const downloadStrip = (strip) => {
    try {
      const link = document.createElement('a');
      link.href = strip.stripImage;
      link.download = `photobooth-strip-${strip.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Photo strip downloaded! 📸');
    } catch (error) {
      console.error('Error downloading strip:', error);
      toast.error('Failed to download photo strip');
    }
  };

  const shareStrip = async (strip) => {
    if (navigator.share) {
      try {
        const blob = await fetch(strip.stripImage).then(r => r.blob());
        const file = new File([blob], 'photo-strip.jpg', { type: 'image/jpeg' });
        
        await navigator.share({
          title: 'Check out my photo strip!',
          files: [file]
        });
        toast.success('Photo strip shared! 📤');
      } catch (error) {
        console.error('Error sharing:', error);
        toast.error('Failed to share photo strip');
      }
    } else {
      // Fallback - copy to clipboard or show message
      toast.info('Sharing not supported on this device');
    }
  };

  const deleteStrip = async (id) => {
    if (window.confirm('Are you sure you want to delete this photo strip?')) {
      try {
        await storageManager.deletePhotoStrip(id);
        toast.success('Photo strip deleted');
        loadStrips();
      } catch (error) {
        console.error('Error deleting strip:', error);
        toast.error('Failed to delete photo strip');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center">
            <Layout className="w-6 h-6 mr-2" />
            My Photo Strips
          </h2>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Layouts</option>
            <option value="classic">Classic Strips</option>
            <option value="horizontal">Horizontal</option>
            <option value="grid">Grid Layout</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        </div>
      ) : strips.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">No photo strips yet!</p>
          <p className="text-sm text-gray-400 mt-2">Create your first one in the photobooth</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strips.map((strip) => (
            <div key={strip.id} className="bg-white rounded-lg shadow-md overflow-hidden group">
              <div className="aspect-w-3 aspect-h-4 bg-gray-100">
                <img
                  src={strip.stripImage}
                  alt="Photo strip"
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(strip.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    {strip.layout}
                  </span>
                </div>
                
                <div className="flex justify-around pt-2 border-t">
                  <button
                    onClick={() => downloadStrip(strip)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => shareStrip(strip)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Share"
                  >
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => deleteStrip(strip.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoStripGallery;