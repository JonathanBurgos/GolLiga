import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Player } from '../../domain/models/player.model';
import { GetPlayerProfileUseCase } from '../use-cases/get-player-profile.use-case';

@Injectable({ providedIn: 'root' })
export class PlayerFacade {
  private readonly getProfile = inject(GetPlayerProfileUseCase);
  profileFor(playerId: string): Observable<Player | null> { return this.getProfile.execute(playerId); }
}
