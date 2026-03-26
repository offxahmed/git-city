'use client';

import { useMemo } from 'react';
import { useCityStore } from '@/store/cityStore';

export default function MiniMap() {
  const buildings = useCityStore((s) => s.buildings);
  const selectedBuilding = useCityStore((s) => s.selectedBuilding);
  const flyToBuilding = useCityStore((s) => s.flyToBuilding);
  const selectBuilding = useCityStore((s) => s.selectBuilding);

  const { scale, offsetX, offsetZ } = useMemo(() => {
    if (buildings.length === 0) return { scale: 1, offsetX: 0, offsetZ: 0 };

    const maxAbsX = Math.max(...buildings.map((b) => Math.abs(b.positionX)), 10);
    const maxAbsZ = Math.max(...buildings.map((b) => Math.abs(b.positionZ)), 10);
    const maxAbs = Math.max(maxAbsX, maxAbsZ) + 5;

    return {
      scale: 70 / maxAbs,
      offsetX: 80,
      offsetZ: 80,
    };
  }, [buildings]);

  return (
    <div className="minimap-container">
      <div className="minimap-title">MINI MAP</div>
      <svg viewBox="0 0 160 160" className="minimap-svg">
        {/* Grid */}
        <rect x="0" y="0" width="160" height="160" fill="rgba(15,20,35,0.8)" rx="4" />
        <line x1="80" y1="0" x2="80" y2="160" stroke="rgba(255,255,255,0.05)" />
        <line x1="0" y1="80" x2="160" y2="80" stroke="rgba(255,255,255,0.05)" />

        {/* Buildings */}
        {buildings.map((b) => {
          const x = b.positionX * scale + offsetX;
          const y = b.positionZ * scale + offsetZ;
          const isActive = selectedBuilding?.id === b.id;

          return (
            <g key={b.id}>
              <rect
                x={x - 3}
                y={y - 3}
                width={6}
                height={6}
                fill={b.color}
                opacity={isActive ? 1 : 0.7}
                rx={1}
                className="minimap-building"
                onClick={() => {
                  selectBuilding(b);
                  flyToBuilding(b);
                }}
                style={{ cursor: 'pointer' }}
              />
              {isActive && (
                <circle
                  cx={x}
                  cy={y}
                  r={8}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={1.5}
                  opacity={0.8}
                >
                  <animate
                    attributeName="r"
                    values="8;12;8"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.8;0.3;0.8"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
