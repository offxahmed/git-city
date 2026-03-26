'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import SearchBar from '@/components/ui/SearchBar';
import ProfileModal from '@/components/ui/ProfileModal';
import TimeSlider from '@/components/ui/TimeSlider';
import StatsHUD from '@/components/ui/StatsHUD';
import MiniMap from '@/components/ui/MiniMap';
import { useCityStore } from '@/store/cityStore';

const CityScene = dynamic(() => import('@/components/city/CityScene'), {
  ssr: false,
  loading: () => (
    <div className="city-loading-screen">
      <div className="loading-content">
        <div className="loading-buildings">
          <div className="loading-building b1" />
          <div className="loading-building b2" />
          <div className="loading-building b3" />
          <div className="loading-building b4" />
          <div className="loading-building b5" />
        </div>
        <h2>Building the City...</h2>
        <p>Generating skyline from GitHub data</p>
      </div>
    </div>
  ),
});

export default function CityPage() {
  const loadDemoCity = useCityStore((s) => s.loadDemoCity);
  const buildings = useCityStore((s) => s.buildings);

  useEffect(() => {
    if (buildings.length === 0) {
      loadDemoCity();
    }
  }, [loadDemoCity, buildings.length]);

  return (
    <div className="city-page">
      <CityScene />

      {/* UI Overlays */}
      <SearchBar />
      <ProfileModal />
      <StatsHUD />
      <MiniMap />

      {/* Time control */}
      <TimeSlider />

      {/* Help hint */}
      <div className="controls-hint">
        <span>🖱️ Drag to orbit</span>
        <span>📜 Scroll to zoom</span>
        <span>🖱️ Right-drag to pan</span>
        <span>🏢 Click building for info</span>
      </div>
    </div>
  );
}
