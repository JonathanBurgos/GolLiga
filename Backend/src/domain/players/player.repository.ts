export interface PlayerRecord {
  readonly id: string;
  readonly teamId: string;
  readonly name: string;
  readonly jerseyNumber: number;
  readonly position: string;
  readonly dateOfBirth: Date | null;
  readonly avatarUrl: string | null;
  readonly status: string;
}

export abstract class PlayerRepository {
  abstract findByTeam(teamId: string): Promise<readonly PlayerRecord[]>;
  abstract findById(id: string): Promise<PlayerRecord | null>;
  abstract create(input: {
    teamId: string;
    name: string;
    jerseyNumber: number;
    position: string;
    dateOfBirth?: Date;
    avatarUrl?: string;
  }): Promise<PlayerRecord>;
  abstract update(
    id: string,
    input: Partial<Pick<PlayerRecord, 'name' | 'jerseyNumber' | 'position' | 'dateOfBirth' | 'avatarUrl' | 'status'>>,
  ): Promise<PlayerRecord>;
  abstract remove(id: string): Promise<void>;
}
