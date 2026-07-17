import { type ReactNode } from 'react';
import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string | ReactNode;
  type: 'success' | 'error' | 'info';
  /** Auto-dismiss timeout in ms. 0 = sticky. */
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${nextId++}`;
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));

    if ((toast.duration ?? 3000) > 0) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, toast.duration ?? 3000);
    }
  },

  dismissToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));
