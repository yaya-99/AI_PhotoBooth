import { useState, useRef, useCallback, useEffect } from 'react';

const useWebcam = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [facingMode, setFacingMode] = useState('user'); // 'user' or 'environment'

  // Get available video devices
  const getVideoDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      
      // Set default device
      if (videoDevices.length > 0 && !selectedDevice) {
        setSelectedDevice(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error('Error getting video devices:', err);
      setError('Could not get video devices');
    }
  }, [selectedDevice]);

  // Start webcam stream
  const startStream = useCallback(async () => {
    try {
      setError(null);
      
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in your browser');
      }

      // Stop any existing stream
      if (streamRef.current) {
        stopStream();
      }

      // Set up constraints
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: facingMode,
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined
        },
        audio: false
      };

      // Get stream
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Attach to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsStreaming(true);
        };
      }

      // Get devices after stream starts
      await getVideoDevices();
    } catch (err) {
      console.error('Error accessing camera:', err);
      
      // Provide user-friendly error messages
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera and try again.');
      } else if (err.name === 'NotReadableError') {
        setError('Camera is already in use by another application.');
      } else {
        setError(err.message || 'Failed to access camera');
      }
      
      setIsStreaming(false);
    }
  }, [facingMode, selectedDevice, getVideoDevices]);

  // Stop webcam stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsStreaming(false);
  }, []);

  // Capture photo from video stream
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !isStreaming) {
      setError('Camera is not ready');
      return null;
    }

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      
      // Flip horizontally if front camera
      if (facingMode === 'user') {
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      } else {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      
      // Get image data
      const dataURL = canvas.toDataURL('image/png');
      const blob = dataURLtoBlob(dataURL);
      
      return {
        dataURL,
        blob,
        width: canvas.width,
        height: canvas.height,
        timestamp: Date.now()
      };
    } catch (err) {
      console.error('Error capturing photo:', err);
      setError('Failed to capture photo');
      return null;
    }
  }, [isStreaming, facingMode]);

  // Switch between front and back camera
  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    if (isStreaming) {
      startStream();
    }
  }, [isStreaming, startStream]);

  // Convert dataURL to Blob
  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return {
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
    clearError: () => setError(null)
  };
};

export default useWebcam;