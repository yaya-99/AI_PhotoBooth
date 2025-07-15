import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, RotateCw, Check, X, Download, Settings, Sparkles, Timer, Palette, Zap, Heart, Star } from 'lucide-react';
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

// Enhanced UI Themes
const UI_THEMES = {
  sunset: {
    name: '🌅 Sunset Vibes',
    background: 'bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50',
    headerGradient: 'from-orange-500 via-pink-500 to-purple-600',
    controlsGradient: 'from-orange-100 to-pink-100',
    messageGradient: 'from-orange-500 via-pink-500 to-purple-500',
    buttonGradient: 'from-orange-400 to-pink-500',
    accentColor: 'orange-400'
  },
  ocean: {
    name: '🌊 Ocean Breeze',
    background: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50',
    headerGradient: 'from-blue-600 via-cyan-600 to-teal-600',
    controlsGradient: 'from-blue-100 to-cyan-100',
    messageGradient: 'from-blue-500 via-cyan-500 to-teal-500',
    buttonGradient: 'from-blue-400 to-cyan-500',
    accentColor: 'blue-400'
  },
  forest: {
    name: '🌿 Forest Fresh',
    background: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50',
    headerGradient: 'from-green-600 via-emerald-600 to-teal-600',
    controlsGradient: 'from-green-100 to-emerald-100',
    messageGradient: 'from-green-500 via-emerald-500 to-teal-500',
    buttonGradient: 'from-green-400 to-emerald-500',
    accentColor: 'green-400'
  },
  cosmic: {
    name: '🌌 Cosmic Dream',
    background: 'bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50',
    headerGradient: 'from-purple-600 via-indigo-600 to-pink-600',
    controlsGradient: 'from-purple-100 to-indigo-100',
    messageGradient: 'from-purple-500 via-indigo-500 to-pink-500',
    buttonGradient: 'from-purple-400 to-indigo-500',
    accentColor: 'purple-400'
  },
  rose: {
    name: '🌹 Rose Garden',
    background: 'bg-gradient-to-br from-pink-50 via-rose-50 to-red-50',
    headerGradient: 'from-pink-600 via-rose-600 to-red-600',
    controlsGradient: 'from-pink-100 to-rose-100',
    messageGradient: 'from-pink-500 via-rose-500 to-red-500',
    buttonGradient: 'from-pink-400 to-rose-500',
    accentColor: 'pink-400'
  }
};

