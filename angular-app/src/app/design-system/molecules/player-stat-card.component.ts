import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StatValueComponent } from '../atoms/stat-value.component';
import { PlayerStats } from '../../domain/models/player.model';

@Component({ selector: 'gl-player-stat-card', standalone: true, imports: [StatValueComponent], changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './player-stat-card.component.html',
  styleUrl: './player-stat-card.component.css' })
export class PlayerStatCardComponent { readonly stats=input.required<PlayerStats>(); }
