import { useEffect, useRef, useState } from 'react';
import './DigitReel.scss';

// Extra full revolutions layered on top of the direct forward distance to
// the new digit, purely for flourish — index 0 (ones) gets a bonus spin so
// it reads as the fastest/busiest reel, the way the rightmost wheel on a
// slot machine blurs past while the others just settle into place.
const EXTRA_REVOLUTIONS_BY_PLACE = [1, 0, 0];

// Ones settles quickest, each place further left takes a beat longer — the
// whole number lands as a little right-to-left "tick, tick, tick" instead
// of every reel stopping at once.
const DURATION_MS_BY_PLACE = [550, 800, 1050];

// Fast start, gentle stop — "spin towards it, easing out."
const EASE = 'cubic-bezier(0.15, 0.85, 0.3, 1)';

// One digit of NumberDial: a vertical strip of stacked 0-9 glyphs, clipped
// to a single row's height and shifted with a CSS transition so landing on
// a new digit reads as the strip spinning up to it rather than a plain
// crossfade. `place` is distance from the ones column (0 = ones, 1 = tens,
// ...) and only affects timing/flourish, never the digit shown.
export function DigitReel({ digit, place = 0 }) {
  // Total forward ticks spun since the last reset — deliberately never
  // decreases, even when the new digit is numerically "before" the current
  // one (e.g. 9 -> 2 spins 9 -> 0 -> 1 -> 2 rather than jumping backward
  // three rows), so the wheel always turns the same direction a real one
  // would. `instant` marks a ticks update that should apply with no
  // transition — used below to snap this back down to a small equivalent
  // value once a spin finishes, rather than animate toward it.
  const [{ ticks, instant }, setState] = useState(() => ({ ticks: digit, instant: true }));
  const mounted = useRef(false);
  const stripRef = useRef(null);

  useEffect(() => {
    // The initial state above already shows the right digit — skip
    // animating into the very first render.
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setState(({ ticks: prev }) => {
      const current = prev % 10;
      const forward = (digit - current + 10) % 10;
      const extraRevolutions = forward === 0 ? 0 : EXTRA_REVOLUTIONS_BY_PLACE[place] ?? 0;
      return { ticks: prev + forward + extraRevolutions * 10, instant: false };
    });
  }, [digit, place]);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || instant) return;

    // Once a spin actually finishes, re-anchor `ticks` to the small
    // (0-9) equivalent of wherever it landed, applied with no transition —
    // same digit, so it's an invisible snap. Without this, `ticks` (and so
    // the strip's translateY) grows without bound over a long lesson, and
    // very large, very differently-sized offsets between reels (the ones
    // place accumulates far more ticks than tens/hundreds) are prone to
    // landing a hair off from each other from floating-point/subpixel
    // rounding — keeping every reel's resting transform small keeps them
    // landing in exact agreement instead.
    function handleTransitionEnd(e) {
      if (e.target !== strip || e.propertyName !== 'transform') return;
      setState(({ ticks: prev }) => ({ ticks: prev % 10, instant: true }));
    }
    strip.addEventListener('transitionend', handleTransitionEnd);
    return () => strip.removeEventListener('transitionend', handleTransitionEnd);
  }, [instant]);

  const strip = Array.from({ length: ticks + 1 }, (_, i) => i % 10);
  // Centers the resting row inside the taller viewport below (see
  // DigitReel.scss) — the neighboring rows peeking in above/below it are
  // what the top/bottom fade masks away.
  const centerOffsetEm = 0.5;

  return (
    <span className="digit-reel">
      <span className="digit-reel__viewport">
        <span
          ref={stripRef}
          className="digit-reel__strip"
          style={{
            transform: `translateY(${centerOffsetEm - ticks}em)`,
            transitionDuration: instant ? '0ms' : `${DURATION_MS_BY_PLACE[place] ?? DURATION_MS_BY_PLACE[0]}ms`,
            transitionTimingFunction: EASE,
          }}
        >
          {strip.map((value, i) => (
            <span className="digit-reel__digit" key={i}>{value}</span>
          ))}
        </span>
      </span>
      {/* Siblings of .digit-reel__viewport above, not children of it — see
          DigitReel.scss for why that's what lets these fades' own overhang
          actually cover the clip edge instead of being clipped identically
          alongside the spinning strip. */}
      <span className="digit-reel__fade digit-reel__fade--top" aria-hidden="true" />
      <span className="digit-reel__fade digit-reel__fade--bottom" aria-hidden="true" />
    </span>
  );
}
