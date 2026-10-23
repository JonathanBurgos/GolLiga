export interface PlayerStats {
  readonly goals: number;
  readonly assists: number;
  readonly yellowCards: number;
  readonly redCards: number;
}

export interface Player {
  readonly id: string;
  readonly name: string;
  readonly teamId: string;
  readonly position: string;
  readonly jerseyNumber: number;
  readonly avatar: string;
  readonly stats: PlayerStats;
}
