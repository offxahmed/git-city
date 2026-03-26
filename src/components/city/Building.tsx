'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BuildingData } from '@/lib/buildingMapper';
import { useCityStore } from '@/store/cityStore';

interface BuildingProps {
  data: BuildingData;
}

export default function Building({ data }: BuildingProps) {
  const meshRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const selectedBuilding = useCityStore((s) => s.selectedBuilding);
  const selectBuilding = useCityStore((s) => s.selectBuilding);
  const flyToBuilding = useCityStore((s) => s.flyToBuilding);
  const timeOfDay = useCityStore((s) => s.timeOfDay);

  const isSelected = selectedBuilding?.id === data.id;
  const isNight = timeOfDay < 0.25 || timeOfDay > 0.75;

  // Create window texture
  const windowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Building face
    ctx.fillStyle = data.color;
    ctx.fillRect(0, 0, 128, 256);

    // Dark lines for floor separation
    const floorHeight = 256 / Math.max(data.windowCount / 2, 4);
    for (let i = 0; i < 256; i += floorHeight) {
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(0, i, 128, 2);
    }

    // Windows
    const cols = 4;
    const windowW = 16;
    const windowH = floorHeight * 0.5;
    const marginX = (128 - cols * windowW) / (cols + 1);

    for (let row = 0; row < Math.max(data.windowCount / 2, 4); row++) {
      for (let col = 0; col < cols; col++) {
        const x = marginX + col * (windowW + marginX);
        const y = row * floorHeight + floorHeight * 0.2;

        // Random chance window is lit (based on stars, more at night)
        const isLit = isNight && Math.random() < 0.7;

        if (isLit) {
          ctx.fillStyle = '#F6E05E';
          ctx.shadowColor = '#F6E05E';
          ctx.shadowBlur = 4;
        } else {
          ctx.fillStyle = 'rgba(120,160,200,0.3)';
          ctx.shadowBlur = 0;
        }
        ctx.fillRect(x, y, windowW, windowH);
        ctx.shadowBlur = 0;
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, [data.color, data.windowCount, isNight]);

  // Hover animation
  useFrame((_, delta) => {
    if (!meshRef.current) return;

    if (isSelected) {
      meshRef.current.position.y = data.height / 2 + Math.sin(Date.now() * 0.002) * 0.15;
    } else {
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        data.height / 2,
        delta * 5
      );
    }

    // Glow pulse
    if (glowRef.current && isSelected) {
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.02;
      glowRef.current.scale.setScalar(scale);
    }
  });

  const handleClick = (e: THREE.Event) => {
    (e as unknown as { stopPropagation: () => void }).stopPropagation();
    selectBuilding(data);
    flyToBuilding(data);
  };

  return (
    <group position={[data.positionX, 0, data.positionZ]}>
      <group ref={meshRef} position={[0, data.height / 2, 0]}>
        {/* Main building body */}
        <mesh
          onClick={handleClick}
          onPointerOver={() => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'default';
          }}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[data.width, data.height, data.depth]} />
          <meshStandardMaterial
            map={windowTexture}
            roughness={0.6}
            metalness={0.1}
            emissive={isNight ? data.color : '#000000'}
            emissiveIntensity={isNight ? 0.1 : 0}
          />
        </mesh>

        {/* Selection glow */}
        {isSelected && (
          <mesh ref={glowRef}>
            <boxGeometry args={[data.width + 0.3, data.height + 0.3, data.depth + 0.3]} />
            <meshBasicMaterial
              color={data.color}
              transparent
              opacity={0.15}
              side={THREE.BackSide}
            />
          </mesh>
        )}

        {/* Roof */}
        <mesh position={[0, data.height / 2 + 0.15, 0]} castShadow>
          <boxGeometry args={[data.width + 0.3, 0.3, data.depth + 0.3]} />
          <meshStandardMaterial
            color={new THREE.Color(data.color).multiplyScalar(0.7)}
            roughness={0.4}
          />
        </mesh>

        {/* Rooftop antenna for high-star users */}
        {data.userData.totalStars > 10000 && (
          <mesh position={[0, data.height / 2 + 1.5, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 2.5, 6]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
          </mesh>
        )}

        {/* Name label */}
        <sprite position={[0, data.height / 2 + 2.5, 0]} scale={[4, 1, 1]}>
          <spriteMaterial
            transparent
            opacity={0.9}
            depthTest={false}
          >
            {/* Label handled via HTML overlay for better text rendering */}
          </spriteMaterial>
        </sprite>
      </group>

      {/* Foundation / base */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[data.width + 1, 0.2, data.depth + 1]} />
        <meshStandardMaterial color="#374151" roughness={0.9} />
      </mesh>
    </group>
  );
}
