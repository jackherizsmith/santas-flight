export interface Position {
  x: number;
  y: number;
}

export interface Obstacle {
  x: number;
  topHeight: number;
  bottomHeight: number;
  width: number;
}

export interface Snowflake {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

export type PowerUpType = 'carrot' | 'lightning';

export interface PowerUp {
  x: number;
  y: number;
  type: PowerUpType;
  collected: boolean;
}

export interface GameState {
  sleigh: {
    y: number;
    velocity: number;
  };
  obstacles: Obstacle[];
  snowflakes: Snowflake[];
  powerUps: PowerUp[];
  distance: number;
  carrotsCollected: number;
  gameOver: boolean;
  gameStarted: boolean;
  currentSpeed: number;
  speedBoost: number;
}

export type GameStatus = 'idle' | 'playing' | 'gameOver';
