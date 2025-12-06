import React from 'react';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { TreeState } from '../types';
import Foliage from './Foliage';
import { Ornaments } from './Ornaments';
import { Star } from './Star';

interface ExperienceProps {
  treeState: TreeState;
}

const Experience: React.FC<ExperienceProps> = ({ treeState }) => {
  return (
    <>
      {/* Camera Controls */}
      <OrbitControls 
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 1.8} 
        enablePan={false}
        minDistance={10}
        maxDistance={40}
      />

      {/* Lighting & Environment - High Luxury Lobby Feel */}
      <Environment preset="lobby" />
      <ambientLight intensity={0.2} />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={2} 
        castShadow 
        shadow-bias={-0.0001}
        color="#fff0d6"
      />
      <pointLight position={[-10, 5, -10]} intensity={1} color="#00ff40" />

      {/* The Christmas Tree System */}
      <group position={[0, -4, 0]}>
        <Foliage treeState={treeState} />
        <Ornaments treeState={treeState} />
        <Star treeState={treeState} />
        
        {/* Ground Reflection */}
        <ContactShadows 
          opacity={0.7} 
          scale={30} 
          blur={2} 
          far={4} 
          resolution={256} 
          color="#000000" 
        />
      </group>

      {/* Cinematic Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.8} 
          mipmapBlur 
          intensity={1.2} 
          radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};

export default Experience;