export const SYMBOLS = {
  RED_GEM: { id: 'RED_GEM', char: '🔴', pay: [1, 1.5, 10], image: '/images/symbols/red_gem.png' },
  PURPLE_GEM: { id: 'PURPLE_GEM', char: '🟣', pay: [0.8, 1.2, 8], image: '/images/symbols/purple_gem.png' },
  YELLOW_GEM: { id: 'YELLOW_GEM', char: '🟡', pay: [0.5, 1, 5], image: '/images/symbols/yellow_gem.png' },
  GREEN_GEM: { id: 'GREEN_GEM', char: '🟢', pay: [0.4, 0.9, 4], image: '/images/symbols/green_gem.png' },
  BLUE_GEM: { id: 'BLUE_GEM', char: '🔵', pay: [0.25, 0.75, 2], image: '/images/symbols/blue_gem.png' },
  CUP: { id: 'CUP', char: '🍷', pay: [1.5, 2, 12], image: '/images/symbols/cup.png' },
  RING: { id: 'RING', char: '💍', pay: [2, 5, 15], image: '/images/symbols/ring.png' },
  HOURGLASS: { id: 'HOURGLASS', char: '⏳', pay: [2.5, 10, 25], image: '/images/symbols/hourglass.png' },
  CROWN: { id: 'CROWN', char: '👑', pay: [10, 25, 50], image: '/images/symbols/crown.png' }
};

export const SPECIALS = {
  SCATTER: { id: 'SCATTER', char: '⚡', isScatter: true, image: '/images/symbols/scatter.svg' },
  SUPER_SCATTER: { id: 'SUPER_SCATTER', char: '🌟', isScatter: true, isSuper: true, image: '/images/symbols/super_scatter.svg' },
  MULTIPLIER: { id: 'MULTIPLIER', char: '🔮', isMultiplier: true, image: '/images/symbols/multiplier.svg' }
};

export const SYMBOL_KEYS = Object.keys(SYMBOLS);

export const GAME_CONFIG = {
  ROWS: 5,
  COLS: 6
};
