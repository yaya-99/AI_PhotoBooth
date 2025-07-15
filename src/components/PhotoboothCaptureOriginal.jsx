import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, RotateCw, Check, X, Download, Settings, Sparkles, Timer } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  PHOTOBOOTH_LAYOUTS, 
  PHOTOBOOTH_THEMES, 
  PHOTOBOOTH_SETTINGS,
  PHOTOBOOTH_MESSAGES,
  getLayoutById,
  getThemeById,
  getRandomMessage
} from '../config/photoboothConfig';
import PhotoStripCanvas from './PhotoStripCanvas';
import storageManager from '../utils/localStorage';

const PhotoboothCapture = () => {
  const webcamRef = useRef(null);
  const [facingMode, setFacingMode] = useState('user');
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [selectedLayout, setSelectedLayout] = useState('classic');
  const [selectedTheme, setSelectedTheme] = useState('classic');
  const [showPreview, setShowPreview] = useState(false);
  const [photoStrip, setPhotoStrip] = useState(null);
  const [currentMessage, setCurrentMessage] = useState(getRandomMessage('instructions'));
  const [isFlashing, setIsFlashing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const layout = getLayoutById(selectedLayout);
  const theme = getThemeById(selectedTheme);

  // Update message periodically when not capturing
  useEffect(() => {
    if (!isCapturing && !showPreview) {
      const interval = setInterval(() => {
        const newMessage = getRandomMessage('instructions');
        console.log('New message:', newMessage); // Debug log
        setCurrentMessage(newMessage);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isCapturing, showPreview]);

  // Initialize message on mount
  useEffect(() => {
    const initialMessage = getRandomMessage('instructions');
    console.log('Initial message:', initialMessage); // Debug log
    setCurrentMessage(initialMessage);
  }, []);

  const flashEffect = () => {
    const flash = document.createElement('div');
    flash.className = 'fixed inset-0 bg-white z-50 animate-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 300);
  };

  const generatePhotoStrip = useCallback(async () => {
    // This will be handled by PhotoStripCanvas component
    // which will create the final strip with the selected layout and theme
    console.log('generatePhotoStrip called with photos:', capturedPhotos.length);
    toast.success(getRandomMessage('completion'));
  }, [capturedPhotos, layout, theme]);

  const captureNextPhoto = useCallback(() => {
    // Start countdown
    let count = 3;
    setCountdown(count);
    
    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);
      
      if (count === 0) {
        clearInterval(countdownInterval);
        
        // Capture photo
        const imageSrc = webcamRef.current.getScreenshot();
        console.log('Photo captured:', imageSrc ? 'Success' : 'Failed');
        
        setCapturedPhotos(prev => {
          const newPhotos = [...prev, imageSrc];
          console.log('Photos captured so far:', newPhotos.length, 'out of', layout.photos);
          
          return newPhotos;
        });
        
        // Flash effect
        flashEffect();
        setCountdown(null);
      }
    }, 1000);
  }, [layout.photos]);

  const startPhotoSession = useCallback(() => {
    setCapturedPhotos([]);
    setCurrentPhotoIndex(0);
    setIsCapturing(true);
    setShowPreview(false);
    setPhotoStrip(null); // Reset photo strip
    captureNextPhoto();
  }, [captureNextPhoto]);

  // Separate effect to handle photo session completion
  useEffect(() => {
    if (capturedPhotos.length > 0 && capturedPhotos.length < layout.photos && isCapturing) {
      // Continue capturing
      setTimeout(() => {
        setCurrentPhotoIndex(capturedPhotos.length);
        captureNextPhoto();
      }, 1500); // Brief pause between photos
    } else if (capturedPhotos.length === layout.photos && isCapturing) {
      // All photos captured
      console.log('All photos captured, switching to preview mode');
      setIsCapturing(false);
      setShowPreview(true);
      setTimeout(() => {
        generatePhotoStrip();
      }, 100); // Small delay to ensure state updates
    }
  }, [capturedPhotos.length, layout.photos, isCapturing, captureNextPhoto, generatePhotoStrip]);

  const retakePhotos = () => {
    setCapturedPhotos([]);
    setCurrentPhotoIndex(0);
    setShowPreview(false);
    setPhotoStrip(null);
    setCurrentMessage(getRandomMessage('instructions'));
  };

  const savePhotoStrip = async () => {
    console.log('savePhotoStrip called:', { photoStrip: !!photoStrip, capturedPhotos: capturedPhotos.length });
    if (!photoStrip || !capturedPhotos.length) {
      toast.error('No photo strip to save!');
      return;
    }

    setIsSaving(true);
    try {
      const stripData = {
        photos: capturedPhotos,
        layout: selectedLayout,
        theme: selectedTheme,
        layoutConfig: layout,
        themeConfig: theme,
        stripImage: photoStrip
      };

      const stripId = await storageManager.savePhotoStrip(stripData);
      toast.success('Photo strip saved successfully! 🎉');
      
      // Reset after successful save
      setTimeout(() => {
        retakePhotos();
      }, 2000);
    } catch (error) {
      console.error('Error saving photo strip:', error);
      toast.error('Failed to save photo strip. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const downloadPhotoStrip = () => {
    console.log('downloadPhotoStrip called:', { photoStrip: !!photoStrip });
    if (!photoStrip) {
      toast.error('No photo strip to download!');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = photoStrip;
      link.download = `photobooth-strip-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Photo strip downloaded! 📸');
    } catch (error) {
      console.error('Error downloading photo strip:', error);
      toast.error('Failed to download photo strip. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            ✨ AI PhotoBooth ✨
          </h1>
          <p className="text-gray-600 text-lg">Create beautiful memories with style</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 space-y-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Customize</h3>
                <p className="text-gray-600 text-sm mt-1">Make it yours</p>
              </div>
              
              {/* Layout Selection */}
              <div>
                <label className="block text-lg font-semibold mb-4 text-gray-800">Layout Style</label>
                <div className="space-y-3">
                  {Object.entries(PHOTOBOOTH_LAYOUTS).map(([key, layout]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedLayout(key)}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 hover:scale-105 ${
                        selectedLayout === key 
                          ? 'border-pink-400 bg-gradient-to-r from-pink-100 to-purple-100 shadow-lg' 
                          : 'border-gray-200 hover:border-pink-300 bg-white hover:shadow-md'
                      }`}
                    >
                      <div className="font-semibold text-gray-800">{layout.name}</div>
                      <div className="text-sm text-gray-500 mt-1">{layout.photos} photos</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Selection */}
              <div>
                <label className="block text-lg font-semibold mb-4 text-gray-800">Theme</label>
                <div className="space-y-3">
                  {Object.entries(PHOTOBOOTH_THEMES).map(([key, theme]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedTheme(key)}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 hover:scale-105 ${
                        selectedTheme === key 
                          ? 'border-pink-400 bg-gradient-to-r from-pink-100 to-purple-100 shadow-lg' 
                          : 'border-gray-200 hover:border-pink-300 bg-white hover:shadow-md'
                      }`}
                    >
                      <div className="font-semibold text-gray-800">{theme.name}</div>
                      <div 
                        className="h-3 mt-2 rounded-full shadow-inner"
                        style={{ backgroundColor: theme.borderColor }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Camera Switch */}
              <button
                onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}
                className="w-full p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center hover:from-gray-200 hover:to-gray-300 transition-all duration-300 hover:scale-105 shadow-md"
              >
                <RotateCw className="w-5 h-5 mr-3" />
                <span className="font-semibold">Switch Camera</span>
              </button>
            </div>
          </div>

          {/* Camera View */}
          <div className="lg:col-span-3">
            {/* Cute Message Display */}
            {!showPreview && (
              <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white p-6 rounded-t-3xl shadow-xl">
                <div className="text-center">
                  <div className="text-xl font-bold">
                    {isCapturing ? (
                      <div className="flex items-center justify-center space-x-3">
                        <Sparkles className="w-6 h-6 animate-pulse" />
                        <span>Creating your masterpiece...</span>
                        <Sparkles className="w-6 h-6 animate-pulse" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-3">
                        <Camera className="w-6 h-6" />
                        <span>{currentMessage}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-sm opacity-90 mt-2 font-medium">
                    {layout.name} • {theme.name} Theme • {layout.photos} photos
                  </div>
                </div>
              </div>
            )}
            
            <div className={`bg-white/90 backdrop-blur-sm shadow-2xl overflow-hidden border border-white/20 ${
              showPreview ? 'rounded-3xl' : 'rounded-b-3xl'
            }`}>
              {!showPreview ? (
                <div className="relative">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode }}
                    className="w-full rounded-b-3xl"
                  />

                {/* Overlay UI */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Photo counter */}
                    {isCapturing && (
                      <div className="absolute top-6 left-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg font-semibold">
                        Photo {currentPhotoIndex + 1} of {layout.photos}
                      </div>
                    )}

                    {/* Countdown with custom messages */}
                    {countdown !== null && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-500/20 to-purple-600/20 backdrop-blur-sm">
                        <div className="text-center bg-white/20 backdrop-blur-md rounded-3xl p-8">
                          <div className="text-9xl font-bold text-white drop-shadow-2xl animate-bounce mb-6">
                            {countdown || '📸'}
                          </div>
                          <div className="text-3xl font-bold text-white drop-shadow-lg">
                            {countdown > 0 ? PHOTOBOOTH_MESSAGES.countdown[countdown] : PHOTOBOOTH_MESSAGES.countdown[0]}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Preview of captured photos */}
                    {capturedPhotos.length > 0 && (
                      <div className="absolute bottom-6 left-6 flex space-x-3">
                        {capturedPhotos.map((photo, idx) => (
                          <div key={idx} className="w-20 h-20 rounded-2xl overflow-hidden border-3 border-white shadow-lg transform hover:scale-110 transition-transform">
                            <img src={photo} alt={`Captured ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                  {/* Capture Button */}
                  <div className="absolute bottom-6 right-6 pointer-events-auto">
                    {!isCapturing && (
                      <button
                        onClick={startPhotoSession}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-full hover:from-pink-600 hover:to-purple-700 transform hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-pink-500/25 ring-4 ring-white/50"
                      >
                        <Camera className="w-10 h-10" />
                      </button>
                    )}
                  </div>
              </div>
              ) : (
                /* Preview Mode */
                <div className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      Your Masterpiece ✨
                    </h3>
                    <p className="text-gray-600">Looking amazing! Ready to save?</p>
                  </div>
                  
                  <div className="flex justify-center mb-8">
                    <div className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100">
                      <PhotoStripCanvas
                        photos={capturedPhotos}
                        layout={layout}
                        theme={theme}
                        onStripGenerated={setPhotoStrip}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-center space-x-6">
                    <button
                      onClick={retakePhotos}
                      className="px-8 py-4 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-2xl hover:from-gray-500 hover:to-gray-600 flex items-center font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      <X className="w-5 h-5 mr-3" />
                      Retake
                    </button>
                    <button
                      onClick={savePhotoStrip}
                      disabled={isSaving}
                      className={`px-8 py-4 text-white rounded-2xl flex items-center font-semibold transition-all duration-300 hover:scale-105 shadow-lg ${
                        isSaving 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600'
                      }`}
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5 mr-3" />
                          Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={downloadPhotoStrip}
                      className="px-8 py-4 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-2xl hover:from-blue-500 hover:to-blue-600 flex items-center font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      <Download className="w-5 h-5 mr-3" />
                      Download
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoboothCapture;