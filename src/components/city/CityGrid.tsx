'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { useCityStore } from '@/store/cityStore';

export default function CityGrid() {
  const buildings = useCityStore((s) => s.buildings);
  const timeOfDay = useCityStore((s) => s.timeOfDay);
  const isNight = timeOfDay < 0.25 || timeOfDay > 0.75;

  // Calculate grid bounds based on buildings
  const gridSize = useMemo(() => {
    if (buildings.length === 0) return 100;
    const maxDist = buildings.reduce((max, b) => {
      return Math.max(max, Math.abs(b.positionX), Math.abs(b.positionZ));
    }, 0);
    return Math.max(100, maxDist + 40);
  }, [buildings]);

  // Road network texture
  const groundTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Asphalt base
    ctx.fillStyle = isNight ? '#1a1f2e' : '#2D3748';
    ctx.fillRect(0, 0, size, size);

    // Add some noise for texture
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`;
      ctx.fillRect(x, y, 1, 1);
    }

    // Grid lines (roads)
    ctx.strokeStyle = isNight ? '#2a3040' : '#4A5568';
    ctx.lineWidth = 2;
    const gridSpacing = size / 8;

    for (let i = 0; i <= 8; i++) {
      // Horizontal
      ctx.beginPath();
      ctx.moveTo(0, i * gridSpacing);
      ctx.lineTo(size, i * gridSpacing);
      ctx.stroke();
      // Vertical
      ctx.beginPath();
      ctx.moveTo(i * gridSpacing, 0);
      ctx.lineTo(i * gridSpacing, size);
      ctx.stroke();
    }

    // Road markings (dashed center lines)
    ctx.strokeStyle = isNight ? '#3a4558' : '#718096';
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 8]);
    for (let i = 0; i <= 8; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * gridSpacing + gridSpacing / 2);
      ctx.lineTo(size, i * gridSpacing + gridSpacing / 2);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(gridSize / 20, gridSize / 20);
    return texture;
  }, [isNight, gridSize]);

  return (
    <>
      {/* Main ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[gridSize * 2, gridSize * 2]} />
        <meshStandardMaterial
          map={groundTexture}
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>

      {/* Street lights (for night) */}
      {isNight && buildings.slice(0, 20).map((building, i) => (
        <pointLight
          key={`streetlight-${i}`}
          position={[building.positionX + 3, 4, building.positionZ + 3]}
          color="#F6E05E"
          intensity={2}
          distance={15}
          decay={2}
        />
      ))}
    </>
  );
}
