import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { TournamentRepository } from '../../domain/ports/tournament.repository';
import { Player } from '../../domain/models/player.model';
import { Team } from '../../domain/models/team.model';
import { Tournament } from '../../domain/models/tournament.model';
import { environment } from '../../../environments/environment';

interface ApiTournament { id: string; name: string; season: number; competition: string; status: string; }
interface ApiTeam { id: string; name: string; groupName: string; crestUrl?: string | null; players?: { id: string }[]; }
interface ApiPlayer { id: string; teamId: string; name: string; jerseyNumber: number; position: string; avatarUrl?: string | null; }
interface ApiPlayerProfile { stats: { goals: number; assists: number; yellowCards: number; redCards: number; }; }

@Injectable({ providedIn: 'root' })
export class ApiTournamentRepository implements TournamentRepository {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  getTournaments(): Observable<readonly Tournament[]> {
    return this.http.get<ApiTournament[]>(`${this.base}/tournaments`).pipe(switchMap(items => items.length
      ? forkJoin(items.map(item => this.tournamentWithTeamCount(item)))
      : of([] as Tournament[])));
  }
  getTournament(id: string): Observable<Tournament | null> {
    return this.http.get<ApiTournament>(`${this.base}/tournaments/${id}`).pipe(switchMap(item => this.tournamentWithTeamCount(item)));
  }
  getTeams(tournamentId: string): Observable<readonly Team[]> {
    return this.http.get<ApiTeam[]>(`${this.base}/tournaments/${tournamentId}/teams`).pipe(map(items => items.map(item => ({
      id: item.id, name: item.name, group: item.groupName, crest: item.crestUrl || 'assets/asset-05.svg',
      played: null, points: null, playerIds: (item.players ?? []).map(player => player.id)
    }))));
  }
  getTeam(teamId: string): Observable<Team | null> {
    return this.http.get<ApiTeam>(`${this.base}/teams/${teamId}`).pipe(map(item => ({
      id: item.id, name: item.name, group: item.groupName, crest: item.crestUrl || 'assets/asset-05.svg',
      played: null, points: null, playerIds: (item.players ?? []).map(player => player.id)
    })));
  }
  getPlayersByTeam(teamId: string): Observable<readonly Player[]> {
    return this.http.get<ApiPlayer[]>(`${this.base}/teams/${teamId}/players`).pipe(switchMap(players => players.length
      ? forkJoin(players.map(player => this.playerWithStats(player)))
      : of([] as Player[])));
  }
  getPlayer(playerId: string): Observable<Player | null> {
    return this.http.get<ApiPlayer>(`${this.base}/players/${playerId}`).pipe(switchMap(player => this.playerWithStats(player)));
  }
  private playerWithStats(player: ApiPlayer): Observable<Player> {
    return this.http.get<ApiPlayerProfile>(`${this.base}/players/${player.id}/stats`).pipe(map(profile => ({
      id: player.id, name: player.name, teamId: player.teamId, position: player.position,
      jerseyNumber: player.jerseyNumber, avatar: player.avatarUrl || 'assets/asset-17.svg', stats: profile.stats
    })));
  }
  private tournamentWithTeamCount(item: ApiTournament): Observable<Tournament> {
    return this.http.get<ApiTeam[]>(`${this.base}/tournaments/${item.id}/teams`).pipe(map(teams => ({
      id: item.id, name: item.name, competition: item.competition,
      status: item.status === 'ACTIVE' ? 'En curso' : item.status === 'UPCOMING' ? 'Próximamente' : 'Datos pendientes',
      teamCount: teams.length, season: item.season, summary: item.competition
    })));
  }
}
