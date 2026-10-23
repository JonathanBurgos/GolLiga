import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { ConfirmationDialogService } from '../../application/state/confirmation-dialog.service';

@Component({
  selector: 'gl-confirmation-dialog',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationDialogComponent {
  private readonly confirmations = inject(ConfirmationDialogService);
  readonly request$ = this.confirmations.request$;

  @HostListener('document:keydown.escape')
  cancelOnEscape(): void { this.confirmations.close(false); }

  close(confirmed: boolean): void { this.confirmations.close(confirmed); }
}
