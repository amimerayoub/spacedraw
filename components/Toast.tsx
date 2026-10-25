'use client';

import React from 'react';

interface ToastProps {
  message: string | null;
  onClear: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClear }) => {
  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClear();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClear]);

  if (!message) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl glass-panel-strong border border-[var(--border-strong)] shadow-2xl text-xs font-mono text-[var(--text-primary)] flex items-center gap-2 animate-bounce"
      role="status"
      aria-live="polite"
    >
      <span className="w-2 h-2 rounded-full bg-[var(--text-primary)]" />
      <span>{message}</span>
    </div>
  );
};
