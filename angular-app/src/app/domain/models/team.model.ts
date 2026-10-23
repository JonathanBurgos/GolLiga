export interface Team {
  readonly id: string;
  readonly name: string;
  readonly group: string;
  readonly crest: string;
  readonly played: number | null;
  readonly points: number | null;
  readonly playerIds: readonly string[];
}
