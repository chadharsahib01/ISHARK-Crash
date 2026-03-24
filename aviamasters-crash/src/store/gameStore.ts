import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export type GameState = 'IDLE' | 'FLYING' | 'CRASHED';

interface GameStore {
  multiplier: number;
  altitude: number;
  distance: number;
  gameState: GameState;
  balance: number;
  bet: number;
  crashPoint: number;
  startTime: number;
  
  // Actions
  setGameState: (state: GameState) => void;
  setMultiplier: (val: number) => void;
  setAltitude: (val: number) => void;
  setDistance: (val: number) => void;
  setBalance: (val: number | ((prev: number) => number)) => void;
  setBet: (val: number) => void;
  setCrashPoint: (val: number) => void;
  setStartTime: (val: number) => void;
  
  startFlight: () => void;
  cashOut: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    multiplier: 1.0,
    altitude: 0,
    distance: 0,
    gameState: 'IDLE',
    balance: 1000.0,
    bet: 10.0,
    crashPoint: 0,
    startTime: 0,

    setGameState: (gameState) => set({ gameState }),
    setMultiplier: (multiplier) => set({ multiplier }),
    setAltitude: (altitude) => set({ altitude }),
    setDistance: (distance) => set({ distance }),
    setBalance: (val) => set((state) => ({ 
      balance: typeof val === 'function' ? val(state.balance) : val 
    })),
    setBet: (bet) => set({ bet }),
    setCrashPoint: (crashPoint) => set({ crashPoint }),
    setStartTime: (startTime) => set({ startTime }),

    startFlight: () => {
      const { balance, bet } = get();
      if (balance < bet) return;

      // Generate random crash point (exponential distribution for house edge)
      const random = Math.random();
      const crashAt = Math.max(1.01, 0.99 / (1 - random));

      set({
        gameState: 'FLYING',
        multiplier: 1.0,
        altitude: 0,
        distance: 0,
        balance: balance - bet,
        crashPoint: crashAt,
        startTime: Date.now(),
      });
    },

    cashOut: () => {
      const { gameState, bet, multiplier, balance } = get();
      if (gameState !== 'FLYING') return;

      const winAmount = bet * multiplier;
      set({
        balance: balance + winAmount,
        gameState: 'IDLE',
      });
    },

    resetGame: () => {
      set({
        gameState: 'IDLE',
        multiplier: 1.0,
        altitude: 0,
        distance: 0,
      });
    },
  }))
);
