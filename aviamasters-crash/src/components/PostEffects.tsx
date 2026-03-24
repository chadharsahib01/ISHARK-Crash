import { Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export const PostEffects = () => {
  return (
    <>
      <Bloom 
        intensity={1.5} 
        luminanceThreshold={0.9} 
        luminanceSmoothing={0.025} 
        mipmapBlur 
      />
      <ChromaticAberration 
        offset={new THREE.Vector2(0.002, 0.002)} 
        blendFunction={BlendFunction.NORMAL} 
      />
      <Noise opacity={0.05} />
      <Vignette eskil={false} offset={0.1} darkness={1.1} />
    </>
  );
};

import * as THREE from 'three';
