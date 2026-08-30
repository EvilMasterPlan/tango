import { useId } from 'react';
import './CoinIcon.scss';

// A simple golden coin glyph, inner to outer: a diagonal squircle punched
// clean through the middle (the coin's hole — a real cut-through via the
// mask below, not just a color-matched fill, so it reads correctly against
// any background), a bright gold face around it, a dark-gold ring, and a
// thicker gold outer rim — plus a couple of flat, deliberately artificial
// shine stripes laid across the top.
export function CoinIcon() {
  const id = useId();
  const holeMaskId = `${id}-hole`;
  const yellowMaskId = `${id}-yellow`;

  return (
    <svg className="coin-icon" viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <mask id={holeMaskId}>
          <rect x="0" y="0" width="32" height="32" fill="#ffffff" />
          <rect x="12" y="12" width="8" height="8" rx="1" ry="1" fill="#000000" transform="rotate(45 16 16)" />
        </mask>
        {/* Restricts the shine to the yellow layers only: white (visible)
            across the whole coin, then a black ring exactly where the
            dark-gold band sits, then white again inside that for the face —
            same "punch a hole in the visibility" trick as the hole mask
            above, just shaped like a ring instead of a square. This also
            naturally bounds the shine to the coin's round edge, since
            nothing beyond r=15 is painted into the mask at all. */}
        <mask id={yellowMaskId}>
          <circle cx="16" cy="16" r="15" fill="#ffffff" />
          <circle cx="16" cy="16" r="12" fill="#000000" />
          <circle cx="16" cy="16" r="10" fill="#ffffff" />
        </mask>
      </defs>
      {/* One masked group for everything — rings and shine alike — so the
          hole cuts through the shine stripes exactly the same way it cuts
          through the gold underneath them. */}
      <g mask={`url(#${holeMaskId})`}>
        <circle cx="16" cy="16" r="15" fill="#fde047" />
        <circle cx="16" cy="16" r="12" fill="#ca8a04" />
        <circle cx="16" cy="16" r="10" fill="#fde047" />
        <g mask={`url(#${yellowMaskId})`}>
          <rect x="-10" y="3" width="52" height="5" fill="#ffffff" opacity="0.5" transform="rotate(-35 16 16)" />
          <rect x="-10" y="19" width="52" height="1.5" fill="#ffffff" opacity="0.35" transform="rotate(-35 16 16)" />
        </g>
      </g>
    </svg>
  );
}
