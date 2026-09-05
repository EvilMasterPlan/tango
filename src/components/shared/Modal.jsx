import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IoClose } from 'react-icons/io5';
import { IconButton } from '@/components/shared/IconButton';
import { cx } from '@/utils/cx';
import './Modal.scss';

// A centered dialog panel over a dismissible backdrop (Escape, a backdrop
// click, or the close button all call `onClose`). Focuses the close button
// on mount so keyboard/screen-reader users land somewhere sensible without
// the caller needing its own ref plumbing.
export function Modal({ title, onClose, children, className }) {
  const closeButtonRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="shared-modal__backdrop" onClick={onClose}>
      <div
        className={cx('shared-modal', className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shared-modal__header">
          <h2 id={titleId} className="shared-modal__title">{title}</h2>
          <IconButton size="sm" onClick={onClose} label="Close" ref={closeButtonRef}>
            <IoClose />
          </IconButton>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
