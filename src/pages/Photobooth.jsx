import React, { useState } from 'react';
import PhotoboothCapture from '../components/PhotoboothCapture';
import PhotoboothProps from '../components/PhotoboothProps';
import { Camera } from 'lucide-react';

const Photobooth = () => {
  const [selectedProp, setSelectedProp] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100">
      {/* Fun Header */}
      <div className="text-center py-8">
        <div className="inline-block">
          <h1 className="photobooth-header flex items-center">
            <Camera className="w-8 h-8 mr-3" />
            AI Photo Booth
          </h1>
        </div>
        <p className="text-gray-600 mt-4">Strike a pose and create amazing photo strips!</p>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-8">
        <div className="photobooth-frame">
          <PhotoboothCapture selectedProp={selectedProp} />
        </div>
        
        {/* Props Section */}
        <div className="mt-6">
          <PhotoboothProps onPropSelect={setSelectedProp} />
        </div>
      </div>
    </div>
  );
};

export default Photobooth;