import React, { useEffect, useRef } from 'react';

const PhotoStripCanvas = ({ photos, layout, theme, onStripGenerated }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (photos.length === layout.photos) {
      generateStrip();
    }
  }, [photos, layout, theme]);

  const generateStrip = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = layout.dimensions.width;
    canvas.height = layout.dimensions.height;
    
    // Background
    ctx.fillStyle = theme.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border
    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    
    // Load and draw photos
    const padding = 20;
    let currentY = padding;
    
    for (let i = 0; i < photos.length; i++) {
      const img = new Image();
      img.src = photos[i];
      await new Promise(resolve => img.onload = resolve);
      
      // Calculate position based on layout
      let x, y;
      if (layout.orientation === 'vertical') {
        x = (canvas.width - layout.photoSize.width) / 2;
        y = currentY;
        currentY += layout.photoSize.height + layout.spacing;
      } else if (layout.orientation === 'horizontal') {
        x = padding + i * (layout.photoSize.width + layout.spacing);
        y = (canvas.height - layout.photoSize.height) / 2;
      } else if (layout.orientation === 'grid') {
        x = padding + (i % 2) * (layout.photoSize.width + layout.spacing);
        y = padding + Math.floor(i / 2) * (layout.photoSize.height + layout.spacing);
      }
      
      // Draw photo with border
      ctx.fillStyle = 'white';
      ctx.fillRect(x - 5, y - 5, layout.photoSize.width + 10, layout.photoSize.height + 10);
      ctx.drawImage(img, x, y, layout.photoSize.width, layout.photoSize.height);
    }
    
    // Add text/date
    ctx.fillStyle = theme.textColor;
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    const date = new Date().toLocaleDateString();
    ctx.fillText
    ctx.fillText(date, canvas.width / 2, canvas.height - 10);
    
    // Generate final image
    const stripDataUrl = canvas.toDataURL('image/png');
    onStripGenerated(stripDataUrl);
  };

  return (
    <div className="flex justify-center">
      <canvas 
        ref={canvasRef} 
        className="border-2 border-gray-300 rounded-lg shadow-lg"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
};

export default PhotoStripCanvas;