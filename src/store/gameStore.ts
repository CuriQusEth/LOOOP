import { create } from 'zustand';

export type GameScreen = 'title' | 'game' | 'upgrades' | 'leaderboard';

export interface Upgrades {
  doubleJump: boolean;
  timeSlow: boolean;
  dash: boolean;
}

interface GameState {
  currentScreen: GameScreen;
  setScreen: (screen: GameScreen) => void;
  
  // Stats
  highestDistance: number;
  highestLoops: number;
  essence: number;
  
  // Current Run
  distance: number;
  loops: number;
  
  // Upgrades
  upgrades: Upgrades;
  
  // Actions
  updateCurrentRun: (dist: number, lps: number) => void;
  commitRun: (earnedEssence: number) => void;
  purchaseUpgrade: (key: keyof Upgrades, cost: number) => boolean;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentScreen: 'title',
  setScreen: (screen) => set({ currentScreen: screen }),
  
  highestDistance: 0,
  highestLoops: 0,
  essence: 50, // Start with a little just to tease the player
  
  distance: 0,
  loops: 0,
  
  upgrades: {
    doubleJump: false,
    timeSlow: false,
    dash: false,
  },
  
  updateCurrentRun: (dist, lps) => set({ distance: dist, loops: lps }),
  
  commitRun: (earnedEssence) => set((state) => {
    const newHighestLps = Math.max(state.highestLoops, state.loops);
    const newHighestDist = Math.max(state.highestDistance, state.distance);
    return {
      highestDistance: newHighestDist,
      highestLoops: newHighestLps,
      essence: state.essence + earnedEssence,
    };
  }),
  
  purchaseUpgrade: (key, cost) => {
    const state = get();
    if (state.essence >= cost && !state.upgrades[key]) {
      set({
        essence: state.essence - cost,
        upgrades: { ...state.upgrades, [key]: true }
      });
      return true;
    }
    return false;
  }
}));
