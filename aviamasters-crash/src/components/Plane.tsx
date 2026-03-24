import { useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, Svg } from '@react-three/drei';

// A high-detail SVG plane path (simplified for this example but can be replaced with complex SVG)
const PLANE_SVG = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M10,50 L40,45 L90,50 L40,55 Z" fill="#00ff9d" />
  <path d="M40,45 L45,20 L55,20 L50,45 Z" fill="#00cc7e" />
  <path d="M40,55 L45,80 L55,80 L50,55 Z" fill="#00cc7e" />
</svg>
`;

export const Plane = forwardRef((props: { velocityY: number; isCrashed: boolean }, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  const engineGlowRef = useRef<THREE.PointLight>(null);

  useImperativeHandle(ref, () => ({
    group: groupRef.current
  }));

  useFrame((state) => {
    if (!groupRef.current || props.isCrashed) return;

    // Inertia Pitching: tilt based on velocity
    const targetRotationZ = THREE.MathUtils.clamp(props.velocityY * 0.5, -0.3, 0.3);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      targetRotationZ,
      0.1
    );

    // Engine glow flicker
    if (engineGlowRef.current) {
      engineGlowRef.current.intensity = 2 + Math.sin(state.clock.getElapsedTime() * 20) * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <group rotation={[0, -Math.PI / 2, 0]} scale={0.05}>
           {/* In a real production app, we'd use a GLTF model, but here we use a stylized SVG-based mesh */}
           <mesh>
             <boxGeometry args={[20, 5, 60]} />
             <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
           </mesh>
           <mesh position={[0, 0, 25]} rotation={[Math.PI / 2, 0, 0]}>
             <coneGeometry args={[3, 10, 32]} />
             <meshBasicMaterial color="#00ff9d" />
             <pointLight ref={engineGlowRef} color="#00ff9d" distance={10} />
           </mesh>
           {/* Wings */}
           <mesh position={[0, 0, 0]}>
             <boxGeometry args={[60, 1, 15]} />
             <meshStandardMaterial color="#333" />
           </mesh>
        </group>
      </Float>
    </group>
  );
});
