export type GameState = 'IDLE' | 'FLYING' | 'CRASHED';

export interface GameStore {
  multiplier: number;
  altitude: number;
  distance: number;
  gameState: GameState;
  bet: number;
  balance: number;
  lastCrash: number;
}
