import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, RotateCw, Check, X, Download } from 'lucide-react';
import { PHOTOBOOTH_LAYOUTS, PHOTOBOOTH_THEMES } from '../config/photoboothConfig';
import PhotoStripCanvas from './PhotoStripCanvas';

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

  const layout = PHOTOBOOTH_LAYOUTS[selectedLayout];
  const theme = PHOTOBOOTH_THEMES[selectedTheme];

  const startPhotoSession = useCallback(() => {
    setCapturedPhotos([]);
    setCurrentPhotoIndex(0);
    setIsCapturing(true);
    setShowPreview(false);
    captureNextPhoto();
  }, []);

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
        setCapturedPhotos(prev => [...prev, imageSrc]);
        
        // Flash effect
        flashEffect();
        
        // Check if we need more photos
        const nextIndex = currentPhotoIndex + 1;
        if (nextIndex < layout.photos) {
          setCurrentPhotoIndex(nextIndex);
          setTimeout(() => {
            captureNextPhoto();
          }, 1500); // Brief pause between photos
        } else {
          // All photos captured
          setIsCapturing(false);
          setShowPreview(true);
          generatePhotoStrip();
        }
        
        setCountdown(null);
      }
    }, 1000);
  }, [currentPhotoIndex, layout.photos]);

  const flashEffect = () => {
    const flash = document.createElement('div');
    flash.className = 'fixed inset-0 bg-white z-50 animate-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 300);
  };

  const generatePhotoStrip = useCallback(async () => {
    // This will be handled by PhotoStripCanvas component
    // which will create the final strip with the selected layout and theme
  }, [capturedPhotos, layout, theme]);

  const retakePhotos = () => {
    setCapturedPhotos([]);
    setCurrentPhotoIndex(0);
    setShowPreview(false);
    setPhotoStrip(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <h3 className="text-xl font-bold">Photobooth Settings</h3>
            
            {/* Layout Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Layout Style</label>
              <div className="space-y-2">
                {Object.entries(PHOTOBOOTH_LAYOUTS).map(([key, layout]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedLayout(key)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      selectedLayout === key 
                        ? 'border-pink-500 bg-pink-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{layout.name}</div>
                    <div className="text-sm text-gray-500">{layout.photos} photos</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <div className="space-y-2">
                {Object.entries(PHOTOBOOTH_THEMES).map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTheme(key)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      selectedTheme === key 
                        ? 'border-pink-500 bg-pink-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{theme.name}</div>
                    <div 
                      className="h-4 mt-1 rounded"
                      style={{ backgroundColor: theme.borderColor }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Camera Switch */}
            <button
              onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}
              className="w-full p-3 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"
            >
              <RotateCw className="w-5 h-5 mr-2" />
              Switch Camera
            </button>
          </div>
        </div>

        {/* Camera View */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {!showPreview ? (
              <div className="relative">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode }}
                  className="w-full"
                />

                {/* Overlay UI */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Photo counter */}
                  {isCapturing && (
                    <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full">
                      Photo {currentPhotoIndex + 1} of {layout.photos}
                    </div>
                  )}

                  {/* Countdown */}
                  {countdown !== null && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-8xl font-bold text-white drop-shadow-lg animate-ping">
                        {countdown || '📸'}
                      </div>
                    </div>
                  )}

                  {/* Preview of captured photos */}
                  {capturedPhotos.length > 0 && (
                    <div className="absolute bottom-4 left-4 flex space-x-2">
                      {capturedPhotos.map((photo, idx) => (
                        <div key={idx} className="w-16 h-16 rounded overflow-hidden border-2 border-white">
                          <img src={photo} alt={`Captured ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Capture Button */}
                <div className="absolute bottom-4 right-4 pointer-events-auto">
                  {!isCapturing && (
                    <button
                      onClick={startPhotoSession}
                      className="bg-pink-500 text-white p-4 rounded-full hover:bg-pink-600 transform hover:scale-105 transition-all shadow-lg"
                    >
                      <Camera className="w-8 h-8" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Preview Mode */
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Your Photo Strip</h3>
                <PhotoStripCanvas
                  photos={capturedPhotos}
                  layout={layout}
                  theme={theme}
                  onStripGenerated={setPhotoStrip}
                />
                
                <div className="flex justify-center space-x-4 mt-6">
                  <button
                    onClick={retakePhotos}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Retake
                  </button>
                  <button
                    onClick={() => {/* Save logic */}}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={() => {/* Download logic */}}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoboothCapture;