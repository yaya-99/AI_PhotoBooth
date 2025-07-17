import React, { useState, useEffect } from 'react';
import { Palette, Sparkles, Image as ImageIcon, Filter, Layers, Zap } from 'lucide-react';

const BackgroundSelector = ({ onBackgroundChange, currentBackground }) => {
  const [backgrounds, setBackgrounds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('effects');

  useEffect(() => {
    // Initialize background options
    const backgroundOptions = {
      effects: [
        {
          id: 'none',
          name: 'Original',
          type: 'none',
          icon: <ImageIcon className="w-5 h-5" />,
          description: 'No background effects'
        },
        {
          id: 'blur',
          name: 'Blur',
          type: 'blur',
          icon: <Filter className="w-5 h-5" />,
          description: 'Blurred background'
        },
        {
          id: 'gradient',
          name: 'Gradient',
          type: 'gradient',
          icon: <Palette className="w-5 h-5" />,
          description: 'Gradient background'
        },
        {
          id: 'pattern',
          name: 'Pattern',
          type: 'pattern',
          icon: <Layers className="w-5 h-5" />,
          description: 'Dot pattern background'
        }
      ],
      gradients: [
        {
          id: 'sunset',
          name: 'Sunset',
          type: 'custom-gradient',
          colors: ['#ff7e5f', '#feb47b'],
          description: 'Warm sunset gradient'
        },
        {
          id: 'ocean',
          name: 'Ocean',
          type: 'custom-gradient',
          colors: ['#667eea', '#764ba2'],
          description: 'Ocean blue gradient'
        },
        {
          id: 'forest',
          name: 'Forest',
          type: 'custom-gradient',
          colors: ['#56ab2f', '#a8e6cf'],
          description: 'Forest green gradient'
        },
        {
          id: 'cosmic',
          name: 'Cosmic',
          type: 'custom-gradient',
          colors: ['#8360c3', '#2ebf91'],
          description: 'Cosmic purple gradient'
        },
        {
          id: 'rose',
          name: 'Rose',
          type: 'custom-gradient',
          colors: ['#ff8a9b', '#ff5722'],
          description: 'Rose pink gradient'
        }
      ],
      solids: [
        {
          id: 'white',
          name: 'White',
          type: 'solid',
          color: '#ffffff',
          description: 'Pure white background'
        },
        {
          id: 'black',
          name: 'Black',
          type: 'solid',
          color: '#000000',
          description: 'Deep black background'
        },
        {
          id: 'blue',
          name: 'Blue',
          type: 'solid',
          color: '#4F46E5',
          description: 'Professional blue'
        },
        {
          id: 'green',
          name: 'Green',
          type: 'solid',
          color: '#10B981',
          description: 'Nature green'
        },
        {
          id: 'purple',
          name: 'Purple',
          type: 'solid',
          color: '#8B5CF6',
          description: 'Royal purple'
        },
        {
          id: 'pink',
          name: 'Pink',
          type: 'solid',
          color: '#EC4899',
          description: 'Vibrant pink'
        }
      ]
    };

    setBackgrounds(backgroundOptions);
  }, []);

  const categories = [
    { id: 'effects', name: 'AI Effects', icon: <Zap className="w-4 h-4" /> },
    { id: 'gradients', name: 'Gradients', icon: <Palette className="w-4 h-4" /> },
    { id: 'solids', name: 'Solid Colors', icon: <Sparkles className="w-4 h-4" /> }
  ];

  const handleBackgroundSelect = (background) => {
    onBackgroundChange(background);
  };

  const renderBackgroundPreview = (background) => {
    switch (background.type) {
      case 'custom-gradient':
        return (
          <div 
            className="w-full h-12 rounded-lg"
            style={{
              background: `linear-gradient(45deg, ${background.colors[0]}, ${background.colors[1]})`
            }}
          />
        );
      case 'solid':
        return (
          <div 
            className="w-full h-12 rounded-lg border border-gray-200"
            style={{ backgroundColor: background.color }}
          />
        );
      case 'pattern':
        return (
          <div className="w-full h-12 rounded-lg bg-gray-100 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-1">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-1 h-1 bg-gray-400 rounded-full" />
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
            {background.icon}
          </div>
        );
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">AI Backgrounds</h3>
        <p className="text-gray-600 text-sm mt-1">Choose your perfect backdrop</p>
      </div>

      {/* Category Selector */}
      <div className="flex space-x-2 bg-gray-100 rounded-xl p-1">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
              selectedCategory === category.id
                ? 'bg-white shadow-md text-purple-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {category.icon}
            <span className="text-sm font-medium">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Background Options */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {backgrounds[selectedCategory]?.map((background) => (
          <button
            key={background.id}
            onClick={() => handleBackgroundSelect(background)}
            className={`w-full p-3 rounded-xl border-2 text-left transition-all duration-300 hover:scale-105 ${
              currentBackground?.id === background.id
                ? 'border-purple-400 bg-gradient-to-r from-purple-100 to-pink-100 shadow-lg'
                : 'border-gray-200 hover:border-purple-300 bg-white hover:shadow-md'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-16 h-12 rounded-lg overflow-hidden">
                {renderBackgroundPreview(background)}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{background.name}</div>
                <div className="text-xs text-gray-500 mt-1">{background.description}</div>
              </div>
              {currentBackground?.id === background.id && (
                <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* AI Processing Indicator */}
      {currentBackground?.type !== 'none' && (
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-purple-700">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-medium">AI Processing Active</span>
          </div>
          <p className="text-xs text-purple-600 mt-1">
            Background effects are applied in real-time using AI
          </p>
        </div>
      )}
    </div>
  );
};

export default BackgroundSelector;
