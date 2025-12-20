export const TIER_NAMES = {
  1: 'bronze',
  2: 'silver',
  3: 'gold',
  4: 'platinum',
  5: 'emerald',
  6: 'topaz',
  7: 'ruby',
  8: 'diamond'
};

export const TIER_COLORS = {
  bronze: {
    border: '#cd7f32',
    borderRgb: { r: 205, g: 127, b: 50 },
    progressGradient: ['#cd7f32', '#b87333'],
    badgeGradient: ['#3d2818', '#2d1f12'],
    text: '#ffb84d',
    glow: { base: 0.3, inset: 0.1, hover: 0.5 }
  },
  silver: {
    border: '#c0c0c0',
    borderRgb: { r: 192, g: 192, b: 192 },
    progressGradient: ['#c0c0c0', '#a8a8a8'],
    badgeGradient: ['#2a2a2a', '#1f1f1f'],
    text: '#e8e8e8',
    glow: { base: 0.4, inset: 0.15, hover: 0.6 }
  },
  gold: {
    border: '#ffd700',
    borderRgb: { r: 255, g: 215, b: 0 },
    progressGradient: ['#ffd700', '#ffed4e'],
    badgeGradient: ['#3d2f0f', '#2d2209'],
    text: '#ffed4e',
    glow: { base: 0.5, inset: 0.2, hover: 0.7 }
  },
  platinum: {
    border: '#e5e4e2',
    borderRgb: { r: 229, g: 228, b: 226 },
    progressGradient: ['#e5e4e2', '#d4d3d1'],
    badgeGradient: ['#2d2c2a', '#1f1e1d'],
    text: '#f5f4f2',
    glow: { base: 0.5, inset: 0.2, hover: 0.7 }
  },
  emerald: {
    border: '#50c878',
    borderRgb: { r: 80, g: 200, b: 120 },
    progressGradient: ['#50c878', '#3db568'],
    badgeGradient: ['#0f2a1a', '#0a1d12'],
    text: '#6dd89a',
    glow: { base: 0.5, inset: 0.2, hover: 0.7 }
  },
  topaz: {
    border: '#ffc87c',
    borderRgb: { r: 255, g: 200, b: 124 },
    progressGradient: ['#ffc87c', '#ffb85c'],
    badgeGradient: ['#3d2a15', '#2d1f0f'],
    text: '#ffd99c',
    glow: { base: 0.5, inset: 0.2, hover: 0.7 }
  },
  ruby: {
    border: '#e0115f',
    borderRgb: { r: 224, g: 17, b: 95 },
    progressGradient: ['#e0115f', '#c0104f'],
    badgeGradient: ['#2a0a18', '#1f0712'],
    text: '#ff2d7f',
    glow: { base: 0.6, inset: 0.25, hover: 0.8 }
  },
  diamond: {
    border: '#b9f2ff',
    borderRgb: { r: 185, g: 242, b: 255 },
    progressGradient: ['#b9f2ff', '#7dd3ff'],
    badgeGradient: ['#0a1a2a', '#05121f'],
    text: '#d9f5ff',
    glow: { base: 0.7, inset: 0.3, hover: 0.9 }
  }
};

export const getTierName = (level) => {
  if (level > 8) return 'diamond';
  return TIER_NAMES[level] || 'bronze';
};

export const getTierColors = (tierName) => {
  return TIER_COLORS[tierName] || TIER_COLORS.bronze;
};

