import React from 'react';
import { Sparkles, Heart, Star, Smile, Cake, Gift, Music, Camera } from 'lucide-react';

const PhotoboothProps = ({ onPropSelect }) => {
  const props = [
    { id: 'hearts', icon: Heart, color: 'text-red-500' },
    { id: 'stars', icon: Star, color: 'text-yellow-500' },
    { id: 'sparkles', icon: Sparkles, color: 'text-purple-500' },
    { id: 'smile', icon: Smile, color: 'text-green-500' },
    { id: 'cake', icon: Cake, color: 'text-pink-500' },
    { id: 'gift', icon: Gift, color: 'text-blue-500' },
    { id: 'music', icon: Music, color: 'text-indigo-500' },
    { id: 'camera', icon: Camera, color: 'text-gray-500' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
        Digital Props
      </h3>
      
      <div className="grid grid-cols-4 gap-2">
        {props.map(({ id, icon: Icon, color }) => (
          <button
            key={id}
            onClick={() => onPropSelect(id)}
            className="p-3 rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-all hover:scale-110"
          >
            <Icon className={`w-6 h-6 mx-auto ${color}`} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default PhotoboothProps;