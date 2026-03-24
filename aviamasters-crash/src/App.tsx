/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { UIOverlay } from './components/UIOverlay';
import { Ocean, Clouds, Mountains } from './components/Environment';
import { Plane } from './components/Plane';
import { Missile } from './components/Missile';
import { PostEffects } from './components/PostEffects';
import { EffectComposer } from '@react-three/postprocessing';

// Camera Shake Component
const CameraController = ({ isShaking }: { isShaking: boolean }) => {
  const { camera } = useThree();
  const initialPos = useRef(new THREE.Vector3(0, 5, 15));

  useFrame((state) => {
    if (isShaking) {
      const shake = 0.2;
      camera.position.x = initialPos.current.x + (Math.random() - 0.5) * shake;
      camera.position.y = initialPos.current.y + (Math.random() - 0.5) * shake;
    } else {
      camera.position.lerp(initialPos.current, 0.1);
    }
    camera.lookAt(0, 0, 0);
  });

  return null;
};

export default function App() {
  const [gameState, setGameState] = useState<'IDLE' | 'FLYING' | 'CRASHED'>('IDLE');
  const [multiplier, setMultiplier] = useState(1.0);
  const [altitude, setAltitude] = useState(0);
  const [distance, setDistance] = useState(0);
  const [balance, setBalance] = useState(1000.0);
  const [bet, setBet] = useState(10.0);
  const [isShaking, setIsShaking] = useState(false);
  const [crashPoint, setCrashPoint] = useState(0);
  
  const startTime = useRef(0);
  const requestRef = useRef<number>(0);
  const planeRef = useRef<any>(null);

  const startFlight = useCallback(() => {
    if (balance < bet) return;
    
    setBalance(prev => prev - bet);
    setGameState('FLYING');
    setMultiplier(1.0);
    setAltitude(0);
    setDistance(0);
    
    // Generate random crash point (exponential distribution for house edge)
    const random = Math.random();
    const crashAt = Math.max(1.01, 0.99 / (1 - random));
    setCrashPoint(crashAt);
    
    startTime.current = Date.now();
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  }, [balance, bet]);

  const cashOut = useCallback(() => {
    if (gameState !== 'FLYING') return;
    
    const winAmount = bet * multiplier;
    setBalance(prev => prev + winAmount);
    setGameState('IDLE');
    // We keep flying but player is out
  }, [gameState, bet, multiplier]);

  const resetGame = useCallback(() => {
    setGameState('IDLE');
    setMultiplier(1.0);
    setAltitude(0);
    setDistance(0);
  }, []);

  useEffect(() => {
    if (gameState === 'FLYING') {
      const update = () => {
        const elapsed = (Date.now() - startTime.current) / 1000;
        
        // Multiplier curve: e^(0.06 * t)
        const currentMultiplier = Math.pow(Math.E, 0.06 * elapsed);
        
        if (currentMultiplier >= crashPoint) {
          setGameState('CRASHED');
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 300);
          setTimeout(resetGame, 3000);
          return;
        }

        setMultiplier(currentMultiplier);
        setAltitude(Math.floor(Math.pow(elapsed, 2) * 100));
        setDistance(Math.floor(elapsed * 250));
        
        // Move plane up slightly
        if (planeRef.current?.group) {
          planeRef.current.group.position.y = Math.sin(elapsed * 0.5) * 2;
        }

        requestRef.current = requestAnimationFrame(update);
      };
      requestRef.current = requestAnimationFrame(update);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, crashPoint, resetGame]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#050505]">
      {/* Layer 1: Mesh Gradient Sky */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-black animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 5, 15]} fov={50} />
        <CameraController isShaking={isShaking} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />

        <Plane 
          ref={planeRef} 
          velocityY={gameState === 'FLYING' ? 0.1 : 0} 
          isCrashed={gameState === 'CRASHED'} 
        />
        
        <Missile 
          active={gameState === 'CRASHED'} 
          targetY={planeRef.current?.group?.position?.y || 0} 
        />

        <Ocean />
        <Clouds />
        <Mountains />

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
