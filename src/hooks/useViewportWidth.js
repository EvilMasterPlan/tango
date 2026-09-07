import { useEffect, useState } from 'react';

// Tracks window.innerWidth, re-rendering on resize — shared by anything
// that needs to switch layout/data density at a breakpoint in JS rather
// than pure CSS (see Effort/Page.jsx's mobile day-count reduction).
export function useViewportWidth() {
  const [width, setWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}
