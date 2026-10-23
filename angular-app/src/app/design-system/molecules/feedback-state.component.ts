import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type FeedbackStateType = 'empty' | 'error' | 'success';

@Component({
  selector: 'gl-feedback-state',
  standalone: true,
  templateUrl: './feedback-state.component.html',
  styleUrl: './feedback-state.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackStateComponent {
  readonly mode = input<FeedbackStateType>('empty');
  readonly title = input.required<string>();
  readonly message = input.required<string>();
}
