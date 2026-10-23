import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Tournament } from '../../domain/models/tournament.model';
import { TOURNAMENT_REPOSITORY } from '../tokens';

@Injectable({ providedIn: 'root' })
export class GetTournamentsUseCase {
  private readonly repository = inject(TOURNAMENT_REPOSITORY);
  execute(): Observable<readonly Tournament[]> { return this.repository.getTournaments(); }
}
