import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({ selector: 'gl-stat-value', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stat-value.component.html',
  styleUrl: './stat-value.component.css' })
export class StatValueComponent { readonly label=input.required<string>(); readonly value=input.required<number>(); readonly caption=input<string>('En el torneo'); }
