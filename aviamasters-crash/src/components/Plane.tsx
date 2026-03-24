import { useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, Trail } from '@react-three/drei';

const ProceduralPlane = ({ velocityY, isCrashed }: { velocityY: number; isCrashed: boolean }) => {
  const modelRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!modelRef.current || isCrashed) return;

    // Inertia Pitching: tilt based on velocity
    const targetRotationZ = THREE.MathUtils.clamp(velocityY * 0.5, -0.3, 0.3);
    modelRef.current.rotation.z = THREE.MathUtils.lerp(
      modelRef.current.rotation.z,
      targetRotationZ,
      0.1
    );
    
    // Subtle roll and bobbing
    modelRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 2) * 0.05;
    modelRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.2;
  });

  return (
    <group ref={modelRef} rotation={[0, -Math.PI / 2, 0]}>
      {/* Fuselage */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.3, 4, 32]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Cockpit */}
      <mesh position={[0, 0.3, 1]} castShadow>
        <sphereGeometry args={[0.4, 32, 32]} scale={[1, 0.6, 1.5]} />
        <meshStandardMaterial color="#1f2937" metalness={1} roughness={0} transparent opacity={0.7} />
      </mesh>

      {/* Main Wings */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[5, 0.05, 1.2]} />
        <meshStandardMaterial color="#d1d5db" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Tail Fins */}
      <group position={[0, 0, -1.8]}>
        {/* Horizontal Stabilizer */}
        <mesh castShadow>
          <boxGeometry args={[1.5, 0.05, 0.6]} />
          <meshStandardMaterial color="#d1d5db" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Vertical Stabilizer */}
        <mesh position={[0, 0.4, 0]} rotation={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.05, 0.8, 0.5]} />
          <meshStandardMaterial color="#d1d5db" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* Engine Glow */}
      <mesh position={[0, 0, -2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
        <meshBasicMaterial color="#00ff9d" />
        <pointLight color="#00ff9d" intensity={5} distance={10} />
      </mesh>
    </group>
  );
};

export const Plane = forwardRef((props: { velocityY: number; isCrashed: boolean }, ref) => {
  const groupRef = useRef<THREE.Group>(null);

  useImperativeHandle(ref, () => ({
    group: groupRef.current
  }));

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <ProceduralPlane velocityY={props.velocityY} isCrashed={props.isCrashed} />

        {/* Trail Effect */}
        <Trail
          width={1.2}
          length={12}
          color={new THREE.Color('#00ff9d')}
          attenuation={(t) => t * t}
        >
          <mesh position={[0, 0, -2]} visible={false}>
            <sphereGeometry args={[0.1]} />
          </mesh>
        </Trail>
      </Float>
    </group>
  );
});
