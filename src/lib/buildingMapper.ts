import { GitHubUserData } from './github';
import { getLanguageColor } from './languageColors';

export interface BuildingData {
  id: string;
  username: string;
  avatarUrl: string;
  name: string | null;
  bio: string | null;
  height: number;
  width: number;
  depth: number;
  color: string;
  windowCount: number;
  positionX: number;
  positionZ: number;
  dominantLanguage: string | null;
  userData: GitHubUserData;
}

// Scaling config
const MIN_HEIGHT = 2;
const MAX_HEIGHT = 40;
const MIN_WIDTH = 2;
const MAX_WIDTH = 8;
const MIN_DEPTH = 2;
const MAX_DEPTH = 6;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
}

export function mapUserToBuilding(user: GitHubUserData, index: number): BuildingData {
  // HEIGHT: based on total commits (more commits = taller)
  const height = clamp(
    mapRange(user.totalCommits, 0, 10000, MIN_HEIGHT, MAX_HEIGHT),
    MIN_HEIGHT,
    MAX_HEIGHT
  );

  // WIDTH: based on repo count (more repos = wider)
  const width = clamp(
    mapRange(user.totalRepos, 0, 500, MIN_WIDTH, MAX_WIDTH),
    MIN_WIDTH,
    MAX_WIDTH
  );

  // DEPTH: based on followers (more followers = deeper)
  const depth = clamp(
    mapRange(user.followers, 0, 100000, MIN_DEPTH, MAX_DEPTH),
    MIN_DEPTH,
    MAX_DEPTH
  );

  // COLOR: dominant language
  const dominantLanguage = user.topLanguages?.[0]?.name || null;
  const color = getLanguageColor(dominantLanguage);

  // WINDOWS: based on stars
  const windowCount = Math.min(Math.floor(user.totalStars / 500) + 4, 40);

  // POSITION: spiral layout
  const { x, z } = getSpiralPosition(index);

  return {
    id: user.username,
    username: user.username,
    avatarUrl: user.avatarUrl,
    name: user.name,
    bio: user.bio,
    height,
    width,
    depth,
    color,
    windowCount,
    positionX: x,
    positionZ: z,
    dominantLanguage,
    userData: user,
  };
}

export function getSpiralPosition(index: number): { x: number; z: number } {
  if (index === 0) return { x: 0, z: 0 };

  const spacing = 14;
  const angle = index * 0.8;
  const radius = spacing * Math.sqrt(index);

  return {
    x: Math.cos(angle) * radius,
    z: Math.sin(angle) * radius,
  };
}
