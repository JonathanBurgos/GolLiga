import { ConflictError, NotFoundError } from '../../domain/common/domain-error.js';
import { TournamentRepository } from '../../domain/tournaments/tournament.repository.js';

export class TournamentService {
  constructor(private readonly tournaments: TournamentRepository) {}

  list() { return this.tournaments.findAll(); }
  async get(id: string) {
    const item = await this.tournaments.findById(id);
    if (!item) throw new NotFoundError('El torneo');
    return item;
  }
  create(input: { name: string; season: number; competition: string; startDate?: Date; endDate?: Date }) {
    if (input.endDate && input.startDate && input.endDate < input.startDate) {
      throw new ConflictError('La fecha final debe ser posterior a la fecha inicial.');
    }
    return this.tournaments.create(input);
  }
  async update(id: string, input: Parameters<TournamentRepository['update']>[1]) {
    await this.get(id);
    return this.tournaments.update(id, input);
  }
  async remove(id: string) {
    await this.get(id);
    await this.tournaments.remove(id);
  }
}
