export interface TeamRecord {
  readonly id: string;
  readonly tournamentId: string;
  readonly name: string;
  readonly shortName: string;
  readonly groupName: string;
  readonly crestUrl: string | null;
  readonly status: string;
  readonly primaryColor: string;
  readonly secondaryColor: string;
  readonly enrollmentStatus: string;
  readonly delegateName: string | null;
  readonly delegatePhone: string | null;
  readonly delegateEmail: string | null;
  readonly registeredAt: Date;
  readonly players?: readonly unknown[];
}

export abstract class TeamRepository {
  abstract findByTournament(tournamentId: string): Promise<readonly TeamRecord[]>;
  abstract findById(id: string): Promise<TeamRecord | null>;
  abstract create(input: {
    tournamentId: string;
    name: string;
    shortName: string;
    groupName: string;
    crestUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    enrollmentStatus?: string;
    delegateName?: string;
    delegatePhone?: string;
    delegateEmail?: string;
    registeredAt?: Date;
  }): Promise<TeamRecord>;
  abstract update(
    id: string,
    input: Partial<Pick<TeamRecord, 'name' | 'shortName' | 'groupName' | 'crestUrl' | 'status' | 'primaryColor' | 'secondaryColor' | 'enrollmentStatus' | 'delegateName' | 'delegatePhone' | 'delegateEmail' | 'registeredAt'>>,
  ): Promise<TeamRecord>;
  abstract remove(id: string): Promise<void>;
}
