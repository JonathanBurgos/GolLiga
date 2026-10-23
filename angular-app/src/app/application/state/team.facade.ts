import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TeamRoster, GetTeamRosterUseCase } from '../use-cases/get-team-roster.use-case';
import { GetTeamUseCase } from '../use-cases/get-team.use-case';
import { Team } from '../../domain/models/team.model';

@Injectable({ providedIn: 'root' })
export class TeamFacade {
  private readonly getRoster = inject(GetTeamRosterUseCase);
  private readonly getTeam = inject(GetTeamUseCase);
  rosterFor(teamId: string): Observable<TeamRoster> { return this.getRoster.execute(teamId); }
  team(teamId: string): Observable<Team|null> { return this.getTeam.execute(teamId); }
}
