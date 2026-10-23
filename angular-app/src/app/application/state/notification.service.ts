import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export interface AppNotification {
  readonly id: number;
  readonly type: NotificationType;
  readonly title: string;
  readonly message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private sequence = 0;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private readonly notificationsSubject = new BehaviorSubject<readonly AppNotification[]>([]);
  readonly notifications$ = this.notificationsSubject.asObservable();

  success(title: string, message: string): void { this.show('success', title, message); }
  error(title: string, message: string): void { this.show('error', title, message); }
  warning(title: string, message: string): void { this.show('warning', title, message); }
  info(title: string, message: string): void { this.show('info', title, message); }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer) clearTimeout(timer);
    this.timers.delete(id);
    this.notificationsSubject.next(this.notificationsSubject.value.filter(item => item.id !== id));
  }

  private show(type: NotificationType, title: string, message: string): void {
    const id = ++this.sequence;
    this.notificationsSubject.next([...this.notificationsSubject.value, { id, type, title, message }]);
    this.timers.set(id, setTimeout(() => this.dismiss(id), 6000));
  }
}
