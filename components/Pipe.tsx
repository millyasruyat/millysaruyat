import React from 'react';
import { PIPE_WIDTH, GAME_HEIGHT, PIPE_GAP } from '../constants';
import { PipeData } from '../types';

interface PipeProps {
  pipe: PipeData;
}

const Pipe: React.FC<PipeProps> = ({ pipe }) => {
  return (
    <>
      {/* Top Pipe */}
      <div
        className="absolute bg-green-500 border-2 border-black z-10"
        style={{
          left: pipe.x,
          top: 0,
          width: PIPE_WIDTH,
          height: pipe.topHeight,
          borderBottomWidth: 4,
          borderBottomColor: '#0f391a', // Darker rim
        }}
      >
        {/* Highlight */}
        <div className="absolute top-0 left-1 w-2 h-full bg-green-400 opacity-50"></div>
        <div className="absolute top-0 right-1 w-1 h-full bg-green-800 opacity-20"></div>
      </div>

      {/* Bottom Pipe */}
      <div
        className="absolute bg-green-500 border-2 border-black z-10"
        style={{
          left: pipe.x,
          top: pipe.topHeight + PIPE_GAP,
          width: PIPE_WIDTH,
          height: GAME_HEIGHT - (pipe.topHeight + PIPE_GAP),
          borderTopWidth: 4,
          borderTopColor: '#0f391a', // Darker rim
        }}
      >
        {/* Highlight */}
        <div className="absolute top-0 left-1 w-2 h-full bg-green-400 opacity-50"></div>
        <div className="absolute top-0 right-1 w-1 h-full bg-green-800 opacity-20"></div>
      </div>
    </>
  );
};

export default Pipe;