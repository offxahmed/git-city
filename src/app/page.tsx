'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Animated background */}
      <div className="landing-bg">
        <div className="city-skyline">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="skyline-building"
              style={{
                '--height': `${20 + Math.random() * 60}%`,
                '--delay': `${Math.random() * 2}s`,
                '--color': [
                  '#6366f1', '#3178c6', '#f1e05a', '#3572A5',
                  '#00ADD8', '#dea584', '#F05138', '#41b883',
                  '#e34c26', '#b07219', '#701516', '#4F5D95',
                ][i % 12],
                '--left': `${(i / 30) * 100}%`,
                '--width': `${2 + Math.random() * 2}%`,
              } as React.CSSProperties}
            />
          ))}
        </div>
        <div className="stars-bg">
          {Array.from({ length: 80 }).map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                '--x': `${Math.random() * 100}%`,
                '--y': `${Math.random() * 60}%`,
                '--size': `${1 + Math.random() * 2}px`,
                '--delay': `${Math.random() * 3}s`,
                '--duration': `${2 + Math.random() * 3}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav className="landing-nav">
        <div className="nav-logo">
          <span className="logo-icon">🏙️</span>
          <span className="logo-text">GIT CITY</span>
        </div>
        <div className="nav-links">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-badge">
          <span>✨</span> Your GitHub profile, reimagined in 3D
        </div>

        <h1 className="hero-title">
          <span className="hero-gradient">Git City</span>
          <br />
          <span className="hero-subtitle">Where Code Meets Skyline</span>
        </h1>

        <p className="hero-description">
          Every GitHub developer is a building in a vibrant 3D city.
          <br />
          Your contributions shape the skyline — commits become stories,
          <br />
          stars light up windows, and languages paint the walls.
        </p>

        <div className="hero-cta">
          <Link href="/city" className="cta-button primary">
            <span>🚀</span> Enter the City
          </Link>
          <a href="#features" className="cta-button secondary">
            Learn More ↓
          </a>
        </div>

        {/* Floating stats */}
        <div className="hero-floating-stats">
          <div className="floating-stat">
            <div className="floating-stat-value">∞</div>
            <div className="floating-stat-label">Buildings</div>
          </div>
          <div className="floating-stat">
            <div className="floating-stat-value">3D</div>
            <div className="floating-stat-label">Interactive</div>
          </div>
          <div className="floating-stat">
            <div className="floating-stat-value">24/7</div>
            <div className="floating-stat-label">Day/Night</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features-section">
        <h2 className="features-title">How It Works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Data-Driven Architecture</h3>
            <p>
              Building height = commits, width = repos, depth = followers.
              Each building is a unique reflection of a developer&apos;s journey.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Language Colors</h3>
            <p>
              Buildings are painted in GitHub Linguist colors. JavaScript buildings
              glow yellow, Rust shines copper, Python stands in blue.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌃</div>
            <h3>Day/Night Cycle</h3>
            <p>
              Watch the city transform. At night, windows light up based on star
              count — the most starred repos shine brightest.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Search &amp; Explore</h3>
            <p>
              Search any GitHub username. The camera flies to their building.
              Click to see full profile, repos, and contribution graph.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h3>City Navigation</h3>
            <p>
              Orbit, zoom, and pan around the city. Use the mini-map for a bird&apos;s
              eye view. Every building is clickable and explorable.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Real GitHub Data</h3>
            <p>
              Powered by GitHub&apos;s GraphQL API. Real contributions, real stats,
              real developer profiles — all rendered in 3D.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="tech-section">
        <h2 className="tech-title">Built With</h2>
        <div className="tech-badges">
          {[
            'Next.js 14', 'React Three Fiber', 'Three.js', 'TypeScript',
            'Tailwind CSS', 'Zustand', 'GitHub GraphQL API', 'Drei',
          ].map((tech) => (
            <span key={tech} className="tech-badge">{tech}</span>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="footer-cta">
        <h2>Ready to explore?</h2>
        <Link href="/city" className="cta-button primary large">
          <span>🏙️</span> Enter Git City
        </Link>
      </section>

      <footer className="landing-footer">
        <p>
          Git City — Every developer deserves a skyline.
        </p>
      </footer>
    </div>
  );
}
