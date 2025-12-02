import { SeededRandom } from '../utils/random';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  OBSTACLE_WIDTH,
  OBSTACLE_SPACING,
  OBSTACLE_GAP,
  MIN_OBSTACLE_HEIGHT,
  MAX_OBSTACLE_HEIGHT,
} from './constants';
import type { Obstacle } from '../types';

export class TerrainGenerator {
  private rng: SeededRandom;
  private nextObstacleX: number;

  constructor(seed: number) {
    this.rng = new SeededRandom(seed);
    this.nextObstacleX = CANVAS_WIDTH + 200;
  }

  generateInitialObstacles(): Obstacle[] {
    const obstacles: Obstacle[] = [];
    const count = Math.ceil((CANVAS_WIDTH * 2) / OBSTACLE_SPACING);

    for (let i = 0; i < count; i++) {
      obstacles.push(this.generateObstacle(CANVAS_WIDTH + i * OBSTACLE_SPACING));
    }

    return obstacles;
  }

  generateObstacle(x: number): Obstacle {
    const topHeight = this.rng.range(MIN_OBSTACLE_HEIGHT, MAX_OBSTACLE_HEIGHT);
    const bottomHeight = this.rng.range(MIN_OBSTACLE_HEIGHT, MAX_OBSTACLE_HEIGHT);

    // Ensure there's always a gap for the player
    const totalHeight = topHeight + bottomHeight;
    const maxTotal = CANVAS_HEIGHT - OBSTACLE_GAP - 20;

    if (totalHeight > maxTotal) {
      const ratio = maxTotal / totalHeight;
      return {
        x,
        topHeight: topHeight * ratio,
        bottomHeight: bottomHeight * ratio,
        width: OBSTACLE_WIDTH,
      };
    }

    return {
      x,
      topHeight,
      bottomHeight,
      width: OBSTACLE_WIDTH,
    };
  }

  maybeGenerateObstacle(obstacles: Obstacle[]): Obstacle | null {
    const lastObstacle = obstacles[obstacles.length - 1];

    if (!lastObstacle || lastObstacle.x < this.nextObstacleX - OBSTACLE_SPACING) {
      const newObstacle = this.generateObstacle(this.nextObstacleX);
      this.nextObstacleX += OBSTACLE_SPACING;
      return newObstacle;
    }

    return null;
  }
}
