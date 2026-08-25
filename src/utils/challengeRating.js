// Vocab entries carry a `score` in [0, 1] where higher means easier/more
// familiar. Challenge rating flips and rescales that to a 0-1000 scale
// where higher means harder, and formats it as a fixed-width 3-digit string
// (e.g. 12 -> '012') so it never shifts the layout it sits in.
export function getChallengeRating(score) {
  const rating = Math.round((1 - score) * 1000);
  return String(rating).padStart(3, '0');
}
