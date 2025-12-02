// Game physics
export const GRAVITY = 0.4;
export const JUMP_FORCE = -8;
export const TERMINAL_VELOCITY = 10;
export const DRAG = 0.95;

// Sleigh dimensions
export const SLEIGH_WIDTH = 80;
export const SLEIGH_HEIGHT = 50;

// Obstacle settings - now for continuous terrain
export const OBSTACLE_WIDTH = 80;
export const OBSTACLE_GAP = 200;
export const OBSTACLE_SPACING = 80; // Continuous, no gaps
export const MIN_OBSTACLE_HEIGHT = 80;
export const MAX_OBSTACLE_HEIGHT = 250;

// Game settings
export const INITIAL_SPEED = 3;
export const SPEED_INCREASE_RATE = 0.003; // Speed increases gradually - no max!
export const DISTANCE_PER_FRAME = 0.1;

// Power-up settings
export const POWERUP_SPAWN_CHANCE = 0.015;
export const POWERUP_SIZE = 30;
export const SPEED_BOOST_DURATION = 180; // frames (~3 seconds at 60fps)

// Canvas size (mobile-optimised portrait)
export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 700;

// Snowflake settings
export const SNOWFLAKE_COUNT = 50;
export const SNOWFLAKE_MIN_SIZE = 2;
export const SNOWFLAKE_MAX_SIZE = 6;
export const SNOWFLAKE_MIN_SPEED = 1;
export const SNOWFLAKE_MAX_SPEED = 3;

// Colours
export const SKY_COLOUR = '#1a1a2e';
export const CLOUD_COLOUR = '#d4e4f7';
export const CLOUD_SHADOW = '#a8c5e8';
export const ROOF_COLOUR = '#8b4513';
export const ROOF_DARK = '#654321';
export const CHIMNEY_COLOUR = '#5c3317';
export const SLEIGH_COLOUR = '#dc143c';
export const SLEIGH_DARK = '#a01028';
export const REINDEER_COLOUR = '#8b6914';
export const SNOW_COLOUR = '#ffffff';
