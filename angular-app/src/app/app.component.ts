import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmationDialogComponent } from './design-system/organisms/confirmation-dialog.component';
import { NotificationCenterComponent } from './design-system/organisms/notification-center.component';

@Component({
  selector: 'gl-root',
  standalone: true,
  imports: [RouterOutlet, ConfirmationDialogComponent, NotificationCenterComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {}
