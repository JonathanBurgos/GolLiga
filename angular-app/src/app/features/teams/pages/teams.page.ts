import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { TournamentFacade } from '../../../application/state/tournament.facade';
import { TeamCardComponent } from '../../../design-system/organisms/team-card.component';

@Component({selector:'gl-teams-page',standalone:true,imports:[AsyncPipe,TeamCardComponent],changeDetection:ChangeDetectionStrategy.OnPush,
 templateUrl: './teams.page.html',
 styleUrl: './teams.page.css' })
export class TeamsPage { private readonly facade=inject(TournamentFacade); readonly teams$=this.facade.activeTournament$.pipe(switchMap(t=>t?this.facade.teamsFor(t.id):of([]))); }
