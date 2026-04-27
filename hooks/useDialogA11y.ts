"use client";

import { RefObject, useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface UseDialogA11yOptions {
  isOpen: boolean;
  panelRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  initialFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * Wires up modal-dialog accessibility:
 * - moves focus to initialFocusRef when opened
 * - traps Tab focus within panelRef
 * - closes on Escape
 * - restores focus to the previously focused element on close
 *
 * For modals that mount/unmount on open/close, pass `isOpen` constant true —
 * the cleanup fires on unmount.
 */
export function useDialogA11y({
  isOpen,
  panelRef,
  onClose,
  initialFocusRef,
}: UseDialogA11yOptions) {
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current =
      (document.activeElement as HTMLElement | null) ?? null;
    initialFocusRef?.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previouslyFocusedRef.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose]);
}
