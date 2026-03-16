import { ref, readonly } from 'vue';
import type { ToastItem, ToastOptions } from './types';

const toasts = ref<ToastItem[]>([]);
let idCounter = 0;

function generateId(): string {
  idCounter += 1;
  return `toast-${idCounter}-${Date.now()}`;
}

function add(message: string, options: ToastOptions = {}): string {
  const id = generateId();
  const toast: ToastItem = {
    id,
    message,
    variant: options.variant ?? 'info',
    duration: options.duration,
  };
  toasts.value = [...toasts.value, toast];
  return id;
}

function remove(id: string): void {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

function success(message: string, duration?: number): string {
  return add(message, { variant: 'success', duration });
}

function error(message: string, duration?: number): string {
  return add(message, { variant: 'error', duration });
}

function info(message: string, duration?: number): string {
  return add(message, { variant: 'info', duration });
}

function warning(message: string, duration?: number): string {
  return add(message, { variant: 'warning', duration });
}

const DEFAULT_UNDO_DURATION = 5000;

function successWithUndo(
  message: string,
  onUndo: () => void,
  undoDuration = DEFAULT_UNDO_DURATION
): string {
  const id = generateId();
  const toast: ToastItem = {
    id,
    message,
    variant: 'success',
    duration: undoDuration,
    onUndo,
    undoDuration,
  };
  toasts.value = [...toasts.value, toast];
  return id;
}

export function useToast() {
  return {
    toasts: readonly(toasts),
    add,
    remove,
    success,
    error,
    info,
    warning,
    successWithUndo,
  };
}
