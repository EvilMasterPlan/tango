import { useEffect, useRef, useState } from 'react';
import { cx } from '@/utils/cx';
import './DigitReel.scss';

// Duration scales with how far a reel actually has to spin (see
// durationForDistance below) — a lone +1 settles quickly at a calm speed,
// while a big jump (or several wrapped revolutions) spins faster per-tick
// to still land inside its cap, reading as a slot-machine blur. The three
// arrays below keep each place's relative character (ones quickest/busiest,
// each place further left a beat slower) at any given distance, so a
// multi-digit landing cascades right-to-left.
//
// Baseline duration for a bare 1-tick move, before scaling by distance —
// keeps a small nudge from feeling instantaneous even though its raw
// distance is short.
const BASE_DURATION_MS_BY_PLACE = [140, 180, 220];
// Extra duration added per tick of distance travelled, on top of the base
// above.
const MS_PER_TICK_BY_PLACE = [35, 45, 55];
// Hard ceiling per place — without this, a huge distance (several wrapped
// revolutions) would spin for a comically long time. Capping duration
// makes a big jump spin faster to still land within it.
const MAX_DURATION_MS_BY_PLACE = [650, 800, 950];

function durationForDistance(place, distance) {
  const base = BASE_DURATION_MS_BY_PLACE[place] ?? BASE_DURATION_MS_BY_PLACE[0];
  const perTick = MS_PER_TICK_BY_PLACE[place] ?? MS_PER_TICK_BY_PLACE[0];
  const max = MAX_DURATION_MS_BY_PLACE[place] ?? MAX_DURATION_MS_BY_PLACE[0];
  return Math.min(max, base + perTick * distance);
}

// Fast start, gentle stop — "spin towards it, easing out."
const EASE = 'cubic-bezier(0.15, 0.85, 0.3, 1)';

// One digit of NumberDial: a vertical strip of stacked 0-9 glyphs, clipped
// to a single row's height and shifted with a CSS transition so landing on
// a new digit reads as the strip spinning up to it rather than a plain
// crossfade. `place` is distance from the ones column (0 = ones, 1 = tens,
// ...) and only affects timing/flourish, never the digit shown. `dimmed`
// (an insignificant leading zero) fades this reel's opacity down via CSS,
// so it transitions smoothly alongside the spin.
export function DigitReel({ digit, place = 0, dimmed = false }) {
  // Total forward ticks spun since the last reset — deliberately never
  // decreases, even when the new digit is numerically "before" the current
  // one (e.g. 9 -> 2 spins 9 -> 0 -> 1 -> 2), so the wheel always turns the
  // same direction a real one would. `instant` marks a ticks update that
  // should apply with no transition — used below to snap this back down to
  // a small equivalent value once a spin finishes. `durationMs` is
  // recomputed alongside `ticks` every time a new digit lands, so a bigger
  // jump gets more time than a small one.
  //
  // Retargeting mid-spin (a new `digit` arriving before the previous
  // transition finished) needs no special handling beyond this: `ticks`
  // only ever gets snapped down to its 0-9 equivalent once transitionend
  // actually fires below, which an interrupting change prevents from
  // firing at all — so `prev` here is always the last *commanded* target,
  // in-flight or not, and the forward distance to the next digit is
  // computed from that. Handing the browser a new transform target and
  // duration before the old one arrives is exactly what makes a CSS
  // transition smoothly redirect from wherever it's currently interpolated
  // to.
  const [{ ticks, instant, durationMs }, setState] = useState(() => ({ ticks: digit, instant: true, durationMs: 0 }));
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
      // The tape only ever moves forward the exact distance to the new
      // digit (wrapping through 9 -> 0 when the target is numerically
      // "before"), never further — no bonus revolution tacked on. A lone
      // +1 reads as a single small tick, not a spin.
      const distance = (digit - current + 10) % 10;
      return { ticks: prev + distance, instant: false, durationMs: durationForDistance(place, distance) };
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
    // landing in exact agreement.
    function handleTransitionEnd(e) {
      if (e.target !== strip || e.propertyName !== 'transform') return;
      setState(({ ticks: prev }) => ({ ticks: prev % 10, instant: true }));
    }
    strip.addEventListener('transitionend', handleTransitionEnd);
    return () => strip.removeEventListener('transitionend', handleTransitionEnd);
  }, [instant]);

  const strip = Array.from({ length: ticks + 1 }, (_, i) => i % 10);
  // Centers the resting row inside the taller viewport below — the
  // neighboring rows peeking in above/below it are what the top/bottom
  // fade masks away.
  const centerOffsetEm = 0.5;

  return (
    // The strip below renders every intermediate tick digit as real text
    // purely for the spin animation — aria-hidden here so a screen reader
    // doesn't read that whole sequence; NumberDial supplies the actual
    // value as a single accessible label instead.
    <span className={cx('digit-reel', dimmed && 'digit-reel--dimmed')} aria-hidden="true">
      <span className="digit-reel__viewport">
        <span
          ref={stripRef}
          className="digit-reel__strip"
          style={{
            transform: `translateY(${centerOffsetEm - ticks}em)`,
            transitionDuration: instant ? '0ms' : `${durationMs}ms`,
            transitionTimingFunction: EASE,
          }}
        >
          {strip.map((value, i) => (
            <span className="digit-reel__digit" key={i}>{value}</span>
          ))}
        </span>
      </span>
      {/* Siblings of .digit-reel__viewport above, not children of it, so
          these fades' own overhang can cover the clip edge rather than
          being clipped identically alongside the spinning strip. */}
      <span className="digit-reel__fade digit-reel__fade--top" aria-hidden="true" />
      <span className="digit-reel__fade digit-reel__fade--bottom" aria-hidden="true" />
    </span>
  );
}
