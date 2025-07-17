# AI PhotoBooth 📸✨

A modern AI-powered photo booth application built with React and Vite, featuring advanced computer vision capabilities and stunning visual effects.

## 🚀 Features

### Core Functionality
- **Multi-Photo Capture**: Takes 4 sequential photos with countdown timer
- **Photo Strip Generation**: Creates vintage-style photo strips with customizable layouts
- **Live Camera Preview**: Real-time video feed with overlay effects
- **Mobile Responsive**: Optimized for all screen sizes

### AI-Powered Features (Phase 4)
- **Background Removal**: MediaPipe Selfie Segmentation for real-time background replacement
- **AI Photo Enhancement**: TensorFlow.js-based image processing and filters
- **Smart Background Selection**: Multiple AI-driven background options (blur, gradient, patterns, solid colors)
- **Live Preview Effects**: Real-time AI overlay effects with adjustable opacity
- **Enhancement Filters**: Post-capture AI processing for improved image quality

### UI/UX Features
- **Pinterest-Style Design**: Modern gradient-based aesthetic with smooth animations
- **Collapsible AI Controls**: Intuitive AI Magic panel with categorized effects
- **Interactive Overlays**: Semi-transparent live preview effects
- **Responsive Layout**: Seamless experience across desktop and mobile devices

## 🛠️ Technology Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS with custom animations
- **AI/ML**: 
  - MediaPipe (Selfie Segmentation)
  - TensorFlow.js (Image Enhancement)
- **Icons**: Lucide React
- **Camera**: HTML5 getUserMedia API

## 📁 Project Structure

```
src/
├── components/
│   ├── PhotoboothCapture.jsx    # Main photo capture component
│   ├── PhotoStripCanvas.jsx     # Photo strip generation
│   └── BackgroundSelector.jsx   # AI background selection UI
├── utils/
│   └── aiUtils.js              # AI processing utilities
├── config/
│   └── photoboothConfig.js     # Configuration settings
└── styles/
    └── index.css               # Global styles and animations
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AI_PhotoBooth
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🎨 AI Features Usage

### Background Removal
- Toggle the AI Magic panel
- Select from various background options (blur, gradient, pattern, solid)
- Adjust opacity for subtle or dramatic effects

### Photo Enhancement
- AI processing is automatically applied during photo capture
- Real-time preview shows effects before capture
- Post-capture enhancement improves image quality

## 🔧 Development

This project uses:
- **Hot Module Replacement (HMR)** for fast development
- **ESLint** for code quality
- **Tailwind CSS** for utility-first styling
- **Modern React patterns** with hooks and functional components

## 📱 Browser Support

- Modern browsers with WebRTC support
- Camera access permissions required
- WebGL support recommended for AI features

## 🎯 Future Enhancements

- Face detection and smart compositional adjustments
- AI-generated captions for photo strips
- Dynamic theming based on photo content
- Analytics and usage tracking
- Cloud storage integration

## 📄 License

This project is built with React + Vite template and enhanced with custom AI features.
