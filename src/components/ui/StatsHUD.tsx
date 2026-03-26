'use client';

import { useCityStore } from '@/store/cityStore';

export default function StatsHUD() {
  const buildings = useCityStore((s) => s.buildings);
  const timeOfDay = useCityStore((s) => s.timeOfDay);

  const totalStars = buildings.reduce((sum, b) => sum + b.userData.totalStars, 0);
  const totalCommits = buildings.reduce((sum, b) => sum + b.userData.totalCommits, 0);

  const isNight = timeOfDay < 0.25 || timeOfDay > 0.75;

  return (
    <div className="stats-hud">
      <div className="hud-title">
        <span className="hud-dot" style={{ backgroundColor: isNight ? '#818cf8' : '#34d399' }} />
        GIT CITY
      </div>
      <div className="hud-stats">
        <div className="hud-stat">
          <span className="hud-stat-icon">🏢</span>
          <span>{buildings.length}</span>
          <span className="hud-stat-label">Buildings</span>
        </div>
        <div className="hud-stat">
          <span className="hud-stat-icon">⭐</span>
          <span>{formatCompact(totalStars)}</span>
          <span className="hud-stat-label">Stars</span>
        </div>
        <div className="hud-stat">
          <span className="hud-stat-icon">📝</span>
          <span>{formatCompact(totalCommits)}</span>
          <span className="hud-stat-label">Commits</span>
        </div>
      </div>
    </div>
  );
}

function formatCompact(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
