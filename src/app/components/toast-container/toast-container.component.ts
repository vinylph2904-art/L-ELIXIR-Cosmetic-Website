import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-6 right-6 z-50 space-y-3 pointer-events-none">
      <div
        *ngFor="let toast of toasts"
        class="flex items-center gap-3 px-4 py-3 rounded-lg text-white shadow-lg pointer-events-auto transform transition-all duration-300 animate-in slide-in-from-right-2"
        [ngClass]="getToastClass(toast.type)"
      >
        <span class="material-symbols-outlined text-[20px]">
          {{ getToastIcon(toast.type) }}
        </span>
        <span class="font-body-md text-body-md">{{ toast.message }}</span>
        <button
          (click)="removeToast(toast.id)"
          class="ml-2 hover:opacity-75 transition-opacity"
        >
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .animate-in {
        animation: slideIn 0.3s ease-out;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(100%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes slideOut {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(100%);
        }
      }

      .animate-out {
        animation: slideOut 0.3s ease-in forwards;
      }
    `
  ]
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription: Subscription | null = null;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subscription = this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  removeToast(id: string) {
    this.toastService.remove(id);
  }

  getToastClass(type: string): string {
    const classes: Record<string, string> = {
      success: 'bg-green-500 hover:bg-green-600',
      error: 'bg-red-500 hover:bg-red-600',
      warning: 'bg-amber-500 hover:bg-amber-600',
      info: 'bg-blue-500 hover:bg-blue-600'
    };
    return classes[type] || classes.info;
  }

  getToastIcon(type: string): string {
    const icons: Record<string, string> = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };
    return icons[type] || icons.info;
  }
}
