import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';

interface FoliageProps {
  treeState: TreeState;
}

const COUNT = 25000;
const TREE_HEIGHT = 16;
const TREE_RADIUS = 6;

const vertexShader = `
  uniform float uProgress;
  uniform float uTime;
  
  attribute vec3 aChaosPos;
  attribute vec3 aTargetPos;
  attribute float aRandom;
  
  varying vec2 vUv;
  varying float vAlpha;

  // Cubic ease out for smoother transition
  float easeOutCubic(float x) {
    return 1.0 - pow(1.0 - x, 3.0);
  }

  void main() {
    vUv = uv;
    
    // Add some noise to the motion based on randomness
    float localProgress = clamp(uProgress * 1.2 - aRandom * 0.2, 0.0, 1.0);
    localProgress = easeOutCubic(localProgress);

    vec3 pos = mix(aChaosPos, aTargetPos, localProgress);
    
    // Slight wind effect when formed
    if (localProgress > 0.9) {
      pos.x += sin(uTime * 2.0 + pos.y) * 0.05 * (1.0 - pos.y / 20.0);
      pos.z += cos(uTime * 1.5 + pos.y) * 0.05 * (1.0 - pos.y / 20.0);
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    gl_PointSize = (4.0 * (1.0 + aRandom)) * (20.0 / -mvPosition.z);
    vAlpha = 0.8 + 0.2 * sin(uTime + aRandom * 10.0);
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    // Circular particle
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
    if (r > 1.0) discard;

    // Gradient for "needle" look (center bright, edge dark)
    vec3 color = mix(uColor * 1.5, uColor * 0.5, r);
    
    gl_FragColor = vec4(color, vAlpha);
  }
`;

const Foliage: React.FC<FoliageProps> = ({ treeState }) => {
  const meshRef = useRef<THREE.Points>(null);
  
  // Initialize Shader Uniforms
  const uniforms = useMemo(() => ({
    uProgress: { value: 0 },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#004d25') }, // Deep emerald green
  }), []);

  // Generate Geometry Data
  const { positions, chaosPositions, randoms } = useMemo(() => {
    const chaosPosArray = new Float32Array(COUNT * 3);
    const targetPosArray = new Float32Array(COUNT * 3);
    const randomArray = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      // Chaos: Random sphere distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 15 + Math.random() * 15; // Spread out
      
      chaosPosArray[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      chaosPosArray[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      chaosPosArray[i * 3 + 2] = r * Math.cos(phi);

      // Target: Cone distribution
      const h = Math.random() * TREE_HEIGHT; // 0 to Height
      const y = h - (TREE_HEIGHT / 2) + 2; // Center roughly
      
      // Radius decreases as height increases
      const coneRadius = (1 - (h / TREE_HEIGHT)) * TREE_RADIUS;
      const angle = Math.random() * Math.PI * 2;
      // Volume distribution adjustment
      const radius = Math.sqrt(Math.random()) * coneRadius; 

      targetPosArray[i * 3] = radius * Math.cos(angle);
      targetPosArray[i * 3 + 1] = y;
      targetPosArray[i * 3 + 2] = radius * Math.sin(angle);

      randomArray[i] = Math.random();
    }

    return {
      positions: targetPosArray, // Initial buffer (will be overridden by shader)
      chaosPositions: chaosPosArray,
      randoms: randomArray
    };
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Lerp progress based on state
      const targetProgress = treeState === TreeState.FORMED ? 1.0 : 0.0;
      material.uniforms.uProgress.value = THREE.MathUtils.damp(
        material.uniforms.uProgress.value,
        targetProgress,
        2.5, // Speed
        delta
      );
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position" // Used for initial bounding box, shader overrides visual
          count={COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTargetPos"
          count={COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aChaosPos"
          count={COUNT}
          array={chaosPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={COUNT}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Foliage;