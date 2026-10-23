import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({ selector: 'gl-status-badge', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.css' })
export class StatusBadgeComponent { readonly label = input.required<string>(); }
