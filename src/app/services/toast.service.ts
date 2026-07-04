import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  private toastId = 0;
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success', duration = 3000) {
    const id = `toast-${++this.toastId}`;
    const toast: Toast = { id, message, type, duration };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    if (duration > 0) {
      const timer = setTimeout(() => {
        this.remove(id);
        this.timers.delete(id);
      }, 2000);

      this.timers.set(id, timer);
    }
  }

  success(message: string, duration = 3000) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 3000) {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration = 3000) {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration = 3000) {
    this.show(message, 'info', duration);
  }

  remove(id: string) {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(t => t.id !== id));
  }
}
