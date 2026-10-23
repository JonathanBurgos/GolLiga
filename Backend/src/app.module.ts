import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AuthService } from './application/auth/auth.service.js';
import { InsightsService } from './application/insights/insights.service.js';
import { MatchService } from './application/matches/match.service.js';
import { PlayerService } from './application/players/player.service.js';
import { TeamService } from './application/teams/team.service.js';
import { TournamentService } from './application/tournaments/tournament.service.js';
import { MatchRepository } from './domain/matches/match.repository.js';
import { PlayerRepository } from './domain/players/player.repository.js';
import { TeamRepository } from './domain/teams/team.repository.js';
import { TournamentRepository } from './domain/tournaments/tournament.repository.js';
import { UserRepository } from './domain/users/user.repository.js';
import { UserManagementService } from './application/auth/user-management.service.js';
import { PersistenceModule } from './infrastructure/persistence/persistence.module.js';
import { AuthController } from './presentation/http/auth/auth.controller.js';
import { JwtAuthGuard } from './presentation/http/auth/jwt-auth.guard.js';
import { RolesGuard } from './presentation/http/auth/roles.guard.js';
import { HealthController } from './presentation/http/health/health.controller.js';
import { InsightsController } from './presentation/http/insights/insights.controller.js';
import { MatchSheetsController, MatchesController } from './presentation/http/matches/matches.controller.js';
import { PlayersController } from './presentation/http/players/players.controller.js';
import { TeamsController } from './presentation/http/teams/teams.controller.js';
import { TournamentsController } from './presentation/http/tournaments/tournaments.controller.js';
import { UsersController } from './presentation/http/users/users.controller.js';
import { AllExceptionsFilter } from './presentation/http/filters/all-exceptions.filter.js';
import { TeamCrestStorageService } from './infrastructure/storage/team-crest-storage.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        redact: {
          paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
          censor: '[REDACTED]',
        },
      },
    }),
    JwtModule.registerAsync({ global: true, inject: [ConfigService], useFactory: (config: ConfigService) => ({
      secret: config.getOrThrow<string>('JWT_SECRET'),
      signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN', '15m') as `${number}${'s' | 'm' | 'h' | 'd'}` },
    }) }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PersistenceModule,
  ],
  controllers: [AuthController, HealthController, TournamentsController, TeamsController, PlayersController, MatchesController, MatchSheetsController, InsightsController, UsersController],
  providers: [
    { provide: TournamentService, useFactory: (repo: TournamentRepository) => new TournamentService(repo), inject: [TournamentRepository] },
    { provide: TeamService, useFactory: (teams: TeamRepository, tournaments: TournamentRepository) => new TeamService(teams, tournaments), inject: [TeamRepository, TournamentRepository] },
    { provide: PlayerService, useFactory: (players: PlayerRepository, teams: TeamRepository) => new PlayerService(players, teams), inject: [PlayerRepository, TeamRepository] },
    { provide: MatchService, useFactory: (matches: MatchRepository, teams: TeamRepository, players: PlayerRepository, tournaments: TournamentRepository) => new MatchService(matches, teams, players, tournaments), inject: [MatchRepository, TeamRepository, PlayerRepository, TournamentRepository] },
    { provide: InsightsService, useFactory: (matches: MatchRepository, tournaments: TournamentRepository, players: PlayerRepository, teams: TeamRepository) => new InsightsService(matches, tournaments, players, teams), inject: [MatchRepository, TournamentRepository, PlayerRepository, TeamRepository] },
    { provide: AuthService, useFactory: (users: UserRepository, jwt: JwtService, config: ConfigService) => new AuthService(users, jwt, config), inject: [UserRepository, JwtService, ConfigService] },
    { provide: UserManagementService, useFactory: (users: UserRepository) => new UserManagementService(users), inject: [UserRepository] },
    JwtAuthGuard, RolesGuard, { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard }, { provide: APP_GUARD, useClass: RolesGuard },
    TeamCrestStorageService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
