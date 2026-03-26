'use client';

import { useCityStore } from '@/store/cityStore';

export default function TimeSlider() {
  const timeOfDay = useCityStore((s) => s.timeOfDay);
  const setTimeOfDay = useCityStore((s) => s.setTimeOfDay);

  const getTimeLabel = (t: number) => {
    const hours = Math.floor(t * 24);
    const mins = Math.floor((t * 24 - hours) * 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  const getTimeIcon = (t: number) => {
    if (t < 0.25 || t > 0.75) return '🌙';
    if (t < 0.3 || t > 0.7) return '🌅';
    return '☀️';
  };

  return (
    <div className="time-slider-container">
      <div className="time-slider-label">
        <span>{getTimeIcon(timeOfDay)}</span>
        <span>{getTimeLabel(timeOfDay)}</span>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={timeOfDay}
        onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
        className="time-slider"
        id="time-slider"
      />
      <div className="time-slider-labels">
        <span>🌙</span>
        <span>🌅</span>
        <span>☀️</span>
        <span>🌅</span>
        <span>🌙</span>
      </div>
    </div>
  );
}
