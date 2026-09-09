import { forwardRef } from 'react';
import { IoLockClosed } from 'react-icons/io5';
import { cx } from '@/utils/cx';
import './Tile.scss';

// Per-type/level accent color — the single source of truth for every
// square "pressable" tile in the app (currently the home page's lesson
// tiles and the settings dialog's JLPT level toggles). Pass the lookup key
// via `accent` (e.g. "jlpt_n5"); a key not found here is used as-is, as a
// raw CSS color value, so a one-off accent doesn't need an entry.
export const TILE_ACCENTS = {
  new_words: 'var(--color-accent-secondary)',
  level_up: 'var(--color-accent-primary)',
  fix_mistakes: 'var(--color-accent-error)',
  kanji_spotlight: 'var(--color-accent-warning)',
  // No spare theme accent left for a 5th/6th/7th tile type, so these use
  // literal colors instead of the shared accent tokens above.
  from_the_top: '#a78bfa',
  // JLPT_N5-N1 match the same blue-through-red hue progression Overview's
  // filter buttons and GemChart's per-level facet hues already use for JLPT
  // levels elsewhere in the app, rather than one-off colors, so a level
  // reads as "the same N4" wherever it shows up.
  jlpt_n5: 'hsl(210, 70%, 60%)',
  jlpt_n4: 'hsl(140, 60%, 45%)',
  jlpt_n3: 'hsl(50, 80%, 55%)',
  jlpt_n2: 'hsl(30, 80%, 55%)',
  jlpt_n1: 'hsl(0, 70%, 55%)',
  random: '#71717a',
  // The 6 question-type tiles — no theme accent or JLPT hue left to reuse,
  // so literal colors again (same reasoning as from_the_top above), grouped
  // into two families to stay clear of every hue already claimed above: a
  // lime solo for word_choice, then a cool cyan/teal pair and a warm
  // fuchsia/pink/rose trio for the rest.
  word_choice: '#a3e635',
  reading_choice: '#2dd4bf',
  meaning_choice: '#22d3ee',
  reading_spelling: '#e879f9',
  reading_typing: '#f472b6',
  word_wheel: '#fb7185',
};

// A square "pressable" tile — the shared visual/interactive unit behind the
// home page's lesson tiles and the settings dialog's JLPT level toggles.
// Deliberately owns every state selector itself in one file (Tile.scss) —
// base look, accent color, selected/history/chosen/dim/locked variants —
// so nothing outside this component ever needs its own copy of
// `.shared-tile`-prefixed CSS. That's the whole point of pulling this out:
// two different pages each declaring `.home-tile` (one small override, one
// full definition) tied on CSS specificity, and which one actually won
// depended on which page's JS happened to import the other's dialog first
// — an accident of bundling order, not anything declared in either
// stylesheet. A single owner for the class makes that collision structurally
// impossible instead of something to remember to avoid.
//
// Sizing is deliberately not a prop: set the `--tile-size`/`--tile-font-
// size` custom properties on an ancestor instead (see .home-board and
// .settings-dialog__levels for examples, including their own responsive
// breakpoints) — a CSS custom property already does the "cascading
// default, overridable per scope" job a size prop would just reimplement,
// without needing inline styles or a growing enum of size names.
export const Tile = forwardRef(function Tile(
  {
    as: Component = 'button',
    accent,
    icon,
    children,
    selected = false,
    history = false,
    chosen = false,
    dim = false,
    locked = false,
    lockedMessage,
    className,
    style,
    disabled,
    ...rest
  },
  ref,
) {
  const isButton = Component === 'button';
  const tileAccent = accent ? TILE_ACCENTS[accent] ?? accent : undefined;

  return (
    <Component
      ref={ref}
      type={isButton ? 'button' : undefined}
      className={cx(
        'shared-tile',
        selected && 'shared-tile--selected',
        history && 'shared-tile--history',
        chosen && 'shared-tile--chosen',
        dim && 'shared-tile--dim',
        locked && 'shared-tile--locked',
        className,
      )}
      style={tileAccent ? { '--tile-accent': tileAccent, ...style } : style}
      disabled={isButton ? locked || disabled : undefined}
      {...rest}
    >
      {locked && <span className="shared-tile__hatch" aria-hidden="true" />}
      <span className="shared-tile__icon">{icon ?? children}</span>
      {locked && <IoLockClosed className="shared-tile__lock" />}
      {locked && lockedMessage && (
        <span className="shared-tile__tooltip" role="tooltip">
          {lockedMessage}
        </span>
      )}
    </Component>
  );
});
