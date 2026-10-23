import { ConflictError } from '../common/domain-error.js';

export interface RedCardBan {
  readonly playerId: string;
  readonly teamId: string;
  readonly round: number;
  readonly dates: number;
}

export interface TeamMatchDate {
  readonly round: number;
  readonly isFinished: boolean;
}

/** Suspension dates are subsequent fixtures of the sanctioned player's team. */
export class SuspensionPolicy {
  isSuspended(
    targetRound: number,
    bans: readonly RedCardBan[],
    playerId: string,
    teamId: string,
    teamFixtures: readonly TeamMatchDate[],
  ): boolean {
    return bans.some((ban) => {
      if (ban.playerId !== playerId || ban.teamId !== teamId) return false;
      if (targetRound <= ban.round) return false;
      const served = teamFixtures.filter(
        (fixture) =>
          fixture.isFinished &&
          fixture.round > ban.round &&
          fixture.round < targetRound,
      ).length;
      return served < ban.dates;
    });
  }

  assertRedCardHasSuspension(dates: number | undefined): void {
    if (!Number.isInteger(dates) || !dates || dates < 1 || dates > 20) {
      throw new ConflictError('La tarjeta roja requiere una sanción de 1 a 20 fechas.');
    }
  }
}
