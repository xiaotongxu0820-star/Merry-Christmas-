import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';

export const Star: React.FC<{ treeState: TreeState }> = ({ treeState }) => {
  const ref = useRef<THREE.Group>(null);
  const targetPos = new THREE.Vector3(0, 10.5, 0); // Top of tree
  const chaosPos = new THREE.Vector3(0, 20, 10); // Floating above
  const currentPos = useRef(new THREE.Vector3(0, 20, 10));

  useFrame((state, delta) => {
    if (!ref.current) return;
    
    const target = treeState === TreeState.FORMED ? targetPos : chaosPos;
    currentPos.current.lerp(target, delta * 2);
    
    ref.current.position.copy(currentPos.current);
    ref.current.rotation.y += delta * 0.5;
    
    // Scale pulsing
    const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    ref.current.scale.setScalar(scale);
  });

  return (
    <group ref={ref}>
      <mesh>
        <octahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial 
          color="#FFD700" 
          emissive="#FFD700"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
      {/* Glow Halo */}
      <pointLight distance={10} intensity={5} color="#FFD700" />
    </group>
  );
};