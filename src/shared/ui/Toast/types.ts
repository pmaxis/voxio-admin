export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
  /** Callback при натисканні «Скасувати». Показує кнопку undo з таймером. */
  onUndo?: () => void;
  /** Тривалість вікна для undo (мс). За замовчуванням 5000. */
  undoDuration?: number;
}

export interface ToastOptions {
  variant?: ToastVariant;
  duration?: number;
}
