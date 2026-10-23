import { inject, Injectable } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { Player } from '../../domain/models/player.model';
import { Team } from '../../domain/models/team.model';
import { TOURNAMENT_REPOSITORY } from '../tokens';

export interface TeamRoster { readonly team: Team | null; readonly players: readonly Player[]; }

@Injectable({ providedIn: 'root' })
export class GetTeamRosterUseCase {
  private readonly repository = inject(TOURNAMENT_REPOSITORY);
  execute(teamId: string): Observable<TeamRoster> {
    return combineLatest([this.repository.getTeam(teamId), this.repository.getPlayersByTeam(teamId)]).pipe(
      map(([team, players]) => ({ team, players }))
    );
  }
}
