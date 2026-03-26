import { create } from 'zustand';
import { BuildingData, mapUserToBuilding } from '@/lib/buildingMapper';
import { fetchGitHubUser, GitHubUserData } from '@/lib/github';
import { getExpandedDemoUsers } from '@/lib/demoData';

interface CityState {
  buildings: BuildingData[];
  selectedBuilding: BuildingData | null;
  flyTarget: { x: number; y: number; z: number } | null;
  searchQuery: string;
  isLoading: boolean;
  timeOfDay: number; // 0-1 (0=midnight, 0.25=sunrise, 0.5=noon, 0.75=sunset)
  error: string | null;
  showLanding: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  selectBuilding: (building: BuildingData | null) => void;
  setTimeOfDay: (time: number) => void;
  setShowLanding: (show: boolean) => void;
  searchUser: (username: string) => Promise<void>;
  loadDemoCity: () => void;
  flyToBuilding: (building: BuildingData) => void;
  clearFlyTarget: () => void;
}

export const useCityStore = create<CityState>((set, get) => ({
  buildings: [],
  selectedBuilding: null,
  flyTarget: null,
  searchQuery: '',
  isLoading: false,
  timeOfDay: 0.35,
  error: null,
  showLanding: true,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setShowLanding: (show) => set({ showLanding: show }),

  selectBuilding: (building) => set({ selectedBuilding: building }),

  setTimeOfDay: (time) => set({ timeOfDay: time }),

  clearFlyTarget: () => set({ flyTarget: null }),

  flyToBuilding: (building) => {
    set({
      flyTarget: {
        x: building.positionX,
        y: building.height / 2 + 5,
        z: building.positionZ + building.depth + 10,
      },
    });
  },

  searchUser: async (username: string) => {
    const state = get();
    // Check if already in city
    const existing = state.buildings.find(
      (b) => b.username.toLowerCase() === username.toLowerCase()
    );
    if (existing) {
      set({ selectedBuilding: existing, error: null });
      get().flyToBuilding(existing);
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const userData = await fetchGitHubUser(username);

      if (!userData) {
        set({ isLoading: false, error: `Could not find user "${username}". Check the username and try again.` });
        return;
      }

      const building = mapUserToBuilding(userData, state.buildings.length);
      set({
        buildings: [...state.buildings, building],
        selectedBuilding: building,
        isLoading: false,
      });
      get().flyToBuilding(building);
    } catch {
      set({ isLoading: false, error: 'Failed to fetch user data' });
    }
  },

  loadDemoCity: () => {
    const demoUsers = getExpandedDemoUsers();
    const buildings = demoUsers.map((user: GitHubUserData, i: number) =>
      mapUserToBuilding(user, i)
    );
    set({ buildings, showLanding: false });
  },
}));
