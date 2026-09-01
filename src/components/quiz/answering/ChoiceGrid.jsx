import { useEffect, useLayoutEffect, useRef } from 'react';
import { ChoiceButton } from '@/components/quiz/answering/ChoiceButton';
import { fireCoinConfetti, originForElement } from '@/components/quiz/coinConfetti';
import { shrinkFontToFit } from '@/utils/shrinkFontToFit';
import './ChoiceGrid.scss';

const MIN_FONT_SCALE = 0.5;
const FONT_STEP_PX = 1;
const MAX_LABEL_LINES = 2;

// Sizes all choice buttons to fill the width the grid actually has
// available — then, for any label that wraps past MAX_LABEL_LINES at that
// width, shrinks its font size until it fits within that many lines.
// Finally, since labels can end up one or two lines tall, every button's
// height is set to match the tallest one so the grid stays uniform.
function useUniformChoiceSizing(choices, gridRef, labelRefs) {
  useLayoutEffect(() => {
    const grid = gridRef.current;
    const labels = labelRefs.current.filter(Boolean);
    if (!grid || labels.length === 0) return;

    const buttons = labels.map((label) => label.parentElement);

    // Reset to natural sizing before measuring.
    buttons.forEach((button) => {
      button.style.width = '';
      button.style.height = '';
    });

    const gridStyle = window.getComputedStyle(grid);
    const columnCount = gridStyle.gridTemplateColumns.trim().split(/\s+/).length;
    const gapPx = parseFloat(gridStyle.columnGap || gridStyle.gap || '0');
    const availablePerButton = (grid.clientWidth - gapPx * (columnCount - 1)) / columnCount;

    const targetWidth = availablePerButton;
    buttons.forEach((button) => {
      button.style.width = `${targetWidth}px`;
    });

    labels.forEach((label) => {
      // The line-clamp CSS caps the box's rendered height at MAX_LABEL_LINES,
      // which would make scrollHeight read as already-clamped instead of the
      // text's true wrapped height. Measure with the clamp lifted, then
      // restore it so the CSS ellipsis fallback still guards extreme cases.
      label.style.display = 'block';
      label.style.webkitLineClamp = 'unset';

      const maxHeight = () => parseFloat(window.getComputedStyle(label).lineHeight) * MAX_LABEL_LINES;
      shrinkFontToFit(label, () => label.scrollHeight <= maxHeight() + 1, { minScale: MIN_FONT_SCALE, stepPx: FONT_STEP_PX });

      label.style.display = '';
      label.style.webkitLineClamp = '';
    });

    // Labels can now be one or two lines tall — even out every button's
    // height to the tallest one so the grid rows stay uniform.
    const maxNaturalHeight = Math.max(...buttons.map((button) => button.scrollHeight));
    buttons.forEach((button) => {
      button.style.height = `${maxNaturalHeight}px`;
    });
  }, [choices, gridRef, labelRefs]);
}

// Once revealed (post-Check), the correct choice shows success and a wrong
// selection shows fail; otherwise it's just plain/selected as you pick.
function variantFor(index, { revealed, selectedIndex, correctIndex }) {
  if (revealed) {
    if (index === correctIndex) return 'success';
    if (index === selectedIndex) return 'fail';
    return 'default';
  }
  return index === selectedIndex ? 'selected' : 'default';
}

export function ChoiceGrid({ choices, selectedIndex, onSelect, correctIndex, revealed = false, emphasized = false, japanese = false }) {
  const gridRef = useRef(null);
  const labelRefs = useRef([]);
  useUniformChoiceSizing(choices, gridRef, labelRefs);

  // Coin confetti bursts from the correct button's position, but only when
  // that's also what the student picked — a wrong guess shouldn't get a
  // celebration just because the correct answer happens to be visible too.
  useEffect(() => {
    if (!revealed || selectedIndex !== correctIndex) return;

    const button = labelRefs.current[correctIndex]?.parentElement;
    if (!button) return;

    fireCoinConfetti(originForElement(button));
  }, [revealed, selectedIndex, correctIndex]);

  return (
    <div className="modern-choice-grid" ref={gridRef}>
      {choices.map((choice, index) => (
        <ChoiceButton
          key={index}
          text={choice}
          index={index}
          variant={variantFor(index, { revealed, selectedIndex, correctIndex })}
          emphasized={emphasized}
          japanese={japanese}
          onSelect={onSelect}
          disabled={revealed}
          labelRef={(el) => (labelRefs.current[index] = el)}
        />
      ))}
    </div>
  );
}
