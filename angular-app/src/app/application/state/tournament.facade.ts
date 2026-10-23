import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, shareReplay } from 'rxjs';
import { GetTournamentsUseCase } from '../use-cases/get-tournaments.use-case';
import { GetTeamsUseCase } from '../use-cases/get-teams.use-case';
import { Tournament } from '../../domain/models/tournament.model';
import { Team } from '../../domain/models/team.model';

@Injectable({ providedIn: 'root' })
export class TournamentFacade {
  private readonly getTournaments = inject(GetTournamentsUseCase);
  private readonly getTeams = inject(GetTeamsUseCase);
  private readonly activeId = new BehaviorSubject<string | null>(null);

  readonly tournaments$ = this.getTournaments.execute().pipe(shareReplay({ bufferSize: 1, refCount: true }));
  readonly activeTournament$: Observable<Tournament | null> = combineLatest([this.activeId, this.tournaments$]).pipe(
    map(([id, tournaments]) => tournaments.find(item => item.id === id) ?? null),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  selectTournament(id: string): void { this.activeId.next(id); }
  teamsFor(tournamentId: string): Observable<readonly Team[]> { return this.getTeams.execute(tournamentId); }
}
