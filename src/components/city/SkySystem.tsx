'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { useCityStore } from '@/store/cityStore';

export default function SkySystem() {
  const timeOfDay = useCityStore((s) => s.timeOfDay);

  const isNight = timeOfDay < 0.25 || timeOfDay > 0.75;
  const isDawn = timeOfDay >= 0.2 && timeOfDay <= 0.3;
  const isDusk = timeOfDay >= 0.7 && timeOfDay <= 0.8;

  // Sun position based on time
  const sunPosition = useMemo(() => {
    const angle = (timeOfDay - 0.25) * Math.PI * 2;
    return new THREE.Vector3(
      Math.cos(angle) * 100,
      Math.sin(angle) * 100,
      50
    );
  }, [timeOfDay]);

  // Sky colors based on time
  const skyColors = useMemo(() => {
    if (isNight) {
      return { top: '#0B1026', bottom: '#1a1a3e', ambient: '#1a1a4e', fog: '#0B1026' };
    }
    if (isDawn) {
      return { top: '#4a90d9', bottom: '#ff9966', ambient: '#ffc8a0', fog: '#e8c8a8' };
    }
    if (isDusk) {
      return { top: '#2b3570', bottom: '#ff6b35', ambient: '#ffaa80', fog: '#d49070' };
    }
    // Day
    return { top: '#87CEEB', bottom: '#E0F6FF', ambient: '#ffffff', fog: '#c8e8ff' };
  }, [isNight, isDawn, isDusk]);

  // Stars
  const stars = useMemo(() => {
    const positions = new Float32Array(1500 * 3);
    for (let i = 0; i < 1500; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 400;
      positions[i * 3 + 1] = Math.random() * 150 + 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 400;
    }
    return positions;
  }, []);

  return (
    <>
      {/* Sky dome */}
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[200, 32, 32]} />
        <shaderMaterial
          side={THREE.BackSide}
          uniforms={{
            topColor: { value: new THREE.Color(skyColors.top) },
            bottomColor: { value: new THREE.Color(skyColors.bottom) },
          }}
          vertexShader={`
            varying vec3 vWorldPosition;
            void main() {
              vec4 worldPos = modelMatrix * vec4(position, 1.0);
              vWorldPosition = worldPos.xyz;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            varying vec3 vWorldPosition;
            void main() {
              float h = normalize(vWorldPosition).y;
              gl_FragColor = vec4(mix(bottomColor, topColor, max(h, 0.0)), 1.0);
            }
          `}
        />
      </mesh>

      {/* Sun */}
      {!isNight && (
        <mesh position={sunPosition}>
          <sphereGeometry args={[5, 16, 16]} />
          <meshBasicMaterial color="#FFD700" />
        </mesh>
      )}

      {/* Moon */}
      {isNight && (
        <mesh position={[80, 80, 30]}>
          <sphereGeometry args={[4, 16, 16]} />
          <meshBasicMaterial color="#e8e8ff" />
        </mesh>
      )}

      {/* Stars at night */}
      {isNight && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={1500}
              array={stars}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial color="#ffffff" size={0.5} sizeAttenuation transparent opacity={0.8} />
        </points>
      )}

      {/* Directional light (sun/moon) */}
      <directionalLight
        position={isNight ? [80, 80, 30] : [sunPosition.x, sunPosition.y, sunPosition.z]}
        intensity={isNight ? 0.3 : 1.5}
        color={isNight ? '#6688cc' : (isDawn || isDusk ? '#ffa060' : '#ffffff')}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={300}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />

      {/* Ambient light */}
      <ambientLight
        intensity={isNight ? 0.15 : 0.5}
        color={skyColors.ambient}
      />

      {/* Hemisphere light for natural fill */}
      <hemisphereLight
        color={skyColors.top}
        groundColor="#3a3a3a"
        intensity={isNight ? 0.1 : 0.4}
      />

      {/* Fog */}
      <fog attach="fog" args={[skyColors.fog, 30, 200]} />
    </>
  );
}
