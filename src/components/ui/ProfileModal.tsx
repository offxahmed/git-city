'use client';

import { useCityStore } from '@/store/cityStore';
import { useEffect, useRef } from 'react';

export default function ProfileModal() {
  const selectedBuilding = useCityStore((s) => s.selectedBuilding);
  const selectBuilding = useCityStore((s) => s.selectBuilding);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') selectBuilding(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectBuilding]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        selectBuilding(null);
      }
    };
    if (selectedBuilding) {
      setTimeout(() => window.addEventListener('click', handleClick), 100);
    }
    return () => window.removeEventListener('click', handleClick);
  }, [selectedBuilding, selectBuilding]);

  if (!selectedBuilding) return null;

  const user = selectedBuilding.userData;
  const maxContribution = Math.max(...user.contributionCalendar.map((d) => d.count), 1);

  return (
    <div className="modal-overlay">
      <div ref={modalRef} className="profile-modal">
        {/* Close button */}
        <button
          className="modal-close"
          onClick={() => selectBuilding(null)}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div className="profile-header">
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="profile-avatar"
          />
          <div className="profile-info">
            <h2 className="profile-name">{user.name || user.username}</h2>
            <a
              href={`https://github.com/${user.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="profile-username"
            >
              @{user.username} ↗
            </a>
            {user.bio && <p className="profile-bio">{user.bio}</p>}
            <div className="profile-meta">
              {user.company && <span>🏢 {user.company}</span>}
              {user.location && <span>📍 {user.location}</span>}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{formatNumber(user.totalCommits)}</div>
            <div className="stat-label">Commits</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatNumber(user.totalStars)}</div>
            <div className="stat-label">Stars</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatNumber(user.totalRepos)}</div>
            <div className="stat-label">Repos</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatNumber(user.followers)}</div>
            <div className="stat-label">Followers</div>
          </div>
        </div>

        {/* Contribution calendar (mini) */}
        <div className="contribution-section">
          <h3>Contributions</h3>
          <div className="contribution-grid">
            {user.contributionCalendar.slice(-91).map((day, i) => (
              <div
                key={i}
                className="contribution-cell"
                style={{
                  backgroundColor: day.count === 0
                    ? 'rgba(255,255,255,0.05)'
                    : `rgba(56, 189, 108, ${0.2 + (day.count / maxContribution) * 0.8})`,
                }}
                title={`${day.date}: ${day.count} contributions`}
              />
            ))}
          </div>
        </div>

        {/* Top Languages */}
        <div className="languages-section">
          <h3>Top Languages</h3>
          <div className="language-bars">
            {user.topLanguages.map((lang) => (
              <div key={lang.name} className="language-bar-item">
                <div className="language-bar-header">
                  <span
                    className="language-dot"
                    style={{ backgroundColor: lang.color }}
                  />
                  <span>{lang.name}</span>
                  <span className="language-count">{lang.count} repos</span>
                </div>
                <div className="language-bar-track">
                  <div
                    className="language-bar-fill"
                    style={{
                      width: `${(lang.count / user.topLanguages[0].count) * 100}%`,
                      backgroundColor: lang.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Repos */}
        <div className="repos-section">
          <h3>Top Repositories</h3>
          <div className="repo-list">
            {user.topRepos.map((repo) => (
              <a
                key={repo.name}
                href={`https://github.com/${user.username}/${repo.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="repo-card"
              >
                <div className="repo-name">
                  📦 {repo.name}
                  <span className="repo-stars">⭐ {formatNumber(repo.stars)}</span>
                </div>
                {repo.description && (
                  <p className="repo-desc">{repo.description}</p>
                )}
                {repo.language && (
                  <span className="repo-lang">{repo.language}</span>
                )}
              </a>
            ))}
          </div>
        </div>

        {/* Building info */}
        <div className="building-info-section">
          <h3>Building Stats</h3>
          <div className="building-stats">
            <span>🏗️ Height: {selectedBuilding.height.toFixed(1)} stories</span>
            <span>📐 Width: {selectedBuilding.width.toFixed(1)}</span>
            <span>📏 Depth: {selectedBuilding.depth.toFixed(1)}</span>
            <span>🪟 Windows: {selectedBuilding.windowCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
