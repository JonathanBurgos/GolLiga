export interface TournamentRecord {
  readonly id: string;
  readonly name: string;
  readonly season: number;
  readonly competition: string;
  readonly status: string;
  readonly startDate: Date | null;
  readonly endDate: Date | null;
  readonly createdAt: Date;
}

export abstract class TournamentRepository {
  abstract findAll(): Promise<readonly TournamentRecord[]>;
  abstract findById(id: string): Promise<TournamentRecord | null>;
  abstract create(input: {
    name: string;
    season: number;
    competition: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<TournamentRecord>;
  abstract update(
    id: string,
    input: Partial<Pick<TournamentRecord, 'name' | 'season' | 'competition' | 'status' | 'startDate' | 'endDate'>>,
  ): Promise<TournamentRecord>;
  abstract remove(id: string): Promise<void>;
}
