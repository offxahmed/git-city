'use client';

import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Suspense } from 'react';
import Building from './Building';
import SkySystem from './SkySystem';
import CityGrid from './CityGrid';
import CameraController from './CameraController';
import { useCityStore } from '@/store/cityStore';

function BuildingLabels() {
  const buildings = useCityStore((s) => s.buildings);

  return (
    <>
      {buildings.map((b) => (
        <Html
          key={`label-${b.id}`}
          position={[b.positionX, b.height + 3, b.positionZ]}
          center
          distanceFactor={40}
          style={{ pointerEvents: 'none' }}
        >
          <div className="building-label">
            <span className="building-label-name">{b.username}</span>
          </div>
        </Html>
      ))}
    </>
  );
}

function CityContent() {
  const buildings = useCityStore((s) => s.buildings);

  return (
    <>
      <SkySystem />
      <CityGrid />
      <CameraController />

      {buildings.map((building) => (
        <Building key={building.id} data={building} />
      ))}

      <BuildingLabels />
    </>
  );
}

export default function CityScene() {
  return (
    <div className="city-canvas-container">
      <Canvas
        shadows
        camera={{
          position: [40, 30, 40],
          fov: 55,
          near: 0.1,
          far: 500,
        }}
        gl={{
          antialias: true,
          toneMapping: 3, // ACESFilmicToneMapping
          toneMappingExposure: 1.2,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={
          <Html center>
            <div className="loading-city">
              <div className="loading-spinner" />
              <p>Building the city...</p>
            </div>
          </Html>
        }>
          <CityContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
