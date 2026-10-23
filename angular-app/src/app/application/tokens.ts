import { InjectionToken } from '@angular/core';
import { TournamentRepository } from '../domain/ports/tournament.repository';

export const TOURNAMENT_REPOSITORY = new InjectionToken<TournamentRepository>('TOURNAMENT_REPOSITORY');
