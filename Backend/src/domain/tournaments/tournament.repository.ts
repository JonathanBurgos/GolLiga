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

export interface TournamentRulesRecord {
  readonly id: string;
  readonly tournamentId: string;
  readonly victoryPoints: number;
  readonly drawPoints: number;
  readonly defeatPoints: number;
  readonly tieBreakCriteria: string[];
  readonly competitionFormat: string;
  readonly groupCount: number;
  readonly qualifiersPerGroup: number;
  readonly yellowCardsForSuspension: number;
  readonly directRedSuspensionMatches: number;
  readonly secondYellowSuspensionMatches: number;
  readonly resetCardsAtPlayoffs: boolean;
  readonly yellowCardPoints: number;
  readonly secondYellowPoints: number;
  readonly directRedPoints: number;
  readonly otherSanctions: string;
  readonly timeZone: string;
  readonly currency: string;
  readonly registrationFee: number;
  readonly organizationContact: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type TournamentRulesInput = Omit<TournamentRulesRecord, 'id' | 'tournamentId' | 'createdAt' | 'updatedAt'>;

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
  abstract getOrCreateRules(tournamentId: string): Promise<TournamentRulesRecord>;
  abstract updateRules(tournamentId: string, input: TournamentRulesInput): Promise<TournamentRulesRecord>;
  abstract remove(id: string): Promise<void>;
}
