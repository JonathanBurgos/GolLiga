import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Tournament } from '../../domain/models/tournament.model';

@Component({ selector: 'gl-tournament-card', standalone: true, imports: [RouterLink], changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tournament-card.component.html',
  styleUrl: './tournament-card.component.css' })
export class TournamentCardComponent { readonly tournament = input.required<Tournament>(); }
