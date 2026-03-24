/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { UIOverlay } from './components/UIOverlay';
import { Ocean, Clouds, Mountains } from './components/Environment';
import { Plane } from './components/Plane';
import { Missile } from './components/Missile';
import { PostEffects } from './components/PostEffects';
import { EffectComposer } from '@react-three/postprocessing';
import { useGameStore } from './store/gameStore';

// Camera Controller with GSAP Shake
const CameraController = () => {
  const { camera } = useThree();
  const initialPos = useRef(new THREE.Vector3(0, 5, 15));
  const gameState = useGameStore(state => state.gameState);

  useEffect(() => {
    if (gameState === 'CRASHED') {
      // GSAP Camera Shake
      const tl = gsap.timeline();
      tl.to(camera.position, {
        x: '+=0.5',
        y: '+=0.5',
        duration: 0.05,
        repeat: 10,
        yoyo: true,
        ease: "power1.inOut",
        onComplete: () => {
          gsap.to(camera.position, {
            x: initialPos.current.x,
            y: initialPos.current.y,
            z: initialPos.current.z,
            duration: 0.5
          });
        }
      });
    }
  }, [gameState, camera]);

  useFrame(() => {
    if (gameState !== 'CRASHED') {
      camera.position.lerp(initialPos.current, 0.1);
    }
    camera.lookAt(0, 0, 0);
  });

  return null;
};

// Game Engine Logic (runs inside Canvas to use useFrame)
const GameEngine = () => {
  const { 
    gameState, 
    startTime, 
    crashPoint, 
    setMultiplier, 
    setAltitude, 
    setDistance, 
    setGameState,
    resetGame 
  } = useGameStore();

  useFrame(() => {
    if (gameState === 'FLYING') {
      const elapsed = (Date.now() - startTime) / 1000;
      
      // Multiplier curve: e^(0.06 * t)
      const currentMultiplier = Math.pow(Math.E, 0.06 * elapsed);
      
      if (currentMultiplier >= crashPoint) {
        setGameState('CRASHED');
        setTimeout(resetGame, 4000);
        return;
      }

      // Update store (this will trigger UI re-renders for multiplier)
      // For 3D components, we could use refs, but here we update the store
      setMultiplier(currentMultiplier);
      setAltitude(Math.floor(Math.pow(elapsed, 2) * 100));
      setDistance(Math.floor(elapsed * 250));
    }
  });

  return null;
};

export default function App() {
  const { 
    gameState, 
    multiplier, 
    altitude, 
    distance, 
    balance, 
    bet,
    setBet,
    startFlight,
    cashOut
  } = useGameStore();

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#050505]">
      {/* Layer 1: Mesh Gradient Sky */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-black animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 5, 15]} fov={50} />
        <CameraController />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />

        <Suspense fallback={null}>
          <Plane 
            velocityY={gameState === 'FLYING' ? 0.1 : 0} 
            isCrashed={gameState === 'CRASHED'} 
          />
        </Suspense>
        
        <Missile 
          active={gameState === 'CRASHED'} 
          targetY={0} // Simplified for now
        />

        <Ocean />
        <Clouds />
        <Mountains />

        <GameEngine />

        <EffectComposer>
          <PostEffects />
        </EffectComposer>
      </Canvas>

      <UIOverlay 
        multiplier={multiplier}
        altitude={altitude}
        distance={distance}
        gameState={gameState}
        balance={balance}
        bet={bet}
        onBetChange={setBet}
        onStart={startFlight}
        onCashOut={cashOut}
      />

      {/* Visual Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://res.cloudinary.com/dzv9v4o7z/image/upload/v1678220202/noise_v0f2v2.png')] bg-repeat" />
    </div>
  );
}
