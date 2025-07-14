import React, { useState, useEffect } from 'react';
import useWebcam from '../hooks/useWebcam';

const WebcamCapture = ({ onCapture, onError }) => {
  const {
    videoRef,
    isStreaming,
    error,
    devices,
    selectedDevice,
    facingMode,
    startStream,
    stopStream,
    capturePhoto,
    switchCamera,
    setSelectedDevice,
    clearError
  } = useWebcam();

  const [showFlash, setShowFlash] = useState(false);
  const [countdown, setCountdown] = useState(null);

  // Auto-start camera when component mounts
  useEffect(() => {
    startStream();
    return () => stopStream();
  }, []);

  // Handle errors
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // Handle photo capture
  const handleCapture = () => {
    const photoData = capturePhoto();
    if (photoData) {
      // Show flash animation
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 300);
      
      // Call parent callback
      if (onCapture) {
        onCapture(photoData);
      }
    }
  };

  // Handle timed capture
  const handleTimedCapture = (seconds = 3) => {
    setCountdown(seconds);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleCapture();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Flash Animation */}
      <div className={`camera-flash ${showFlash ? 'active' : ''}`} />
      
      {/* Video Container */}
      <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
        />
        
        {/* Countdown Overlay */}
        {countdown && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-8xl font-bold text-white animate-pulse">
              {countdown}
            </div>
          </div>
        )}
        
        {/* Camera Not Started Overlay */}
        {!isStreaming && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-white">Starting camera...</p>
            </div>
          </div>
        )}
        
        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 p-4">
            <div className="text-center max-w-md">
              <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-white mb-4">{error}</p>
              <button 
                onClick={() => {
                  clearError();
                  startStream();
                }}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="mt-6 space-y-4">
        {/* Camera Selection (if multiple cameras) */}
        {devices.length > 1 && (
          <div className="flex items-center justify-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Camera:</label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="input-field w-auto"
              disabled={!isStreaming}
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${devices.indexOf(device) + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          {/* Camera Toggle */}
          <button
            onClick={isStreaming ? stopStream : startStream}
            className={`${isStreaming ? 'btn-outline' : 'btn-secondary'}`}
            disabled={countdown !== null}
          >
            {isStreaming ? (
              <>
                <svg className="w-5 h-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Stop Camera
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Start Camera
              </>
            )}
          </button>
          
          {/* Capture Button */}
          <button
            onClick={handleCapture}
            className="btn-primary"
            disabled={!isStreaming || countdown !== null}
          >
            <svg className="w-5 h-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Capture
          </button>
          
          {/* Timer Button */}
          <button
            onClick={() => handleTimedCapture(3)}
            className="btn-outline"
            disabled={!isStreaming || countdown !== null}
          >
            <svg className="w-5 h-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Timer (3s)
          </button>
          
          {/* Switch Camera (mobile) */}
          {devices.length > 1 && (
            <button
              onClick={switchCamera}
              className="btn-outline"
              disabled={!isStreaming || countdown !== null}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebcamCapture;