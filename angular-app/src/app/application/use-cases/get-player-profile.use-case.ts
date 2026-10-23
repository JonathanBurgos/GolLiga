import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Player } from '../../domain/models/player.model';
import { TOURNAMENT_REPOSITORY } from '../tokens';

@Injectable({ providedIn: 'root' })
export class GetPlayerProfileUseCase {
  private readonly repository = inject(TOURNAMENT_REPOSITORY);
  execute(playerId: string): Observable<Player | null> { return this.repository.getPlayer(playerId); }
}
