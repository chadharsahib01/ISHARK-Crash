import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Missile = ({ targetY, active }: { targetY: number; active: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const speed = 1.5;

  useFrame(() => {
    if (!meshRef.current || !active) return;

    // Homing logic
    meshRef.current.position.x -= speed;
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.1);
    
    // Rotation towards movement
    meshRef.current.rotation.z = Math.PI;
  });

  if (!active) return null;

  return (
    <mesh ref={meshRef} position={[30, targetY + 5, 0]}>
      <cylinderGeometry args={[0.2, 0.2, 2, 8]} />
      <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={2} />
      <pointLight color="#ff4400" intensity={5} distance={5} />
    </mesh>
  );
};
