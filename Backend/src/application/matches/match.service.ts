import { ConflictError, NotFoundError } from '../../domain/common/domain-error.js';
import { MatchRepository } from '../../domain/matches/match.repository.js';
import { SuspensionPolicy } from '../../domain/matches/suspension.policy.js';
import { PlayerRepository } from '../../domain/players/player.repository.js';
import { TeamRepository } from '../../domain/teams/team.repository.js';
import { TournamentRepository } from '../../domain/tournaments/tournament.repository.js';

const suspensionPolicy = new SuspensionPolicy();

export class MatchService {
  constructor(
    private readonly matches: MatchRepository,
    private readonly teams: TeamRepository,
    private readonly players: PlayerRepository,
    private readonly tournaments: TournamentRepository,
  ) {}

  async list(tournamentId: string) {
    if (!(await this.tournaments.findById(tournamentId))) throw new NotFoundError('El torneo');
    return this.matches.findByTournament(tournamentId);
  }
  get(id: string) { return this.requireMatch(id); }
  async create(input: { tournamentId: string; homeTeamId: string; awayTeamId: string; round: number; groupName: string; scheduledAt: Date; venue?: string }) {
    if (!(await this.tournaments.findById(input.tournamentId))) throw new NotFoundError('El torneo');
    await this.validateFixture(input.tournamentId, input.homeTeamId, input.awayTeamId, input.round);
    return this.matches.create(input);
  }
  async update(matchId: string, input: Partial<{ homeTeamId: string; awayTeamId: string; round: number; groupName: string; scheduledAt: Date; venue: string | null }>) {
    const current = await this.requireMatch(matchId);
    if (current.status === 'FINISHED') throw new ConflictError('No puedes editar un partido finalizado.');
    const next = { ...current, ...input };
    await this.validateFixture(current.tournamentId, next.homeTeamId, next.awayTeamId, next.round, matchId);
    return this.matches.update(matchId, input);
  }
  async events(matchId: string) {
    await this.requireMatch(matchId);
    return this.matches.findEvents(matchId);
  }
  async addEvent(matchId: string, input: {
    teamId: string; playerId: string; relatedPlayerId?: string; type: string; minute: number;
    details?: string; suspensionMatches?: number; suspensionFrom?: Date; suspensionTo?: Date; createdById: string;
  }) {
    const match = await this.requireMatch(matchId);
    await this.validateEvent(match, input);
    return this.matches.createEvent({ matchId, ...input });
  }
  async updateEvent(matchId: string, eventId: string, input: {
    teamId: string; playerId: string; relatedPlayerId?: string; type: string; minute: number;
    details?: string; suspensionMatches?: number; suspensionFrom?: Date; suspensionTo?: Date; createdById: string;
  }) {
    const match = await this.requireMatch(matchId);
    if (match.status === 'FINISHED') throw new ConflictError('No puedes editar una planilla finalizada.');
    if (!(await this.matches.findEvents(matchId)).some((event) => event.id === eventId)) throw new NotFoundError('El acontecimiento');
    await this.validateEvent(match, input, eventId);
    return this.matches.updateEvent(matchId, eventId, input);
  }
  private async validateEvent(match: NonNullable<Awaited<ReturnType<MatchRepository['findById']>>>, input: {
    teamId: string; playerId: string; relatedPlayerId?: string; type: string; minute: number;
    suspensionMatches?: number; suspensionFrom?: Date; suspensionTo?: Date;
  }, excludeEventId?: string) {
    if (match.status === 'FINISHED' || match.status === 'CANCELLED') throw new ConflictError('La planilla está cerrada.');
    if (![match.homeTeamId, match.awayTeamId].includes(input.teamId)) throw new ConflictError('El equipo no participa en este partido.');
    if (!Number.isInteger(input.minute) || input.minute < 0 || input.minute > 150) throw new ConflictError('El minuto debe estar entre 0 y 150.');
    const [player, relatedPlayer] = await Promise.all([
      this.players.findById(input.playerId),
      input.relatedPlayerId ? this.players.findById(input.relatedPlayerId) : Promise.resolve(null),
    ]);
    if (!player || player.teamId !== input.teamId || player.status !== 'ACTIVE') throw new ConflictError('El jugador no pertenece a la plantilla activa del equipo.');
    if (input.relatedPlayerId && (!relatedPlayer || relatedPlayer.teamId !== input.teamId || relatedPlayer.status !== 'ACTIVE')) {
      throw new ConflictError('El jugador relacionado debe estar activo en la plantilla del mismo equipo.');
    }
    if (input.type === 'RED_CARD') {
      suspensionPolicy.assertRedCardHasSuspension(input.suspensionMatches);
    }
    if (input.type === 'SANCTION' && (!input.suspensionFrom || !input.suspensionTo || input.suspensionTo < input.suspensionFrom)) {
      throw new ConflictError('La sanción manual requiere un rango de fechas válido.');
    }
    const [bans, fixtures] = await Promise.all([
      this.matches.listRedCardBans(match.tournamentId, player.id, excludeEventId),
      this.matches.listTeamFixtures(match.tournamentId, player.teamId),
    ]);
    if (suspensionPolicy.isSuspended(match.round, bans, player.id, player.teamId, fixtures)) {
      throw new ConflictError(`El jugador #${player.jerseyNumber} tiene una suspensión pendiente.`);
    }
  }
  async removeEvent(matchId: string, eventId: string) {
    const match = await this.requireMatch(matchId);
    if (match.status === 'FINISHED') throw new ConflictError('No puedes cambiar una planilla finalizada.');
    await this.matches.removeEvent(matchId, eventId);
  }
  async finish(matchId: string) {
    const match = await this.requireMatch(matchId);
    if (match.status === 'FINISHED') throw new ConflictError('El partido ya está finalizado.');
    return this.matches.finishMatch(matchId);
  }
  async remove(matchId: string) {
    const match = await this.requireMatch(matchId);
    if (match.status === 'FINISHED') throw new ConflictError('No puedes eliminar un partido finalizado.');
    await this.matches.remove(matchId);
  }
  async reopen(matchId: string) {
    const match = await this.requireMatch(matchId);
    if (match.status !== 'FINISHED') throw new ConflictError('Solo se puede reabrir una planilla finalizada.');
    return this.matches.updateStatus(matchId, 'IN_PROGRESS');
  }
  private async requireMatch(id: string) {
    const match = await this.matches.findById(id);
    if (!match) throw new NotFoundError('El partido');
    return match;
  }
  private async validateFixture(tournamentId: string, homeTeamId: string, awayTeamId: string, round: number, excludeMatchId?: string) {
    if (homeTeamId === awayTeamId) throw new ConflictError('Un equipo no puede jugar contra sí mismo.');
    const [home, away] = await Promise.all([this.teams.findById(homeTeamId), this.teams.findById(awayTeamId)]);
    if (!home || !away) throw new NotFoundError('Uno de los equipos');
    if (home.tournamentId !== tournamentId || away.tournamentId !== tournamentId) throw new ConflictError('Los dos equipos deben pertenecer al torneo seleccionado.');
    if (!Number.isInteger(round) || round < 1) throw new ConflictError('La jornada debe ser un entero positivo.');
    const fixtures = await this.matches.findByTournament(tournamentId);
    if (fixtures.some((fixture) => fixture.id !== excludeMatchId && fixture.round === round && [fixture.homeTeamId, fixture.awayTeamId].some((id) => [homeTeamId, awayTeamId].includes(id)))) {
      throw new ConflictError('Un equipo ya tiene un partido programado en esa jornada.');
    }
  }
}
