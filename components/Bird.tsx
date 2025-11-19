import React from 'react';
import { BIRD_SIZE } from '../constants';

interface BirdProps {
  y: number;
  rotation: number;
}

const Bird: React.FC<BirdProps> = ({ y, rotation }) => {
  return (
    <div
      className="absolute z-20 transition-transform duration-75 ease-linear"
      style={{
        left: '50px', // Fixed X position
        top: y,
        width: BIRD_SIZE,
        height: BIRD_SIZE,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center',
      }}
    >
      <div className="w-full h-full bg-yellow-400 rounded-full border-2 border-black relative overflow-hidden shadow-sm">
        {/* Eye */}
        <div className="absolute top-1 right-2 w-3 h-3 bg-white rounded-full border border-black">
          <div className="absolute top-1 right-0.5 w-1 h-1 bg-black rounded-full"></div>
        </div>
        {/* Wing */}
        <div className="absolute top-4 left-1 w-4 h-3 bg-white opacity-50 rounded-full"></div>
        {/* Beak */}
        <div className="absolute top-4 -right-1 w-3 h-2 bg-orange-500 border border-black rounded-r-md"></div>
      </div>
    </div>
  );
};

export default Bird;