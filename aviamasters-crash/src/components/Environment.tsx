import * as THREE from 'three';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

export const Ocean = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const shaderArgs = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#001a33') },
      uGlowColor: { value: new THREE.Color('#00ff9d') },
      uPlanePos: { value: new THREE.Vector3(0, 0, 0) }
    },
    vertexShader: `
      varying vec2 vUv;
      varying float vElevation;
      uniform float uTime;
      
      void main() {
        vUv = uv;
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        
        float elevation = sin(modelPosition.x * 0.5 + uTime) * 0.2 
                        + sin(modelPosition.z * 0.5 + uTime * 0.8) * 0.2;
        
        modelPosition.y += elevation;
        vElevation = elevation;
        
        gl_Position = projectionMatrix * viewMatrix * modelPosition;
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying float vElevation;
      uniform vec3 uColor;
      uniform vec3 uGlowColor;
      uniform vec3 uPlanePos;
      
      void main() {
        float dist = distance(vUv * 20.0, uPlanePos.xz);
        float glow = exp(-dist * 0.5) * 0.5;
        
        vec3 finalColor = mix(uColor, uGlowColor, vElevation * 0.5 + 0.5);
        finalColor += uGlowColor * glow;
        
        gl_FragColor = vec4(finalColor, 0.8);
      }
    `
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
      <planeGeometry args={[100, 100, 64, 64]} />
      <shaderMaterial 
        args={[shaderArgs]} 
        transparent 
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export const Clouds = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 20;

  const shaderArgs = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      uniform float uTime;
      
      void main() {
        vUv = uv;
        vec4 mvPosition = instanceMatrix * vec4(position, 1.0);
        mvPosition.z += sin(uTime * 0.2 + mvPosition.x * 0.1) * 2.0;
        gl_Position = projectionMatrix * modelViewMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      void main() {
        float d = distance(vUv, vec2(0.5));
        float alpha = smoothstep(0.5, 0.2, d) * 0.3;
        gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
      }
    `
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime();
      meshRef.current.position.x -= 0.05;
      if (meshRef.current.position.x < -50) meshRef.current.position.x = 50;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} position={[0, 5, -10]}>
      <planeGeometry args={[10, 5]} />
      <shaderMaterial args={[shaderArgs]} transparent depthWrite={false} />
    </instancedMesh>
  );
};

export const Mountains = () => {
  return (
    <group position={[0, -2, -20]}>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[(i - 2) * 30, 0, 0]}>
          <coneGeometry args={[15, 20, 4]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
      ))}
    </group>
  );
};
