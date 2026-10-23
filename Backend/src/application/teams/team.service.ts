import { ConflictError, NotFoundError } from '../../domain/common/domain-error.js';
import { TeamRepository } from '../../domain/teams/team.repository.js';
import { TournamentRepository } from '../../domain/tournaments/tournament.repository.js';

export class TeamService {
  constructor(private readonly teams: TeamRepository, private readonly tournaments: TournamentRepository) {}

  async get(id: string) {
    const team = await this.teams.findById(id);
    if (!team) throw new NotFoundError('El equipo');
    return team;
  }
  async list(tournamentId: string) {
    if (!(await this.tournaments.findById(tournamentId))) throw new NotFoundError('El torneo');
    return this.teams.findByTournament(tournamentId);
  }
  async create(input: { tournamentId: string; name: string; shortName: string; groupName: string; crestUrl?: string; primaryColor?: string; secondaryColor?: string; enrollmentStatus?: string; delegateName?: string; delegatePhone?: string; delegateEmail?: string; registeredAt?: Date }) {
    if (!(await this.tournaments.findById(input.tournamentId))) throw new NotFoundError('El torneo');
    return this.teams.create(input);
  }
  async update(id: string, input: Parameters<TeamRepository['update']>[1]) {
    if (!(await this.teams.findById(id))) throw new NotFoundError('El equipo');
    return this.teams.update(id, input);
  }
  async remove(id: string) {
    const team = await this.teams.findById(id);
    if (!team) throw new NotFoundError('El equipo');
    if (team.players?.length) throw new ConflictError('No puedes eliminar un equipo que tiene jugadores registrados.');
    await this.teams.remove(id);
  }
}
