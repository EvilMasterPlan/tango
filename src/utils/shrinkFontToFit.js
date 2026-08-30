// Steps an element's font-size down (in whole px, from its current computed
// size) until `fits()` reports true or the size bottoms out at `minScale` of
// the starting size. Shared step-down loop behind ChoiceGrid (shrinking a
// choice label to fit within a line-clamp) and VocabularyDisplay (shrinking
// a long word to fit on one line) — callers own what "fits" means
// (scrollWidth vs. a container, scrollHeight vs. a line-clamp, ...) and any
// DOM prep that measurement needs (forcing nowrap, lifting a line-clamp,
// ...); this only owns the loop and the font-size writes themselves.
export function shrinkFontToFit(element, fits, { minScale = 0.5, stepPx = 1 } = {}) {
  element.style.fontSize = '';
  if (fits()) return;

  const baseSize = parseFloat(window.getComputedStyle(element).fontSize);
  const minSize = baseSize * minScale;
  let size = baseSize;

  while (size > minSize) {
    size -= stepPx;
    element.style.fontSize = `${size}px`;
    if (fits()) return;
  }
}
