// Photobooth Layout Configurations
// Each layout defines how photos are arranged in the strip
export const PHOTOBOOTH_LAYOUTS = {
  classic: {
    name: 'Classic Strip',
    description: 'Traditional 4-photo vertical strip',
    photos: 4,
    orientation: 'vertical',
    dimensions: { width: 300, height: 1200 },
    photoSize: { width: 280, height: 280 },
    spacing: 10,
    showLogo: true,
    showDate: true,
    cornerRadius: 8,
    borderWidth: 2
  },
  vintage: {
    name: 'Vintage Strip',
    description: 'Nostalgic 3-photo vertical strip',
    photos: 3,
    orientation: 'vertical',
    dimensions: { width: 300, height: 900 },
    photoSize: { width: 280, height: 280 },
    spacing: 15,
    showLogo: true,
    showDate: true,
    cornerRadius: 12,
    borderWidth: 3
  },
  horizontal: {
    name: 'Horizontal Strip',
    description: 'Modern 3-photo horizontal layout',
    photos: 3,
    orientation: 'horizontal',
    dimensions: { width: 900, height: 300 },
    photoSize: { width: 280, height: 280 },
    spacing: 15,
    showLogo: true,
    showDate: false,
    cornerRadius: 8,
    borderWidth: 2
  },
  grid: {
    name: '2x2 Grid',
    description: 'Square grid layout',
    photos: 4,
    orientation: 'grid',
    dimensions: { width: 600, height: 600 },
    photoSize: { width: 280, height: 280 },
    spacing: 20,
    showLogo: false,
    showDate: true,
    cornerRadius: 8,
    borderWidth: 2
  }
};

// Photobooth Theme Configurations
// Each theme defines colors, fonts, and styling
export const PHOTOBOOTH_THEMES = {
  classic: {
    name: 'Classic',
    description: 'Timeless black and white',
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    accentColor: '#333333',
    font: 'Arial, sans-serif',
    logoText: 'PHOTOBOOTH',
    dateFormat: 'MM/DD/YYYY',
    borderPattern: 'solid',
    gradient: null
  },
  vintage: {
    name: 'Vintage',
    description: 'Warm sepia tones',
    borderColor: '#8B4513',
    backgroundColor: '#F5F5DC',
    textColor: '#654321',
    accentColor: '#D2691E',
    font: 'serif',
    logoText: '📸 MEMORIES',
    dateFormat: 'MMM DD, YYYY',
    borderPattern: 'dashed',
    gradient: 'linear-gradient(45deg, #F5F5DC, #DEB887)'
  },
  birthday: {
    name: 'Birthday Party',
    description: 'Fun and colorful celebration',
    borderColor: '#FF69B4',
    backgroundColor: '#FFE4E1',
    textColor: '#FF1493',
    accentColor: '#FF6347',
    font: 'Comic Sans MS, cursive',
    logoText: '🎉 PARTY TIME!',
    dateFormat: 'DD/MM/YYYY',
    borderPattern: 'dotted',
    gradient: 'linear-gradient(45deg, #FFE4E1, #FFB6C1)'
  },
  wedding: {
    name: 'Wedding',
    description: 'Elegant gold and cream',
    borderColor: '#FFD700',
    backgroundColor: '#FFFAF0',
    textColor: '#8B4513',
    accentColor: '#DAA520',
    font: 'Georgia, serif',
    logoText: '💕 LOVE MEMORIES',
    dateFormat: 'MMMM DD, YYYY',
    borderPattern: 'double',
    gradient: 'linear-gradient(45deg, #FFFAF0, #F0E68C)'
  },
  neon: {
    name: 'Neon',
    description: 'Bright cyberpunk vibes',
    borderColor: '#00FFFF',
    backgroundColor: '#000000',
    textColor: '#00FFFF',
    accentColor: '#FF00FF',
    font: 'Courier New, monospace',
    logoText: '⚡ NEON BOOTH',
    dateFormat: 'YYYY.MM.DD',
    borderPattern: 'solid',
    gradient: 'linear-gradient(45deg, #000000, #1a0033)'
  }
};

// Photobooth Settings
export const PHOTOBOOTH_SETTINGS = {
  countdown: {
    duration: 3, // seconds
    showNumbers: true,
    playSound: true
  },
  capture: {
    flashEffect: true,
    flashDuration: 300, // milliseconds
    pauseBetweenPhotos: 2000, // milliseconds
    showPreview: true
  },
  quality: {
    photo: 'high', // 'low', 'medium', 'high'
    compression: 0.8,
    format: 'image/jpeg'
  },
  ui: {
    showInstructions: true,
    showProgress: true,
    autoHideControls: false,
    theme: 'light' // 'light', 'dark', 'auto'
  }
};

// Fun photobooth messages and prompts
export const PHOTOBOOTH_MESSAGES = {
  instructions: [
    "Strike a pose! 📸",
    "Say cheese! 🧀",
    "Look fabulous! ✨",
    "Show me your best smile! 😊",
    "Let's capture this moment! 📷",
    "Ready for your close-up? 🌟"
  ],
  countdown: {
    3: "Get ready...",
    2: "Almost there...",
    1: "Say cheese!",
    0: "📸 CLICK!"
  },
  completion: [
    "Perfect! You look amazing! ✨",
    "Great shots! 📸",
    "Fabulous photos! 🌟",
    "You're a natural! 😊",
    "These turned out great! 👌"
  ]
};

// Export helper functions
export const getLayoutById = (layoutId) => {
  return PHOTOBOOTH_LAYOUTS[layoutId] || PHOTOBOOTH_LAYOUTS.classic;
};

export const getThemeById = (themeId) => {
  return PHOTOBOOTH_THEMES[themeId] || PHOTOBOOTH_THEMES.classic;
};

export const getRandomMessage = (type = 'instructions') => {
  const messages = PHOTOBOOTH_MESSAGES[type];
  if (Array.isArray(messages)) {
    return messages[Math.floor(Math.random() * messages.length)];
  }
  return messages || "Let's take some photos!";
};
