export interface MatchRecord {
  readonly id: string;
  readonly tournamentId: string;
  readonly homeTeamId: string;
  readonly awayTeamId: string;
  readonly homeTeam: { readonly id: string; readonly name: string };
  readonly awayTeam: { readonly id: string; readonly name: string };
  readonly round: number;
  readonly groupName: string;
  readonly scheduledAt: Date;
  readonly venue: string | null;
  readonly status: string;
  readonly homeScore: number;
  readonly awayScore: number;
  readonly events?: readonly MatchEventRecord[];
}

export interface MatchEventRecord {
  readonly id: string;
  readonly matchId: string;
  readonly teamId: string;
  readonly playerId: string;
  readonly player: { readonly id: string; readonly name: string; readonly jerseyNumber: number; readonly teamId: string };
  readonly relatedPlayerId: string | null;
  readonly relatedPlayer: { readonly id: string; readonly name: string; readonly jerseyNumber: number; readonly teamId: string } | null;
  readonly type: string;
  readonly minute: number;
  readonly details: string | null;
  readonly suspensionMatches: number | null;
  readonly suspensionFrom: Date | null;
  readonly suspensionTo: Date | null;
  readonly createdAt: Date;
}

export abstract class MatchRepository {
  abstract findByTournament(tournamentId: string): Promise<readonly MatchRecord[]>;
  abstract findById(id: string): Promise<MatchRecord | null>;
  abstract create(input: {
    tournamentId: string; homeTeamId: string; awayTeamId: string; round: number;
    groupName: string; scheduledAt: Date; venue?: string;
  }): Promise<MatchRecord>;
  abstract update(id: string, input: Partial<{
    homeTeamId: string; awayTeamId: string; round: number; groupName: string; scheduledAt: Date; venue: string | null;
  }>): Promise<MatchRecord>;
  abstract updateStatus(id: string, status: string): Promise<MatchRecord>;
  abstract remove(id: string): Promise<void>;
  abstract findEvents(matchId: string): Promise<readonly MatchEventRecord[]>;
  abstract createEvent(input: {
    matchId: string; teamId: string; playerId: string; relatedPlayerId?: string;
    type: string; minute: number; details?: string; suspensionMatches?: number;
    suspensionFrom?: Date; suspensionTo?: Date; createdById: string;
  }): Promise<MatchEventRecord>;
  abstract updateEvent(matchId: string, eventId: string, input: {
    teamId: string; playerId: string; relatedPlayerId?: string; type: string; minute: number; details?: string;
    suspensionMatches?: number; suspensionFrom?: Date; suspensionTo?: Date; createdById: string;
  }): Promise<MatchEventRecord>;
  abstract removeEvent(matchId: string, eventId: string): Promise<void>;
  abstract finishMatch(id: string): Promise<MatchRecord>;
  abstract listRedCardBans(tournamentId: string, playerId: string, excludeEventId?: string): Promise<readonly {
    readonly teamId: string; readonly playerId: string; readonly round: number; readonly dates: number;
  }[]>;
  abstract listTeamFixtures(tournamentId: string, teamId: string): Promise<readonly {
    readonly round: number; readonly isFinished: boolean;
  }[]>;
}
