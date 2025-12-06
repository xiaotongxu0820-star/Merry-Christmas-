import * as THREE from 'three';

export enum TreeState {
  CHAOS = 'CHAOS',
  FORMED = 'FORMED'
}

export interface OrnamentData {
  id: number;
  chaosPos: [number, number, number]; // [x, y, z]
  targetPos: [number, number, number]; // [x, y, z]
  scale: number;
  speed: number; // For weight simulation (heavier = slower)
  color: string;
}

export interface FoliageUniforms {
  uProgress: { value: number };
  uTime: { value: number };
  uColor: { value: THREE.Color };
}