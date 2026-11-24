export const GAME_CONFIG = {
  ROWS: 5,
  COLS: 6,
  SYMBOL_WIDTH: 140,
  SYMBOL_HEIGHT: 140,
  REEL_GAP: 10,
  MARGIN: 20,
  SPIN_SPEED: 25,
  MAX_SYMBOL_POOL: 100,
  CASCADING_DURATION: 0.4, // seconds
  WIN_ANIMATION_DURATION: 0.7,
};

export const ASSETS = {
  SYMBOLS: {
    RED_GEM: '/images/symbols/red_gem.png',
    PURPLE_GEM: '/images/symbols/purple_gem.png',
    YELLOW_GEM: '/images/symbols/yellow_gem.png',
    GREEN_GEM: '/images/symbols/green_gem.png',
    BLUE_GEM: '/images/symbols/blue_gem.png',
    CUP: '/images/symbols/cup.png',
    RING: '/images/symbols/ring.png',
    HOURGLASS: '/images/symbols/hourglass.png',
    CROWN: '/images/symbols/crown.png',
    SCATTER: '/images/symbols/scatter.svg',
    SUPER_SCATTER: '/images/symbols/super_scatter.svg',
    MULTIPLIER: '/images/symbols/multiplier.svg',
  },
  SFX: {
    SPIN: '/spin.mp3',
    // ... other audio
  }
};
