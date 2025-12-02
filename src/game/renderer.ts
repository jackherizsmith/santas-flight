import type { GameState } from '../types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  SKY_COLOUR,
  ROOF_COLOUR,
  ROOF_DARK,
  CHIMNEY_COLOUR,
  SLEIGH_COLOUR,
  SLEIGH_DARK,
  REINDEER_COLOUR,
  SNOW_COLOUR,
} from './constants';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;
  }

  render(state: GameState): void {
    // Clear canvas
    this.ctx.fillStyle = SKY_COLOUR;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw snowflakes (only visible ones)
    this.ctx.fillStyle = SNOW_COLOUR;
    for (const snowflake of state.snowflakes) {
      if (snowflake.x >= -10 && snowflake.x <= CANVAS_WIDTH + 10) {
        this.ctx.globalAlpha = snowflake.opacity;
        this.ctx.beginPath();
        this.ctx.arc(snowflake.x, snowflake.y, snowflake.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
    this.ctx.globalAlpha = 1;

    // Draw obstacles (continuous terrain) - only visible ones
    for (const obstacle of state.obstacles) {
      // Only draw if obstacle is visible on screen
      if (obstacle.x + obstacle.width >= -50 && obstacle.x <= CANVAS_WIDTH + 50) {
        // Top cloud layer
        this.drawCloudLayer(obstacle.x, 0, obstacle.width, obstacle.topHeight);

        // Bottom roof layer
        this.drawRoofLayer(
          obstacle.x,
          CANVAS_HEIGHT - obstacle.bottomHeight,
          obstacle.width,
          obstacle.bottomHeight
        );
      }
    }

    // Draw power-ups (only visible ones)
    for (const powerUp of state.powerUps) {
      if (!powerUp.collected && powerUp.x >= -50 && powerUp.x <= CANVAS_WIDTH + 50) {
        this.drawPowerUp(powerUp.x, powerUp.y, powerUp.type);
      }
    }

    // Draw sleigh with reindeer
    this.drawSleighWithReindeer(80, state.sleigh.y);

    // Draw distance
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 4;
    this.ctx.fillText(`${Math.floor(state.distance)}m`, CANVAS_WIDTH / 2, 40);
    this.ctx.shadowBlur = 0;

    // Draw carrot counter
    this.ctx.textAlign = 'left';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 4;
    this.ctx.fillText(`🥕 ${state.carrotsCollected}`, 20, 40);
    this.ctx.shadowBlur = 0;

    // Draw speed indicator
    this.ctx.textAlign = 'right';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 4;
    const effectiveSpeed = state.currentSpeed + state.speedBoost;
    const speedDisplay = effectiveSpeed.toFixed(1);
    this.ctx.fillStyle = state.speedBoost > 0 ? '#ffff00' : '#ffffff';
    this.ctx.fillText(`⚡ ${speedDisplay}x`, CANVAS_WIDTH - 20, 40);
    this.ctx.shadowBlur = 0;

    // Draw game over text
    if (state.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      this.ctx.shadowBlur = 8;
      this.ctx.fillText('Game Over!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);

      this.ctx.font = 'bold 32px Arial';
      this.ctx.fillText(
        `Distance: ${Math.floor(state.distance)}m`,
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2
      );
      this.ctx.shadowBlur = 0;
    }

    // Draw start instruction
    if (!state.gameStarted && !state.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      this.ctx.fillRect(0, CANVAS_HEIGHT / 2 - 120, CANVAS_WIDTH, 240);

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 36px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      this.ctx.shadowBlur = 6;
      this.ctx.fillText('🎅 Santa\'s Flight', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 70);

      this.ctx.font = '20px Arial';
      this.ctx.fillText('Navigate between clouds and rooftops', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
      this.ctx.fillText('Feed reindeer carrots 🥕 (good!)', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 5);
      this.ctx.fillText('Avoid lightning ⚡ (spooks them!)', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);

      this.ctx.font = 'bold 24px Arial';
      this.ctx.fillText('Tap anywhere to fly up', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 65);

      this.ctx.font = '18px Arial';
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      this.ctx.fillText('Tap to start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 95);
      this.ctx.shadowBlur = 0;
    }
  }

  private drawCloudLayer(x: number, y: number, width: number, height: number): void {
    const ctx = this.ctx;

    // Draw multiple layers of fluffy cloud circles to fill the entire height
    const numCircles = Math.ceil(width / 18);
    const numLayers = Math.ceil(height / 30);

    // Draw from top to bottom in layers
    for (let layer = 0; layer < numLayers; layer++) {
      const layerY = y + layer * 30;
      const layerOpacity = 0.9 - (layer * 0.05); // Slightly more transparent as we go down

      for (let i = 0; i <= numCircles; i++) {
        const circleX = x + (i * width) / numCircles + (Math.sin(i * 2 + layer) * 5);
        const circleY = layerY + (Math.sin(i * 1.5 + layer) * 8);
        const radius = 22 + (Math.sin(i + layer) * 7);

        // Create radial gradient for soft fade effect
        const gradient = ctx.createRadialGradient(
          circleX, circleY, 0,
          circleX, circleY, radius
        );
        gradient.addColorStop(0, `rgba(212, 228, 247, ${layerOpacity})`);
        gradient.addColorStop(0.5, `rgba(212, 228, 247, ${layerOpacity * 0.7})`);
        gradient.addColorStop(1, 'rgba(212, 228, 247, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(circleX, circleY, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Add offset circles for better coverage
      for (let i = 0; i <= numCircles - 1; i++) {
        const circleX = x + ((i + 0.5) * width) / numCircles + (Math.sin(i * 2.5 + layer) * 4);
        const circleY = layerY + 15 + (Math.sin(i * 1.8 + layer) * 6);
        const radius = 18 + (Math.sin(i * 1.2 + layer) * 6);

        const gradient = ctx.createRadialGradient(
          circleX, circleY, 0,
          circleX, circleY, radius
        );
        gradient.addColorStop(0, `rgba(212, 228, 247, ${layerOpacity * 0.85})`);
        gradient.addColorStop(0.5, `rgba(212, 228, 247, ${layerOpacity * 0.6})`);
        gradient.addColorStop(1, 'rgba(212, 228, 247, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(circleX, circleY, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private drawRoofLayer(x: number, y: number, width: number, height: number): void {
    const ctx = this.ctx;

    // Draw brick/stone wall
    ctx.fillStyle = ROOF_COLOUR;
    ctx.fillRect(x, y + 25, width, height - 25);

    // Add brick texture
    ctx.strokeStyle = ROOF_DARK;
    ctx.lineWidth = 1;
    for (let row = 0; row < (height - 25) / 12; row++) {
      const yPos = y + 25 + row * 12;
      ctx.beginPath();
      ctx.moveTo(x, yPos);
      ctx.lineTo(x + width, yPos);
      ctx.stroke();
    }

    // Draw peaked roof
    ctx.fillStyle = ROOF_DARK;
    ctx.beginPath();
    ctx.moveTo(x - 10, y + 25);
    ctx.lineTo(x + width / 2, y);
    ctx.lineTo(x + width + 10, y + 25);
    ctx.closePath();
    ctx.fill();

    // Roof highlight
    ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
    ctx.beginPath();
    ctx.moveTo(x - 10, y + 25);
    ctx.lineTo(x + width / 2, y);
    ctx.lineTo(x + width / 2, y + 8);
    ctx.lineTo(x, y + 25);
    ctx.closePath();
    ctx.fill();

    // Snow on roof
    ctx.fillStyle = SNOW_COLOUR;
    ctx.beginPath();
    ctx.moveTo(x - 8, y + 25);
    for (let i = 0; i < 5; i++) {
      const snowX = x - 8 + (width + 16) * (i / 5);
      const snowY = y + 25 + Math.sin(i * 2) * 2;
      ctx.lineTo(snowX, snowY - 3);
      ctx.lineTo(snowX + (width + 16) / 10, snowY);
    }
    ctx.lineTo(x + width + 8, y + 25);
    ctx.lineTo(x - 8, y + 25);
    ctx.closePath();
    ctx.fill();

    // Chimney (occasionally)
    if (Math.floor(x / 100) % 3 === 0) {
      const chimneyX = x + width * 0.7;
      ctx.fillStyle = CHIMNEY_COLOUR;
      ctx.fillRect(chimneyX, y + 8, 12, 22);

      // Chimney cap
      ctx.fillStyle = ROOF_DARK;
      ctx.fillRect(chimneyX - 2, y + 8, 16, 4);

      // Snow on chimney
      ctx.fillStyle = SNOW_COLOUR;
      ctx.fillRect(chimneyX, y + 8, 12, 3);
    }
  }

  private drawSleighWithReindeer(x: number, y: number): void {
    const ctx = this.ctx;

    // Draw team of reindeer in V-formation
    const reindeerPositions = [
      // Rudolph in front (center)
      { offsetX: 160, offsetY: 18, isRudolph: true },
      // Second row (2 reindeer)
      { offsetX: 135, offsetY: 10, isRudolph: false },
      { offsetX: 135, offsetY: 26, isRudolph: false },
      // Third row (2 reindeer)
      { offsetX: 110, offsetY: 5, isRudolph: false },
      { offsetX: 110, offsetY: 31, isRudolph: false },
    ];

    // Draw harness lines first (behind reindeer)
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    for (const pos of reindeerPositions) {
      ctx.beginPath();
      ctx.moveTo(x + pos.offsetX - 15, y + pos.offsetY);
      ctx.lineTo(x + 70, y + 22);
      ctx.stroke();
    }

    // Draw each reindeer
    for (const pos of reindeerPositions) {
      this.drawReindeer(x + pos.offsetX, y + pos.offsetY, pos.isRudolph);
    }

    // Sleigh body
    ctx.fillStyle = SLEIGH_COLOUR;
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 20);
    ctx.lineTo(x + 65, y + 20);
    ctx.lineTo(x + 70, y + 35);
    ctx.lineTo(x + 5, y + 35);
    ctx.closePath();
    ctx.fill();

    // Sleigh highlight
    ctx.fillStyle = SLEIGH_DARK;
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 20);
    ctx.lineTo(x + 65, y + 20);
    ctx.lineTo(x + 65, y + 24);
    ctx.lineTo(x + 10, y + 24);
    ctx.closePath();
    ctx.fill();

    // Sleigh runners
    ctx.strokeStyle = '#8b0000';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y + 38);
    ctx.lineTo(x + 75, y + 38);
    ctx.stroke();

    // Santa
    ctx.fillStyle = '#ffd4d4';
    ctx.beginPath();
    ctx.arc(x + 40, y + 8, 10, 0, Math.PI * 2);
    ctx.fill();

    // Santa's hat
    ctx.fillStyle = SLEIGH_COLOUR;
    ctx.beginPath();
    ctx.moveTo(x + 32, y + 8);
    ctx.lineTo(x + 38, y - 8);
    ctx.lineTo(x + 48, y + 8);
    ctx.closePath();
    ctx.fill();

    // Hat pom-pom
    ctx.fillStyle = SNOW_COLOUR;
    ctx.beginPath();
    ctx.arc(x + 38, y - 8, 4, 0, Math.PI * 2);
    ctx.fill();

    // Hat brim
    ctx.fillRect(x + 32, y + 7, 16, 3);

    // Santa's beard
    ctx.fillStyle = SNOW_COLOUR;
    ctx.beginPath();
    ctx.arc(x + 40, y + 12, 7, 0.3, Math.PI - 0.3);
    ctx.fill();
  }

  private drawReindeer(x: number, y: number, isRudolph: boolean): void {
    const ctx = this.ctx;

    // Reindeer body
    ctx.fillStyle = REINDEER_COLOUR;
    ctx.beginPath();
    ctx.ellipse(x, y, 14, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Reindeer head
    ctx.beginPath();
    ctx.ellipse(x + 16, y - 4, 8, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Antlers
    ctx.strokeStyle = REINDEER_COLOUR;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 18, y - 8);
    ctx.lineTo(x + 16, y - 14);
    ctx.moveTo(x + 18, y - 11);
    ctx.lineTo(x + 21, y - 13);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + 22, y - 8);
    ctx.lineTo(x + 24, y - 14);
    ctx.moveTo(x + 22, y - 11);
    ctx.lineTo(x + 19, y - 13);
    ctx.stroke();

    // Nose (red for Rudolph, black for others)
    ctx.fillStyle = isRudolph ? '#ff0000' : '#2c1810';
    ctx.beginPath();
    ctx.arc(x + 22, y - 2, isRudolph ? 2.5 : 2, 0, Math.PI * 2);
    ctx.fill();

    // Reindeer legs
    ctx.strokeStyle = REINDEER_COLOUR;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - 4, y + 8);
    ctx.lineTo(x - 4, y + 16);
    ctx.moveTo(x + 4, y + 8);
    ctx.lineTo(x + 4, y + 16);
    ctx.stroke();
  }

  private drawPowerUp(x: number, y: number, type: string): void {
    const size = 30;

    switch (type) {
      case 'carrot':
        this.drawCarrot(x, y, size);
        break;
      case 'lightning':
        this.drawLightning(x, y, size);
        break;
    }
  }

  private drawCarrot(x: number, y: number, size: number): void {
    const ctx = this.ctx;

    // Carrot body (orange)
    ctx.fillStyle = '#ff8c00';
    ctx.beginPath();
    ctx.moveTo(x + size / 2, y);
    ctx.lineTo(x + size * 0.7, y + size);
    ctx.lineTo(x + size * 0.3, y + size);
    ctx.closePath();
    ctx.fill();

    // Carrot lines
    ctx.strokeStyle = '#ff6b00';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x + size * 0.3, y + size * (0.3 + i * 0.2));
      ctx.lineTo(x + size * 0.7, y + size * (0.3 + i * 0.2));
      ctx.stroke();
    }

    // Green leaves
    ctx.fillStyle = '#228b22';
    ctx.beginPath();
    ctx.moveTo(x + size * 0.4, y);
    ctx.lineTo(x + size * 0.3, y - 5);
    ctx.lineTo(x + size * 0.45, y);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + size * 0.6, y);
    ctx.lineTo(x + size * 0.7, y - 5);
    ctx.lineTo(x + size * 0.55, y);
    ctx.fill();
  }

  private drawLightning(x: number, y: number, size: number): void {
    const ctx = this.ctx;

    // Lightning bolt shape (zigzag)
    ctx.fillStyle = '#ffff00';
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'miter';

    ctx.beginPath();
    ctx.moveTo(x + size * 0.5, y);
    ctx.lineTo(x + size * 0.3, y + size * 0.45);
    ctx.lineTo(x + size * 0.55, y + size * 0.45);
    ctx.lineTo(x + size * 0.35, y + size);
    ctx.lineTo(x + size * 0.65, y + size * 0.5);
    ctx.lineTo(x + size * 0.45, y + size * 0.5);
    ctx.lineTo(x + size * 0.7, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Add glow effect
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
