import type { GameState, Snowflake, PowerUpType } from '../types';
import { TerrainGenerator } from './terrain';
import { SeededRandom } from '../utils/random';
import {
  GRAVITY,
  JUMP_FORCE,
  TERMINAL_VELOCITY,
  INITIAL_SPEED,
  SPEED_INCREASE_RATE,
  DISTANCE_PER_FRAME,
  SLEIGH_WIDTH,
  SLEIGH_HEIGHT,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  SNOWFLAKE_COUNT,
  SNOWFLAKE_MIN_SIZE,
  SNOWFLAKE_MAX_SIZE,
  SNOWFLAKE_MIN_SPEED,
  SNOWFLAKE_MAX_SPEED,
  POWERUP_SPAWN_CHANCE,
  POWERUP_SIZE,
  SPEED_BOOST_DURATION,
} from './constants';

export class GameEngine {
  private terrainGenerator: TerrainGenerator;
  private snowflakeRng: SeededRandom;
  private powerUpRng: SeededRandom;
  private speedBoostTimer: number = 0;

  constructor(seed: number) {
    this.terrainGenerator = new TerrainGenerator(seed);
    this.snowflakeRng = new SeededRandom(seed + 1);
    this.powerUpRng = new SeededRandom(seed + 2);
  }

  createInitialState(): GameState {
    return {
      sleigh: {
        y: CANVAS_HEIGHT / 2,
        velocity: 0,
      },
      obstacles: this.terrainGenerator.generateInitialObstacles(),
      snowflakes: this.generateSnowflakes(),
      powerUps: [],
      distance: 0,
      carrotsCollected: 0,
      gameOver: false,
      gameStarted: false,
      currentSpeed: INITIAL_SPEED,
      speedBoost: 0,
    };
  }

  private generateSnowflakes(): Snowflake[] {
    const snowflakes: Snowflake[] = [];
    for (let i = 0; i < SNOWFLAKE_COUNT; i++) {
      snowflakes.push({
        x: this.snowflakeRng.range(0, CANVAS_WIDTH),
        y: this.snowflakeRng.range(0, CANVAS_HEIGHT),
        size: this.snowflakeRng.range(SNOWFLAKE_MIN_SIZE, SNOWFLAKE_MAX_SIZE),
        speed: this.snowflakeRng.range(SNOWFLAKE_MIN_SPEED, SNOWFLAKE_MAX_SPEED),
        opacity: this.snowflakeRng.range(0.3, 1),
      });
    }
    return snowflakes;
  }

  jump(state: GameState): void {
    if (!state.gameOver) {
      state.sleigh.velocity = JUMP_FORCE;
      if (!state.gameStarted) {
        state.gameStarted = true;
      }
    }
  }

  update(state: GameState): void {
    if (state.gameOver || !state.gameStarted) return;

    // Gradually increase speed over time - no max!
    state.currentSpeed += SPEED_INCREASE_RATE;

    // Handle speed boost timer
    if (this.speedBoostTimer > 0) {
      this.speedBoostTimer--;
      if (this.speedBoostTimer === 0) {
        state.speedBoost = 0;
      }
    }

    const effectiveSpeed = state.currentSpeed + state.speedBoost;

    // Update sleigh physics with drag for smoother motion
    state.sleigh.velocity += GRAVITY;
    state.sleigh.velocity *= 0.98; // Apply drag
    state.sleigh.velocity = Math.max(
      -TERMINAL_VELOCITY,
      Math.min(TERMINAL_VELOCITY, state.sleigh.velocity)
    );
    state.sleigh.y += state.sleigh.velocity;

    // Update obstacles
    for (const obstacle of state.obstacles) {
      obstacle.x -= effectiveSpeed;
    }

    // Remove off-screen obstacles
    state.obstacles = state.obstacles.filter((obs) => obs.x > -obs.width);

    // Generate new obstacles
    const newObstacle = this.terrainGenerator.maybeGenerateObstacle(state.obstacles);
    if (newObstacle) {
      state.obstacles.push(newObstacle);
    }

    // Update snowflakes
    for (const snowflake of state.snowflakes) {
      snowflake.x -= effectiveSpeed * 0.3;
      snowflake.y += snowflake.speed;

      // Wrap around
      if (snowflake.x < -10) {
        snowflake.x = CANVAS_WIDTH + 10;
      }
      if (snowflake.y > CANVAS_HEIGHT + 10) {
        snowflake.y = -10;
      }
    }

    // Spawn power-ups
    if (this.powerUpRng.next() < POWERUP_SPAWN_CHANCE) {
      this.spawnPowerUp(state);
    }

    // Update power-ups
    for (const powerUp of state.powerUps) {
      powerUp.x -= effectiveSpeed;
    }

    // Remove off-screen power-ups
    state.powerUps = state.powerUps.filter((p) => p.x > -POWERUP_SIZE && !p.collected);

    // Check power-up collisions
    this.checkPowerUpCollisions(state);

    // Update distance
    state.distance += DISTANCE_PER_FRAME;

    // Check collisions
    if (this.checkCollision(state)) {
      state.gameOver = true;
    }
  }

  private spawnPowerUp(state: GameState): void {
    const types: PowerUpType[] = ['carrot', 'lightning'];
    const type = types[this.powerUpRng.int(0, types.length)];

    // Spawn in the safe middle zone
    const safeZoneTop = 150;
    const safeZoneBottom = CANVAS_HEIGHT - 150;
    const y = this.powerUpRng.range(safeZoneTop, safeZoneBottom);

    state.powerUps.push({
      x: CANVAS_WIDTH + 50,
      y,
      type,
      collected: false,
    });
  }

  private checkPowerUpCollisions(state: GameState): void {
    const sleighX = 80;
    const sleighY = state.sleigh.y;
    const sleighCenterX = sleighX + SLEIGH_WIDTH / 2;
    const sleighCenterY = sleighY + SLEIGH_HEIGHT / 2;

    for (const powerUp of state.powerUps) {
      if (powerUp.collected) continue;

      const distance = Math.sqrt(
        Math.pow(sleighCenterX - (powerUp.x + POWERUP_SIZE / 2), 2) +
        Math.pow(sleighCenterY - (powerUp.y + POWERUP_SIZE / 2), 2)
      );

      if (distance < POWERUP_SIZE) {
        powerUp.collected = true;
        this.applyPowerUpEffect(state, powerUp.type);
      }
    }
  }

  private applyPowerUpEffect(state: GameState, type: PowerUpType): void {
    switch (type) {
      case 'carrot':
        // Count the carrot (good!)
        state.carrotsCollected++;
        break;
      case 'lightning':
        // Lightning spooks the reindeer - they fly faster!
        state.speedBoost = 2.5;
        this.speedBoostTimer = SPEED_BOOST_DURATION;
        break;
    }
  }

  private checkCollision(state: GameState): boolean {
    const sleighX = 80;
    const sleighY = state.sleigh.y;

    // Check bounds
    if (sleighY < 0 || sleighY + SLEIGH_HEIGHT > CANVAS_HEIGHT) {
      return true;
    }

    // Check obstacle collisions
    for (const obstacle of state.obstacles) {
      if (
        sleighX + SLEIGH_WIDTH > obstacle.x &&
        sleighX < obstacle.x + obstacle.width
      ) {
        // Check if hit top or bottom
        if (
          sleighY < obstacle.topHeight ||
          sleighY + SLEIGH_HEIGHT > CANVAS_HEIGHT - obstacle.bottomHeight
        ) {
          return true;
        }
      }
    }

    return false;
  }
}
