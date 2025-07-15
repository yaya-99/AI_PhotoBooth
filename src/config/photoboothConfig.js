export const PHOTOBOOTH_LAYOUTS = {
  classic: {
    name: 'Classic Strip',
    photos: 4,
    orientation: 'vertical',
    dimensions: { width: 200, height: 800 },
    photoSize: { width: 180, height: 180 },
    spacing: 10,
    showLogo: true
  },
  horizontal: {
    name: 'Horizontal Strip',
    photos: 3,
    orientation: 'horizontal',
    dimensions: { width: 600, height: 200 },
    photoSize: { width: 180, height: 180 },
    spacing: 10,
    showLogo: true
  },
  grid: {
    name: '2x2 Grid',
    photos: 4,
    orientation: 'grid',
    dimensions: { width: 400, height: 400 },
    photoSize: { width: 190, height: 190 },
    spacing: 10,
    showLogo: false
  }
};

export const PHOTOBOOTH_THEMES = {
  wedding: {
    name: 'Wedding',
    borderColor: '#FFD700',
    backgroundColor: '#FFFFFF',
    textColor: '#333333',
    borderImage: '/borders/wedding-border.png'
  },
  birthday: {
    name: 'Birthday Party',
    borderColor: '#FF69B4',
    backgroundColor: '#FFE4E1',
    textColor: '#FF1493',
    borderImage: '/borders/birthday-border.png'
  },
  classic: {
    name: 'Classic',
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    borderImage: null
  }
};