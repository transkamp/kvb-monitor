"use client";

import { useEffect, useRef } from "react";

interface ToastProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

export default function Toast({
  message,
  visible,
  onDismiss,
  duration = 2500,
}: ToastProps) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, message, duration, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
      className={`
        fixed left-1/2 -translate-x-1/2 z-50
        flex items-center gap-2
        px-4 py-3 rounded-lg shadow-lg
        bg-[var(--primary)] text-[var(--background)]
        text-sm font-medium
        transition-all duration-300 ease-out
        pointer-events-none
        ${visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4"
        }
      `}
    >
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M5 13l4 4L19 7"
        />
      </svg>
      <span>{message}</span>
    </div>
  );
}
