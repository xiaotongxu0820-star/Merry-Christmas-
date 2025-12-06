import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState, OrnamentData } from '../types';

interface OrnamentGroupProps {
  treeState: TreeState;
}

const BALL_COUNT = 300;
const GIFT_COUNT = 60;
const LIGHT_COUNT = 800;

// Reusable logic to generate positions on a cone surface
const generateOrnamentData = (count: number, type: 'BALL' | 'GIFT' | 'LIGHT'): OrnamentData[] => {
  const data: OrnamentData[] = [];
  const treeHeight = 16;
  const treeRadius = 6;

  for (let i = 0; i < count; i++) {
    // Target Position: Surface of the cone (mostly)
    const h = Math.random() * treeHeight;
    const y = h - (treeHeight / 2) + 2;
    const coneRadius = (1 - (h / treeHeight)) * treeRadius;
    const angle = Math.random() * Math.PI * 2;
    // Push slightly outside foliage for visibility
    const radius = type === 'LIGHT' 
        ? Math.sqrt(Math.random()) * coneRadius * 0.9 // Lights inside
        : coneRadius + 0.2; // Ornaments outside
    
    const tx = radius * Math.cos(angle);
    const tz = radius * Math.sin(angle);
    const ty = y;

    // Chaos Position: Random Sphere
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const rChaos = 20 + Math.random() * 15;
    
    const cx = rChaos * Math.sin(phi) * Math.cos(theta);
    const cy = rChaos * Math.sin(phi) * Math.sin(theta);
    const cz = rChaos * Math.cos(phi);

    // Physics Weights
    let speed = 1.0;
    let scale = 1.0;
    let color = '#ffffff';

    if (type === 'GIFT') {
      speed = 0.8 + Math.random() * 0.5; // Heavy
      scale = 0.4 + Math.random() * 0.4;
      color = Math.random() > 0.5 ? '#8B0000' : '#013220'; // Dark Red or Deep Green boxes
    } else if (type === 'BALL') {
      speed = 1.5 + Math.random() * 1.0; // Medium
      scale = 0.25 + Math.random() * 0.2;
      color = Math.random() > 0.3 ? '#FFD700' : '#B8860B'; // Gold or Dark Gold
    } else {
      speed = 3.0 + Math.random() * 2.0; // Very Fast (Lights)
      scale = 0.08 + Math.random() * 0.05;
      color = '#FFDD88'; // Warm light
    }

    data.push({
      id: i,
      chaosPos: [cx, cy, cz],
      targetPos: [tx, ty, tz],
      scale,
      speed,
      color,
    });
  }
  return data;
};

const InstancedOrnaments: React.FC<{ 
  data: OrnamentData[]; 
  geometry: THREE.BufferGeometry; 
  material: THREE.Material;
  treeState: TreeState 
}> = ({ data, geometry, material, treeState }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  
  // Store current positions to avoid re-creating vectors every frame
  const currentPositions = useMemo(() => {
    return data.map(d => new THREE.Vector3(...d.chaosPos));
  }, [data]);

  const targetVectors = useMemo(() => {
    return data.map(d => new THREE.Vector3(...d.targetPos));
  }, [data]);

  const chaosVectors = useMemo(() => {
    return data.map(d => new THREE.Vector3(...d.chaosPos));
  }, [data]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const isFormed = treeState === TreeState.FORMED;
    
    // Animate instances
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const target = isFormed ? targetVectors[i] : chaosVectors[i];
      
      // Interpolate current position towards target based on item's unique speed (weight)
      currentPositions[i].lerp(target, item.speed * delta);

      // Add slight floating movement
      const floatY = Math.sin(state.clock.elapsedTime * item.speed * 0.5 + item.id) * 0.05;

      tempObject.position.copy(currentPositions[i]);
      if(isFormed) tempObject.position.y += floatY;
      
      tempObject.scale.setScalar(item.scale);
      
      // Rotate slowly
      tempObject.rotation.x = state.clock.elapsedTime * 0.2 + item.id;
      tempObject.rotation.y = state.clock.elapsedTime * 0.3 + item.id;
      
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Set colors once on mount
  useLayoutEffect(() => {
    if (meshRef.current) {
        const tempColor = new THREE.Color();
        for (let i = 0; i < data.length; i++) {
            tempColor.set(data[i].color);
            meshRef.current.setColorAt(i, tempColor);
        }
        meshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [data]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, data.length]}
      castShadow
      receiveShadow
    />
  );
};

export const Ornaments: React.FC<OrnamentGroupProps> = ({ treeState }) => {
  // Geometries
  const ballGeo = useMemo(() => new THREE.SphereGeometry(1, 32, 32), []);
  const boxGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  
  // Materials - LUXURY STYLE
  const goldMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFD700',
    metalness: 1,
    roughness: 0.15,
    envMapIntensity: 1.5,
  }), []);

  const giftMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    metalness: 0.1,
    roughness: 0.2,
    envMapIntensity: 1.0,
  }), []);

  const lightMaterial = useMemo(() => new THREE.MeshBasicMaterial({
     color: '#FFF8E7',
     toneMapped: false 
  }), []);

  // Data Generation
  const balls = useMemo(() => generateOrnamentData(BALL_COUNT, 'BALL'), []);
  const gifts = useMemo(() => generateOrnamentData(GIFT_COUNT, 'GIFT'), []);
  const lights = useMemo(() => generateOrnamentData(LIGHT_COUNT, 'LIGHT'), []);

  return (
    <group>
      <InstancedOrnaments data={balls} geometry={ballGeo} material={goldMaterial} treeState={treeState} />
      <InstancedOrnaments data={gifts} geometry={boxGeo} material={giftMaterial} treeState={treeState} />
      <InstancedOrnaments data={lights} geometry={ballGeo} material={lightMaterial} treeState={treeState} />
    </group>
  );
};