const PhotoboothCapture = () => {
  const webcamRef = useRef(null);
  const [facingMode, setFacingMode] = useState('user');
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [selectedLayout, setSelectedLayout] = useState('classic');
  const [selectedTheme, setSelectedTheme] = useState('classic');
  const [selectedUITheme, setSelectedUITheme] = useState('sunset');
  const [showPreview, setShowPreview] = useState(false);
  const [photoStrip, setPhotoStrip] = useState(null);
  const [currentMessage, setCurrentMessage] = useState(getRandomMessage('instructions'));
  const [isFlashing, setIsFlashing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const layout = getLayoutById(selectedLayout);
  const theme = getThemeById(selectedTheme);
  const uiTheme = UI_THEMES[selectedUITheme];

  // Update message periodically when not capturing
  useEffect(() => {
    if (!isCapturing && !showPreview) {
      const interval = setInterval(() => {
        const newMessage = getRandomMessage('instructions');
        setCurrentMessage(newMessage);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isCapturing, showPreview]);

  // Initialize message on mount
  useEffect(() => {
    const initialMessage = getRandomMessage('instructions');
    setCurrentMessage(initialMessage);
  }, []);

  // Particle effect for special moments
  useEffect(() => {
    if (showParticles) {
      const timer = setTimeout(() => setShowParticles(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showParticles]);

  const flashEffect = () => {
    const flash = document.createElement('div');
    flash.className = 'fixed inset-0 bg-white z-50 animate-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 300);
  };

  const generatePhotoStrip = useCallback(async () => {
    console.log('generatePhotoStrip called with photos:', capturedPhotos.length);
    setShowParticles(true);
    toast.success(getRandomMessage('completion'));
  }, [capturedPhotos, layout, theme]);

  const captureNextPhoto = useCallback(() => {
    let count = 3;
    setCountdown(count);
    
    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);
      
      if (count === 0) {
        clearInterval(countdownInterval);
        
        const imageSrc = webcamRef.current.getScreenshot();
        console.log('Photo captured:', imageSrc ? 'Success' : 'Failed');
        
        setCapturedPhotos(prev => {
          const newPhotos = [...prev, imageSrc];
          console.log('Photos captured so far:', newPhotos.length, 'out of', layout.photos);
          return newPhotos;
        });
        
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
    setPhotoStrip(null);
    captureNextPhoto();
  }, [captureNextPhoto]);

  useEffect(() => {
    if (capturedPhotos.length > 0 && capturedPhotos.length < layout.photos && isCapturing) {
      setTimeout(() => {
        setCurrentPhotoIndex(capturedPhotos.length);
        captureNextPhoto();
      }, 1500);
    } else if (capturedPhotos.length === layout.photos && isCapturing) {
      console.log('All photos captured, switching to preview mode');
      setIsCapturing(false);
      setShowPreview(true);
      setTimeout(() => {
        generatePhotoStrip();
      }, 100);
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
      setShowParticles(true);
      toast.success('Photo strip saved successfully! 🎉');
      
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
      setShowParticles(true);
      toast.success('Photo strip downloaded! 📸');
    } catch (error) {
      console.error('Error downloading photo strip:', error);
      toast.error('Failed to download photo strip. Please try again.');
    }
  };

  // Particle Component
  const Particles = () => (
    <div className="fixed inset-0 pointer-events-none z-40">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className={`absolute animate-bounce text-2xl opacity-80`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        >
          {['✨', '🎉', '💫', '⭐', '🌟'][Math.floor(Math.random() * 5)]}
        </div>
      ))}
    </div>
  );

  return (
    <div className={`min-h-screen ${uiTheme.background} p-2 sm:p-4 transition-all duration-1000`}>
      {showParticles && <Particles />}
      
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-4 sm:mb-8 animate-fade-in">
          <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r ${uiTheme.headerGradient} bg-clip-text text-transparent mb-2 animate-pulse`}>
            ✨ AI PhotoBooth ✨
          </h1>
          <p className="text-gray-600 text-sm sm:text-lg">Create beautiful memories with style</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Enhanced Controls Panel */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 p-4 sm:p-8 space-y-4 sm:space-y-8 transform hover:scale-105 transition-transform duration-300">
              <div className="text-center">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-${uiTheme.accentColor} to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin-slow`}>
                  <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-800">Customize</h3>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">Make it yours</p>
              </div>

              {/* UI Theme Selection */}
              <div>
                <label className="block text-sm sm:text-lg font-semibold mb-2 sm:mb-4 text-gray-800 flex items-center">
                  <Palette className="w-4 h-4 mr-2" />
                  UI Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-3">
                  {Object.entries(UI_THEMES).map(([key, theme]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedUITheme(key)}
                      className={`p-2 sm:p-3 rounded-xl border-2 text-left transition-all duration-300 hover:scale-105 text-xs sm:text-sm ${
                        selectedUITheme === key 
                          ? `border-${uiTheme.accentColor} bg-gradient-to-r ${uiTheme.controlsGradient} shadow-lg` 
                          : 'border-gray-200 hover:border-pink-300 bg-white hover:shadow-md'
                      }`}
                    >
                      <div className="font-semibold text-gray-800">{theme.name}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Layout Selection */}
              <div>
                <label className="block text-sm sm:text-lg font-semibold mb-2 sm:mb-4 text-gray-800">Layout Style</label>
                <div className="space-y-2 sm:space-y-3">
                  {Object.entries(PHOTOBOOTH_LAYOUTS).map(([key, layout]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedLayout(key)}
                      className={`w-full p-2 sm:p-4 rounded-xl sm:rounded-2xl border-2 text-left transition-all duration-300 hover:scale-105 ${
                        selectedLayout === key 
                          ? `border-${uiTheme.accentColor} bg-gradient-to-r ${uiTheme.controlsGradient} shadow-lg` 
                          : 'border-gray-200 hover:border-pink-300 bg-white hover:shadow-md'
                      }`}
                    >
                      <div className="font-semibold text-gray-800 text-sm sm:text-base">{layout.name}</div>
                      <div className="text-xs sm:text-sm text-gray-500 mt-1">{layout.photos} photos</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Selection */}
              <div>
                <label className="block text-sm sm:text-lg font-semibold mb-2 sm:mb-4 text-gray-800">Theme</label>
                <div className="space-y-2 sm:space-y-3">
                  {Object.entries(PHOTOBOOTH_THEMES).map(([key, theme]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedTheme(key)}
                      className={`w-full p-2 sm:p-4 rounded-xl sm:rounded-2xl border-2 text-left transition-all duration-300 hover:scale-105 ${
                        selectedTheme === key 
                          ? `border-${uiTheme.accentColor} bg-gradient-to-r ${uiTheme.controlsGradient} shadow-lg` 
                          : 'border-gray-200 hover:border-pink-300 bg-white hover:shadow-md'
                      }`}
                    >
                      <div className="font-semibold text-gray-800 text-sm sm:text-base">{theme.name}</div>
                      <div 
                        className="h-2 sm:h-3 mt-1 sm:mt-2 rounded-full shadow-inner"
                        style={{ backgroundColor: theme.borderColor }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Camera Switch */}
              <button
                onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}
                className="w-full p-2 sm:p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl sm:rounded-2xl flex items-center justify-center hover:from-gray-200 hover:to-gray-300 transition-all duration-300 hover:scale-105 shadow-md"
              >
                <RotateCw className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                <span className="font-semibold text-sm sm:text-base">Switch Camera</span>
              </button>
            </div>
          </div>

          {/* Enhanced Camera View */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {/* Message Display */}
            {!showPreview && (
              <div className={`bg-gradient-to-r ${uiTheme.messageGradient} text-white p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl shadow-xl animate-pulse`}>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold">
                    {isCapturing ? (
                      <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                        <span>Creating your masterpiece...</span>
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                        <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="text-sm sm:text-lg">{currentMessage}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm opacity-90 mt-2 font-medium">
                    {layout.name} • {theme.name} Theme • {layout.photos} photos
                  </div>
                </div>
              </div>
            )}
            
            <div className={`bg-white/90 backdrop-blur-sm shadow-2xl overflow-hidden border border-white/20 ${
              showPreview ? 'rounded-2xl sm:rounded-3xl' : 'rounded-b-2xl sm:rounded-b-3xl'
            }`}>
              {!showPreview ? (
                <div className="relative">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode }}
                    className="w-full rounded-b-2xl sm:rounded-b-3xl"
                  />

                  {/* Overlay UI */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Photo counter */}
                    {isCapturing && (
                      <div className={`absolute top-3 sm:top-6 left-3 sm:left-6 bg-gradient-to-r from-${uiTheme.accentColor} to-purple-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full shadow-lg font-semibold text-sm sm:text-base animate-bounce`}>
                        Photo {currentPhotoIndex + 1} of {layout.photos}
                      </div>
                    )}

                    {/* Enhanced Countdown */}
                    {countdown !== null && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-500/20 to-purple-600/20 backdrop-blur-sm">
                        <div className="text-center bg-white/20 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-8 animate-pulse">
                          <div className="text-6xl sm:text-9xl font-bold text-white drop-shadow-2xl animate-bounce mb-2 sm:mb-6">
                            {countdown || '📸'}
                          </div>
                          <div className="text-xl sm:text-3xl font-bold text-white drop-shadow-lg">
                            {countdown > 0 ? PHOTOBOOTH_MESSAGES.countdown[countdown] : PHOTOBOOTH_MESSAGES.countdown[0]}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Photo previews */}
                    {capturedPhotos.length > 0 && (
                      <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 flex space-x-2 sm:space-x-3">
                        {capturedPhotos.map((photo, idx) => (
                          <div key={idx} className="w-12 h-12 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-3 border-white shadow-lg transform hover:scale-110 transition-transform">
                            <img src={photo} alt={`Captured ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Enhanced Capture Button */}
                  <div className="absolute bottom-3 sm:bottom-6 right-3 sm:right-6 pointer-events-auto">
                    {!isCapturing && (
                      <button
                        onClick={startPhotoSession}
                        className={`bg-gradient-to-r from-${uiTheme.accentColor} to-purple-600 text-white p-4 sm:p-6 rounded-full hover:from-pink-600 hover:to-purple-700 transform hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-pink-500/25 ring-2 sm:ring-4 ring-white/50 animate-pulse`}
                      >
                        <Camera className="w-6 h-6 sm:w-10 sm:h-10" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Enhanced Preview Mode */
                <div className="p-4 sm:p-8">
                  <div className="text-center mb-4 sm:mb-8">
                    <h3 className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${uiTheme.headerGradient} bg-clip-text text-transparent mb-2 animate-bounce`}>
                      Your Masterpiece ✨
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base">Looking amazing! Ready to save?</p>
                  </div>
                  
                  <div className="flex justify-center mb-4 sm:mb-8">
                    <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-2xl border border-gray-100 transform hover:scale-105 transition-transform duration-300">
                      <PhotoStripCanvas
                        photos={capturedPhotos}
                        layout={layout}
                        theme={theme}
                        onStripGenerated={setPhotoStrip}
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-6">
                    <button
                      onClick={retakePhotos}
                      className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl sm:rounded-2xl hover:from-gray-500 hover:to-gray-600 flex items-center justify-center font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                      Retake
                    </button>
                    <button
                      onClick={savePhotoStrip}
                      disabled={isSaving}
                      className={`px-6 sm:px-8 py-3 sm:py-4 text-white rounded-xl sm:rounded-2xl flex items-center justify-center font-semibold transition-all duration-300 hover:scale-105 shadow-lg ${
                        isSaving 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600'
                      }`}
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2 sm:mr-3"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                          Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={downloadPhotoStrip}
                      className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-xl sm:rounded-2xl hover:from-blue-500 hover:to-blue-600 flex items-center justify-center font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
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
