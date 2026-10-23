import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Team } from '../../domain/models/team.model';

@Component({selector:'gl-team-card',standalone:true,imports:[RouterLink],changeDetection:ChangeDetectionStrategy.OnPush,
 templateUrl: './team-card.component.html',
 styleUrl: './team-card.component.css' })
export class TeamCardComponent { readonly team=input.required<Team>(); }
