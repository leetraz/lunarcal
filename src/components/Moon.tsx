import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface MoonProps {
  phase: number;
}

const Moon = ({ phase }: MoonProps) => {
  const moonRef = useRef<THREE.Mesh>(null);
  
  // Using high-quality textures from the local public directory
  const textures = useTexture({
    map: '/textures/moon.jpg',
    bumpMap: '/textures/moon.jpg',
  });

  useFrame(() => {
    if (moonRef.current) {
      // Very slow, realistic rotation
      moonRef.current.rotation.y += 0.0004;
    }
  });

  // Calculate lighting to match Northern Hemisphere observation
  // Phase 0: New Moon (behind), 0.25: First Quarter (right), 0.5: Full (front), 0.75: Last Quarter (left)
  const angle = (0.5 - phase) * Math.PI * 2;
  const lightDistance = 25;
  const lightX = Math.sin(angle) * lightDistance;
  const lightZ = Math.cos(angle) * lightDistance;

  return (
    <>
      {/* Absolute dark space has almost no ambient light */}
      <ambientLight intensity={0.01} />
      
      {/* Harsh Sun light */}
      <directionalLight 
        position={[lightX, 2, lightZ]} 
        intensity={3.5} 
        color="#fffaf0" 
      />

      {/* Earthshine - Very subtle blue bounce from Earth */}
      <pointLight position={[-lightX, -1, -lightZ]} intensity={0.3} color="#5577aa" />

      <Sphere ref={moonRef} args={[3, 128, 128]} rotation={[0, Math.PI, 0]}>
        <meshStandardMaterial 
          {...textures}
          bumpScale={0.05}
          roughness={1}
          metalness={0}
        />
      </Sphere>

      {/* Fresnel Rim Glow to simulate edge lighting from Sun */}
      <Sphere args={[3.02, 128, 128]}>
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
    </>
  );
};

export default Moon;
