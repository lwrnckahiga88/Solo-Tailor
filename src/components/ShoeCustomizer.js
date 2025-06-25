import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function ShoeModel({ config }) {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Main shoe body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 0.8, 4]} />
        <meshStandardMaterial 
          color={config.primaryColor}
          roughness={config.material === 'leather' ? 0.8 : 0.2}
          metalness={config.material === 'synthetic' ? 0.3 : 0.1}
        />
      </mesh>
      
      {/* Shoe sole */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[2.2, 0.3, 4.2]} />
        <meshStandardMaterial 
          color={config.secondaryColor}
          roughness={0.9}
        />
      </mesh>
      
      {/* Shoe laces */}
      {[...Array(5)].map((_, i) => (
        <mesh key={i} position={[0, 0.2 - i * 0.1, 1.5 - i * 0.3]}>
          <cylinderGeometry args={[0.02, 0.02, 1.5]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      ))}
    </group>
  );
}

function ShoeCustomizer({ config }) {
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <Canvas
        camera={{ position: [5, 2, 5], fov: 50 }}
        shadows
      >
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.2} />
        
        <ShoeModel config={config} />
        
        <ContactShadows 
          position={[0, -1, 0]} 
          opacity={0.4} 
          scale={10} 
          blur={2.5} 
          far={4.5} 
        />
        
        <Environment preset="city" />
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={15}
        />
      </Canvas>
    </div>
  );
}

export default ShoeCustomizer;
