import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import * as THREE from 'three';
import Experience from './components/Experience';
import UIOverlay from './components/UIOverlay';
import { TreeState } from './types';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.CHAOS);

  return (
    <div className="relative w-full h-screen bg-[#010a05]">
      {/* UI Layer */}
      <UIOverlay currentState={treeState} onToggle={setTreeState} />

      {/* 3D Canvas */}
      <Canvas
        dpr={[1, 2]} // Quality scaling for retina
        camera={{ position: [0, 4, 25], fov: 45 }}
        gl={{ 
          antialias: false, // Postprocessing handles AA or we use pixel art style, but here we want performance for bloom
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0
        }}
        shadows
      >
        <Suspense fallback={null}>
            <Experience treeState={treeState} />
        </Suspense>
      </Canvas>
      
      {/* Loading Screen */}
      <Loader 
        containerStyles={{ background: '#010a05' }}
        innerStyles={{ background: '#222', width: '200px' }}
        barStyles={{ background: '#FFD700', height: '5px' }}
        dataStyles={{ color: '#FFD700', fontFamily: 'serif', fontSize: '1.2rem' }}
        dataInterpolation={(p) => `Loading Luxury ${p.toFixed(0)}%`}
      />
    </div>
  );
};

export default App;