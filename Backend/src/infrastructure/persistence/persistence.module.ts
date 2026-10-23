import { Global, Module } from '@nestjs/common';
import { PlayerRepository } from '../../domain/players/player.repository.js';
import { TeamRepository } from '../../domain/teams/team.repository.js';
import { TournamentRepository } from '../../domain/tournaments/tournament.repository.js';
import { MatchRepository } from '../../domain/matches/match.repository.js';
import { UserRepository } from '../../domain/users/user.repository.js';
import { PrismaPlayerRepository, PrismaMatchRepository, PrismaTeamRepository, PrismaTournamentRepository, PrismaUserRepository } from './prisma.repository.js';
import { PrismaService } from './prisma.service.js';

@Global()
@Module({
  providers: [
    PrismaService, PrismaTournamentRepository, PrismaTeamRepository, PrismaPlayerRepository, PrismaMatchRepository, PrismaUserRepository,
    { provide: TournamentRepository, useExisting: PrismaTournamentRepository },
    { provide: TeamRepository, useExisting: PrismaTeamRepository },
    { provide: PlayerRepository, useExisting: PrismaPlayerRepository },
    { provide: MatchRepository, useExisting: PrismaMatchRepository },
    { provide: UserRepository, useExisting: PrismaUserRepository },
  ],
  exports: [PrismaService, TournamentRepository, TeamRepository, PlayerRepository, MatchRepository, UserRepository],
})
export class PersistenceModule {}
