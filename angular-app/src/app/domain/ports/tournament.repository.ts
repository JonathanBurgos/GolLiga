import { Observable } from 'rxjs';
import { Player } from '../models/player.model';
import { Team } from '../models/team.model';
import { Tournament } from '../models/tournament.model';

export interface TournamentRepository {
  getTournaments(): Observable<readonly Tournament[]>;
  getTournament(id: string): Observable<Tournament | null>;
  getTeams(tournamentId: string): Observable<readonly Team[]>;
  getTeam(teamId: string): Observable<Team | null>;
  getPlayersByTeam(teamId: string): Observable<readonly Player[]>;
  getPlayer(playerId: string): Observable<Player | null>;
}

