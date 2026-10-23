import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Team } from '../../domain/models/team.model';
import { TOURNAMENT_REPOSITORY } from '../tokens';

@Injectable({ providedIn: 'root' })
export class GetTeamsUseCase {
  private readonly repository = inject(TOURNAMENT_REPOSITORY);
  execute(tournamentId: string): Observable<readonly Team[]> { return this.repository.getTeams(tournamentId); }
}
