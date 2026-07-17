import { type ReactNode, useCallback, useEffect, useRef } from 'react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/**
 * Focusable element selector used for auto-focus and tab trapping.
 */
const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function Modal({ open, onClose, title, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  /* ─── Close on Escape ─── */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  /* ─── Focus trap ─── */
  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !panelRef.current) return;

    const focusable = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  /* ─── Open/close focus management ─── */
  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement as HTMLElement;

    // Auto-focus first focusable element
    requestAnimationFrame(() => {
      if (!panelRef.current) return;
      const first = panelRef.current.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    });

    document.addEventListener('keydown', trapFocus);
    return () => {
      document.removeEventListener('keydown', trapFocus);
      previousFocusRef.current?.focus();
    };
  }, [open, trapFocus]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-modal" role="dialog" aria-modal="true" aria-label={title}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Centered panel — full-screen on mobile, centered on desktop */}
      <div className="fixed inset-0 flex items-center justify-center p-0 md:p-4 pointer-events-none overflow-y-auto">
        <div ref={panelRef} className="w-full max-w-lg pointer-events-auto my-0 md:my-8">
          <div className="rounded-none md:rounded-panel border-0 md:border border-cream/10 bg-felt p-5 md:p-7 shadow-2xl min-h-dvh md:min-h-0 safe-area-top safe-area-bottom">
            {title && (
              <div className="flex items-center justify-between mb-5 safe-area-top">
                <h2 className="font-serif text-2xl font-normal text-gold">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 text-text-muted hover:text-text transition-colors md:hidden"
                  aria-label="Close dialog"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
