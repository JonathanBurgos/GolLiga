import { ConflictError, NotFoundError } from '../../domain/common/domain-error.js';
import { PlayerRepository } from '../../domain/players/player.repository.js';
import { TeamRepository } from '../../domain/teams/team.repository.js';

export class PlayerService {
  constructor(private readonly players: PlayerRepository, private readonly teams: TeamRepository) {}

  async get(id: string) {
    const player = await this.players.findById(id);
    if (!player) throw new NotFoundError('El jugador');
    return player;
  }
  async list(teamId: string) {
    if (!(await this.teams.findById(teamId))) throw new NotFoundError('El equipo');
    return this.players.findByTeam(teamId);
  }
  async create(input: { teamId: string; name: string; jerseyNumber: number; position: string; dateOfBirth?: Date; avatarUrl?: string }) {
    const team = await this.teams.findById(input.teamId);
    if (!team) throw new NotFoundError('El equipo');
    if (team.status !== 'ACTIVE') throw new ConflictError('No se pueden registrar jugadores en un equipo inactivo.');
    if (!Number.isInteger(input.jerseyNumber) || input.jerseyNumber < 1 || input.jerseyNumber > 99) {
      throw new ConflictError('El dorsal debe ser un número entero entre 1 y 99.');
    }
    return this.players.create(input);
  }
  async update(id: string, input: Parameters<PlayerRepository['update']>[1]) {
    if (!(await this.players.findById(id))) throw new NotFoundError('El jugador');
    if (input.jerseyNumber !== undefined && (input.jerseyNumber < 1 || input.jerseyNumber > 99)) {
      throw new ConflictError('El dorsal debe estar entre 1 y 99.');
    }
    return this.players.update(id, input);
  }
  async remove(id: string) {
    if (!(await this.players.findById(id))) throw new NotFoundError('El jugador');
    await this.players.remove(id);
  }
}
