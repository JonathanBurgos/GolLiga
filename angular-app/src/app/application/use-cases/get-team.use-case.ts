import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Team } from '../../domain/models/team.model';
import { TOURNAMENT_REPOSITORY } from '../tokens';

@Injectable({ providedIn: 'root' })
export class GetTeamUseCase {
  private readonly repository=inject(TOURNAMENT_REPOSITORY);
  execute(teamId:string):Observable<Team|null>{return this.repository.getTeam(teamId);}
}
