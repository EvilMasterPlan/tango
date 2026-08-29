import confetti from 'canvas-confetti';

// Built once — shapeFromText rasterizes the emoji onto an offscreen canvas,
// which is wasted work to redo on every correct answer.
const COIN_SHAPE = confetti.shapeFromText({ text: '🪙', scalar: 3 });

// Bursts coin confetti from a given viewport position (fractional x/y, each
// 0-1 — see originForElement).
export function fireCoinConfetti(origin) {
  confetti({
    particleCount: 24,
    spread: 70,
    startVelocity: 35,
    gravity: 0.9,
    ticks: 200,
    scalar: 2.5,
    shapes: [COIN_SHAPE],
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
