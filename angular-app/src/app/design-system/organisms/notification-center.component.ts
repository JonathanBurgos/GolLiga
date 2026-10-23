import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService } from '../../application/state/notification.service';

@Component({
  selector: 'gl-notification-center',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './notification-center.component.html',
  styleUrl: './notification-center.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationCenterComponent {
  private readonly notifications = inject(NotificationService);
  readonly items$ = this.notifications.notifications$;
  dismiss(id: number): void { this.notifications.dismiss(id); }
}
