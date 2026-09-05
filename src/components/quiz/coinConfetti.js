import confetti from 'canvas-confetti';

// A simplified version of the app's coin icon (a circle with a small
// diamond punched out) as an SVG path — the two subpaths wind in opposite
// directions (the outer circle clockwise, the inner diamond counter-
// clockwise) so the default nonzero fill rule renders the diamond as a
// hole. shapeFromPath's own colors come from the `colors` option on each
// call below, not the path, and per canvas-confetti's docs the
// shape/matrix is deterministic and best computed once and cached, hence
// building it here at module scope rather than inside either function.
const COIN_SHAPE = confetti.shapeFromPath({
  path: 'M16 1 A15 15 0 1 1 16 31 A15 15 0 1 1 16 1 Z M16 12 L12 16 L16 20 L20 16 Z',
});

const COIN_COLORS = ['#fde047', '#eab308', '#ca8a04'];

// Bursts coin confetti from a given viewport position (fractional x/y, each
// 0-1 — see originForElement) — the main in-quiz correct-answer
// celebration.
export function fireCoinConfetti(origin) {
  confetti({
    particleCount: 6,
    spread: 70,
    startVelocity: 35,
    gravity: 1.5,
    ticks: 100,
    scalar: 2.5,
    shapes: [COIN_SHAPE],
    colors: COIN_COLORS,
    origin,
  });
}

// A smaller, quieter burst than fireCoinConfetti above — used for the
// per-word reward pop-ins during the quiz summary's rotation, so it stays
// a small accent rather than competing with the bigger in-quiz celebration.
export function fireRewardConfetti(origin) {
  confetti({
    particleCount: 3,
    spread: 60,
    startVelocity: 25,
    gravity: 1,
    ticks: 150,
    scalar: 1.4,
    shapes: [COIN_SHAPE],
    colors: COIN_COLORS,
    origin,
  });
}

// Converts a DOM element's bounding rect into confetti's fractional origin.
export function originForElement(element) {
  const rect = element.getBoundingClientRect();
  return {
    x: (rect.left + rect.width / 2) / window.innerWidth,
    y: (rect.top + rect.height / 2) / window.innerHeight,
  };
}
