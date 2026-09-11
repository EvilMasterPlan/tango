import { useEffect, useRef } from 'react';

// Closes a popup on an outside click/tap or Escape — shared by every
// trigger+popup control in the app (Overview's Filter/Sort buttons, the
// Overview mode dropdown, OverflowMenu's own menu) so each gets its own
// independent instance of the same dismiss behavior.
export function useDismissablePopover(isOpen, onDismiss) {
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      if (ref.current && !ref.current.contains(event.target)) onDismiss();
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') onDismiss();
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onDismiss]);

  return ref;
}
