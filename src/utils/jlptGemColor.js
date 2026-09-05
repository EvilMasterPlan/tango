// Maps a vocab entry's JLPT level (entry.jlpt, e.g. "N5") to a GemChart
// `color`. Levels outside this map (and no level at all) return undefined,
// leaving GemChart's own default (blue) in effect.
const JLPT_GEM_COLORS = { N5: 'blue', N4: 'green', N3: 'yellow', N2: 'orange', N1: 'red' };

export function jlptGemColor(jlpt) {
  return JLPT_GEM_COLORS[jlpt];
}
