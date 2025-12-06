import React from 'react';
import { TreeState } from '../types';

interface UIOverlayProps {
  currentState: TreeState;
  onToggle: (state: TreeState) => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ currentState, onToggle }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-8 z-10">
      
      {/* Header */}
      <div className="text-center pointer-events-auto">
        <h1 className="text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-[#FFF7CC] to-[#B8860B] font-bold drop-shadow-md tracking-widest" style={{ fontFamily: 'Cinzel, serif' }}>
          THE GRAND TREE
        </h1>
        <p className="text-[#D4AF37] text-sm md:text-lg tracking-[0.3em] mt-2 uppercase font-serif">
          Luxury • Opulence • Celebration
        </p>
      </div>

      {/* Control Panel */}
      <div className="flex flex-col items-center gap-6 pointer-events-auto pb-8">
        <div className="flex gap-8">
          <button
            onClick={() => onToggle(TreeState.CHAOS)}
            className={`
              relative px-8 py-3 overflow-hidden transition-all duration-500
              border-2 ${currentState === TreeState.CHAOS ? 'border-[#FFD700]' : 'border-[#4b3b18]'}
              bg-black/40 backdrop-blur-sm group
            `}
          >
            <span className={`absolute inset-0 w-full h-full bg-gradient-to-r from-[#B8860B] to-[#FFD700] opacity-0 group-hover:opacity-20 transition-opacity ${currentState === TreeState.CHAOS ? 'opacity-30' : ''}`}></span>
            <span className={`relative text-lg font-serif tracking-widest ${currentState === TreeState.CHAOS ? 'text-[#FFD700]' : 'text-gray-500'} group-hover:text-[#FFD700] transition-colors`}>
              CHAOS
            </span>
          </button>

          <button
            onClick={() => onToggle(TreeState.FORMED)}
            className={`
              relative px-8 py-3 overflow-hidden transition-all duration-500
              border-2 ${currentState === TreeState.FORMED ? 'border-[#FFD700]' : 'border-[#4b3b18]'}
              bg-black/40 backdrop-blur-sm group
            `}
          >
             <span className={`absolute inset-0 w-full h-full bg-gradient-to-r from-[#B8860B] to-[#FFD700] opacity-0 group-hover:opacity-20 transition-opacity ${currentState === TreeState.FORMED ? 'opacity-30' : ''}`}></span>
             <span className={`relative text-lg font-serif tracking-widest ${currentState === TreeState.FORMED ? 'text-[#FFD700]' : 'text-gray-500'} group-hover:text-[#FFD700] transition-colors`}>
              GLORY
            </span>
          </button>
        </div>
        
        <div className="w-64 h-px bg-gradient-to-r from-transparent via-[#B8860B] to-transparent opacity-50"></div>
      </div>
    </div>
  );
};

export default UIOverlay;