import React, { useEffect, useRef } from 'react';

const PhotoStripCanvas = ({ photos, layout, theme, onStripGenerated }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (photos.length === layout.photos) {
      generateStrip();
    }
  }, [photos, layout, theme]);

  const generateStrip = async () => {
    console.log('generateStrip called with:', { photos: photos.length, layout: layout.name, theme: theme.name });
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas ref is null');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    console.log('Canvas context obtained');
    
    // Set canvas dimensions
    canvas.width = layout.dimensions.width;
    canvas.height = layout.dimensions.height;
    console.log('Canvas dimensions set:', { width: canvas.width, height: canvas.height });
    
    // Create stunning gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, theme.backgroundColor);
    gradient.addColorStop(0.3, theme.accentColor + '80'); // Semi-transparent
    gradient.addColorStop(0.7, theme.backgroundColor + '60');
    gradient.addColorStop(1, theme.borderColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add subtle pattern overlay
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < canvas.width; i += 20) {
      for (let j = 0; j < canvas.height; j += 20) {
        ctx.fillStyle = theme.borderColor;
        ctx.fillRect(i, j, 2, 2);
      }
    }
    ctx.globalAlpha = 1;
    
    // Draw elegant border with multiple layers
    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 8;
    ctx.setLineDash([]);
    drawRoundedRect(ctx, 5, 5, canvas.width - 10, canvas.height - 10, 20);
    ctx.stroke();
    
    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, 12, 12, canvas.width - 24, canvas.height - 24, 15);
    ctx.stroke();
    
    // Add header with title and decorative elements
    if (layout.showLogo && theme.logoText) {
      const headerHeight = 50;
      const headerGradient = ctx.createLinearGradient(0, 0, canvas.width, headerHeight);
      headerGradient.addColorStop(0, theme.borderColor + '40');
      headerGradient.addColorStop(1, theme.accentColor + '40');
      ctx.fillStyle = headerGradient;
      drawRoundedRect(ctx, 20, 20, canvas.width - 40, headerHeight, 10);
      ctx.fill();
      
      // Title text with shadow
      ctx.fillStyle = theme.textColor;
      ctx.font = `bold ${Math.max(18, canvas.width / 15)}px 'Arial', sans-serif`;
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 3;
      ctx.fillText(theme.logoText, canvas.width / 2, 55);
      ctx.shadowBlur = 0;
    }
    
    // Load and draw photos with enhanced styling
    const padding = layout.spacing || 25;
    let currentY = layout.showLogo ? 85 : padding;
    
    for (let i = 0; i < photos.length; i++) {
      const img = new Image();
      img.src = photos[i];
      await new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
      
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
      
      const cornerRadius = layout.cornerRadius || 15;
      
      // Photo frame with gradient and shadow
      const frameGradient = ctx.createRadialGradient(
        x + layout.photoSize.width / 2, y + layout.photoSize.height / 2, 0,
        x + layout.photoSize.width / 2, y + layout.photoSize.height / 2, layout.photoSize.width / 2
      );
      frameGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      frameGradient.addColorStop(1, 'rgba(200, 200, 200, 0.7)');
      
      ctx.fillStyle = frameGradient;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      drawRoundedRect(ctx, x - 8, y - 8, layout.photoSize.width + 16, layout.photoSize.height + 16, cornerRadius + 5);
      ctx.fill();
      
      // Reset shadow
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Draw photo with rounded corners
      ctx.save();
      drawRoundedRect(ctx, x, y, layout.photoSize.width, layout.photoSize.height, cornerRadius);
      ctx.clip();
      ctx.drawImage(img, x, y, layout.photoSize.width, layout.photoSize.height);
      ctx.restore();
      
      // Add photo number badge
      const badgeSize = 25;
      const badgeX = x + layout.photoSize.width - badgeSize - 5;
      const badgeY = y + 5;
      
      ctx.fillStyle = theme.borderColor;
      ctx.beginPath();
      ctx.arc(badgeX + badgeSize/2, badgeY + badgeSize/2, badgeSize/2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText((i + 1).toString(), badgeX + badgeSize/2, badgeY + badgeSize/2 + 4);
      
      // Add decorative corner elements
      const cornerSize = 8;
      ctx.fillStyle = theme.accentColor;
      // Top-left corner
      ctx.fillRect(x - 3, y - 3, cornerSize, 2);
      ctx.fillRect(x - 3, y - 3, 2, cornerSize);
      // Top-right corner
      ctx.fillRect(x + layout.photoSize.width - cornerSize + 3, y - 3, cornerSize, 2);
      ctx.fillRect(x + layout.photoSize.width + 1, y - 3, 2, cornerSize);
      // Bottom-left corner
      ctx.fillRect(x - 3, y + layout.photoSize.height + 1, cornerSize, 2);
      ctx.fillRect(x - 3, y + layout.photoSize.height - cornerSize + 3, 2, cornerSize);
      // Bottom-right corner
      ctx.fillRect(x + layout.photoSize.width - cornerSize + 3, y + layout.photoSize.height + 1, cornerSize, 2);
      ctx.fillRect(x + layout.photoSize.width + 1, y + layout.photoSize.height - cornerSize + 3, 2, cornerSize);
    }
    
    // Add footer with date and decorative elements
    if (layout.showDate) {
      const footerHeight = 40;
      const footerY = canvas.height - footerHeight - 20;
      
      const footerGradient = ctx.createLinearGradient(0, footerY, canvas.width, footerY + footerHeight);
      footerGradient.addColorStop(0, theme.accentColor + '40');
      footerGradient.addColorStop(1, theme.borderColor + '40');
      ctx.fillStyle = footerGradient;
      drawRoundedRect(ctx, 20, footerY, canvas.width - 40, footerHeight, 10);
      ctx.fill();
      
      ctx.fillStyle = theme.textColor;
      ctx.font = `${Math.max(14, canvas.width / 25)}px 'Arial', sans-serif`;
      ctx.textAlign = 'center';
      const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      ctx.fillText(`✨ ${date} ✨`, canvas.width / 2, footerY + 25);
    }
    
    // Add final decorative touches
    ctx.fillStyle = theme.accentColor;
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    
    // Stars decoration
    const stars = ['⭐', '✨', '💫', '🌟'];
    for (let i = 0; i < 8; i++) {
      const star = stars[i % stars.length];
      const x = 30 + (i * (canvas.width - 60) / 7);
      const y = canvas.height - 10;
      ctx.fillText(star, x, y);
    }
    
    const stripDataUrl = canvas.toDataURL('image/jpeg', 0.95);
    console.log('Photo strip generated successfully:', stripDataUrl ? 'Data URL created' : 'Failed to create Data URL');
    onStripGenerated(stripDataUrl);
  };

  const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  };

  console.log('PhotoStripCanvas rendering with:', {
    photoCount: photos.length,
    layoutPhotos: layout.photos,
    theme: theme.name,
    layout: layout.name
  });

  return (
    <div className="flex justify-center">
      <canvas 
        ref={canvasRef} 
        className="border-4 border-indigo-600 rounded-3xl shadow-2xl"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
};

export default PhotoStripCanvas;
