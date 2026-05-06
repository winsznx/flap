// Game settings configuration — inspired by PushFlap pattern
// Physics configs per difficulty mode, all tunable

export type Difficulty = "chill" | "normal" | "beast";

export const GAME_SETTINGS = {
  CANVAS: {
    WIDTH: 420,
    HEIGHT: 680,
    BACKGROUND_COLOR: "#87CEEB",
  },

  BIRD: {
    SIZE: 16,
    START_X: 100,
    COLOR: "#FFD700",
  },

  PHYSICS: {
    GRAVITY: { chill: 0.18, normal: 0.28, beast: 0.38 },
    JUMP_FORCE: { chill: -5.5, normal: -6.5, beast: -7.5 },
    MAX_FALL_SPEED: 10,
  },

  PIPES: {
    WIDTH: 56,
    COLOR: "#228B22",
    CAP_COLOR: "#1a6b1a",
    GAP_SIZE: { chill: 200, normal: 160, beast: 130 },
    SPEED: { chill: 2.0, normal: 2.8, beast: 3.5 },
    SPAWN_INTERVAL: { chill: 2200, normal: 1800, beast: 1500 }, // ms
    MIN_HEIGHT: 60,
  },

  COINS: {
    SIZE: 10,
    COLOR: "#FFD700",
    SPAWN_CHANCE: 0.6, // 60% chance per pipe gap
    POINTS: 5,
  },

  SCORING: {
    POINTS_PER_PIPE: { chill: 1, normal: 2, beast: 4 },
  },

  GAMEPLAY: {
    COUNTDOWN: 3,
    COLLISION_BUFFER: 2,
  },

  GROUND: {
    HEIGHT: 48,
    COLOR: "#8B7355",
    GRASS_COLOR: "#44b48b",
    GRASS_HEIGHT: 6,
  },
} as const;

export function getPhysics(difficulty: Difficulty) {
  return {
    gravity: GAME_SETTINGS.PHYSICS.GRAVITY[difficulty],
    jumpForce: GAME_SETTINGS.PHYSICS.JUMP_FORCE[difficulty],
    pipeGap: GAME_SETTINGS.PIPES.GAP_SIZE[difficulty],
    pipeSpeed: GAME_SETTINGS.PIPES.SPEED[difficulty],
    spawnInterval: GAME_SETTINGS.PIPES.SPAWN_INTERVAL[difficulty],
    pointsPerPipe: GAME_SETTINGS.SCORING.POINTS_PER_PIPE[difficulty],
  };
}
