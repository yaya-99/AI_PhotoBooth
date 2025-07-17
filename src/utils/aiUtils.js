import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import * as tf from '@tensorflow/tfjs';

class AIUtils {
  constructor() {
    this.segmentation = null;
    this.isInitialized = false;
  }

  async initializeAI() {
    if (this.isInitialized) return;

    try {
      // Initialize MediaPipe Selfie Segmentation
      this.segmentation = new SelfieSegmentation({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
        }
      });

      this.segmentation.setOptions({
        modelSelection: 1, // 0 for general, 1 for landscape
        selfieMode: true,
      });

      // Initialize TensorFlow.js
      await tf.ready();
      
      console.log('AI utilities initialized successfully');
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing AI utilities:', error);
      throw error;
    }
  }

  async removeBackground(imageElement, backgroundType = 'blur') {
    if (!this.isInitialized) {
      await this.initializeAI();
    }

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = imageElement.width || imageElement.videoWidth;
      canvas.height = imageElement.height || imageElement.videoHeight;

      this.segmentation.onResults((results) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Apply background effect
        this.applyBackgroundEffect(ctx, results, canvas, backgroundType);
        
        // Draw the person (foreground)
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
        
        resolve(canvas.toDataURL());
      });

      this.segmentation.send({ image: imageElement });
    });
  }

  applyBackgroundEffect(ctx, results, canvas, backgroundType) {
    const { width, height } = canvas;
    
    switch (backgroundType) {
      case 'blur':
        this.applyBlurBackground(ctx, results.image, width, height);
        break;
      case 'gradient':
        this.applyGradientBackground(ctx, width, height);
        break;
      case 'solid':
        this.applySolidBackground(ctx, width, height, '#4F46E5');
        break;
      case 'pattern':
        this.applyPatternBackground(ctx, width, height);
        break;
      default:
        this.applyBlurBackground(ctx, results.image, width, height);
    }
    
    // Use segmentation mask
    ctx.globalCompositeOperation = 'destination-in';
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    if (results.segmentationMask) {
      const mask = results.segmentationMask;
      for (let i = 0; i < data.length; i += 4) {
        const maskValue = mask.data[i / 4];
        data[i + 3] = maskValue > 0.5 ? 0 : 255; // Invert mask for background
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  applyBlurBackground(ctx, image, width, height) {
    ctx.filter = 'blur(15px)';
    ctx.drawImage(image, 0, 0, width, height);
    ctx.filter = 'none';
  }

  applyGradientBackground(ctx, width, height) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  applySolidBackground(ctx, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
  }

  applyPatternBackground(ctx, width, height) {
    // Create a simple dot pattern
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = '#e0e0e0';
    for (let x = 0; x < width; x += 20) {
      for (let y = 0; y < height; y += 20) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  async enhancePhoto(imageDataURL) {
    try {
      const img = new Image();
      img.src = imageDataURL;
      
      await new Promise(resolve => {
        img.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Apply AI enhancement filters
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const enhanced = this.applyEnhancementFilters(imageData);
      
      ctx.putImageData(enhanced, 0, 0);
      
      return canvas.toDataURL('image/jpeg', 0.9);
    } catch (error) {
      console.error('Error enhancing photo:', error);
      return imageDataURL; // Return original if enhancement fails
    }
  }

  applyEnhancementFilters(imageData) {
    const data = imageData.data;
    
    // Apply brightness and contrast enhancement
    for (let i = 0; i < data.length; i += 4) {
      // Enhance brightness (slightly)
      data[i] = Math.min(255, data[i] * 1.1);     // Red
      data[i + 1] = Math.min(255, data[i + 1] * 1.1); // Green
      data[i + 2] = Math.min(255, data[i + 2] * 1.1); // Blue
      
      // Enhance contrast
      data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.2 + 128));
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.2 + 128));
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.2 + 128));
    }
    
    return imageData;
  }

  async detectFaces(imageElement) {
    try {
      // Simple face detection using canvas and basic algorithms
      // This is a placeholder - you might want to use a more sophisticated solution
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = imageElement.width || imageElement.videoWidth;
      canvas.height = imageElement.height || imageElement.videoHeight;
      
      ctx.drawImage(imageElement, 0, 0);
      
      // Return mock face detection results
      return [{
        x: canvas.width * 0.3,
        y: canvas.height * 0.25,
        width: canvas.width * 0.4,
        height: canvas.height * 0.5,
        confidence: 0.95
      }];
    } catch (error) {
      console.error('Error detecting faces:', error);
      return [];
    }
  }

  generateSmartCrop(imageDataURL, faces) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate optimal crop based on faces
        let cropX = 0, cropY = 0, cropWidth = img.width, cropHeight = img.height;
        
        if (faces.length > 0) {
          // Find bounding box of all faces
          const minX = Math.min(...faces.map(f => f.x));
          const maxX = Math.max(...faces.map(f => f.x + f.width));
          const minY = Math.min(...faces.map(f => f.y));
          const maxY = Math.max(...faces.map(f => f.y + f.height));
          
          // Add padding around faces
          const padding = 50;
          cropX = Math.max(0, minX - padding);
          cropY = Math.max(0, minY - padding);
          cropWidth = Math.min(img.width - cropX, maxX - minX + 2 * padding);
          cropHeight = Math.min(img.height - cropY, maxY - minY + 2 * padding);
        }
        
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        
        ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
        
        resolve(canvas.toDataURL());
      };
      img.src = imageDataURL;
    });
  }

  dispose() {
    if (this.segmentation) {
      this.segmentation.close();
    }
    this.isInitialized = false;
  }
}

export default new AIUtils();
