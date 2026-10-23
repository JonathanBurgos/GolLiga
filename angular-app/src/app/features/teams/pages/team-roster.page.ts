import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { TeamFacade } from '../../../application/state/team.facade';

@Component({selector:'gl-team-roster-page',standalone:true,imports:[AsyncPipe,RouterLink],changeDetection:ChangeDetectionStrategy.OnPush,
 templateUrl: './team-roster.page.html',
 styleUrl: './team-roster.page.css' })
export class TeamRosterPage {
  private readonly route=inject(ActivatedRoute);
  private readonly facade=inject(TeamFacade);
  readonly tournamentId=this.route.parent?.snapshot.paramMap.get('tournamentId') ?? '';
  readonly roster$=this.route.paramMap.pipe(map(params=>params.get('teamId') ?? ''),switchMap(id=>this.facade.rosterFor(id)));
}
