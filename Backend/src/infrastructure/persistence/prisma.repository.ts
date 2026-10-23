import { Injectable } from '@nestjs/common';
import { ConflictError } from '../../domain/common/domain-error.js';
import { Role } from '../../domain/common/roles.js';
import { MatchRepository } from '../../domain/matches/match.repository.js';
import { PlayerRepository } from '../../domain/players/player.repository.js';
import { TeamRepository } from '../../domain/teams/team.repository.js';
import { TournamentRepository } from '../../domain/tournaments/tournament.repository.js';
import { UserRepository } from '../../domain/users/user.repository.js';
import { PrismaService } from './prisma.service.js';

@Injectable()
export class PrismaTournamentRepository implements TournamentRepository {
  constructor(private readonly prisma: PrismaService) {}
  findAll() { return this.prisma.tournament.findMany({ orderBy: [{ season: 'desc' }, { name: 'asc' }] }); }
  findById(id: string) { return this.prisma.tournament.findUnique({ where: { id } }); }
  create(input: { name: string; season: number; competition: string; startDate?: Date; endDate?: Date }) { return this.prisma.tournament.create({ data: input }); }
  update(id: string, input: { name?: string; season?: number; competition?: string; status?: string; startDate?: Date | null; endDate?: Date | null }) {
    return this.prisma.tournament.update({ where: { id }, data: { ...input, status: input.status as never } });
  }
  async remove(id: string) { await this.prisma.tournament.delete({ where: { id } }); }
}

@Injectable()
export class PrismaTeamRepository implements TeamRepository {
  constructor(private readonly prisma: PrismaService) {}
  findByTournament(tournamentId: string) { return this.prisma.team.findMany({ where: { tournamentId }, include: { players: true }, orderBy: [{ groupName: 'asc' }, { name: 'asc' }] }); }
  findById(id: string) { return this.prisma.team.findUnique({ where: { id }, include: { players: true } }); }
  create(input: { tournamentId: string; name: string; shortName: string; groupName: string; crestUrl?: string; primaryColor?: string; secondaryColor?: string; enrollmentStatus?: string; delegateName?: string; delegatePhone?: string; delegateEmail?: string; registeredAt?: Date }) { return this.prisma.team.create({ data: { ...input, enrollmentStatus: input.enrollmentStatus as never } }); }
  update(id: string, input: { name?: string; shortName?: string; groupName?: string; crestUrl?: string | null; status?: string; primaryColor?: string; secondaryColor?: string; enrollmentStatus?: string; delegateName?: string | null; delegatePhone?: string | null; delegateEmail?: string | null; registeredAt?: Date }) {
    return this.prisma.team.update({ where: { id }, data: { ...input, status: input.status as never, enrollmentStatus: input.enrollmentStatus as never } });
  }
  async remove(id: string) { await this.prisma.team.delete({ where: { id } }); }
}

@Injectable()
export class PrismaPlayerRepository implements PlayerRepository {
  constructor(private readonly prisma: PrismaService) {}
  findByTeam(teamId: string) { return this.prisma.player.findMany({ where: { teamId }, orderBy: { jerseyNumber: 'asc' } }); }
  findById(id: string) { return this.prisma.player.findUnique({ where: { id } }); }
  create(input: { teamId: string; name: string; jerseyNumber: number; position: string; dateOfBirth?: Date; avatarUrl?: string }) { return this.prisma.player.create({ data: input }); }
  update(id: string, input: { name?: string; jerseyNumber?: number; position?: string; dateOfBirth?: Date | null; avatarUrl?: string | null; status?: string }) {
    return this.prisma.player.update({ where: { id }, data: { ...input, status: input.status as never } });
  }
  async remove(id: string) { await this.prisma.player.delete({ where: { id } }); }
}

@Injectable()
export class PrismaMatchRepository implements MatchRepository {
  constructor(private readonly prisma: PrismaService) {}
  findByTournament(tournamentId: string) {
    return this.prisma.match.findMany({ where: { tournamentId }, include: { homeTeam: { select: { id: true, name: true } }, awayTeam: { select: { id: true, name: true } } }, orderBy: [{ round: 'asc' }, { scheduledAt: 'asc' }] });
  }
  findById(id: string) { return this.prisma.match.findUnique({ where: { id }, include: { homeTeam: { select: { id: true, name: true } }, awayTeam: { select: { id: true, name: true } } } }); }
  create(input: { tournamentId: string; homeTeamId: string; awayTeamId: string; round: number; groupName: string; scheduledAt: Date; venue?: string }) {
    return this.prisma.match.create({ data: input, include: { homeTeam: { select: { id: true, name: true } }, awayTeam: { select: { id: true, name: true } } } });
  }
  update(id: string, input: { homeTeamId?: string; awayTeamId?: string; round?: number; groupName?: string; scheduledAt?: Date; venue?: string | null }) {
    return this.prisma.match.update({ where: { id }, data: input, include: { homeTeam: { select: { id: true, name: true } }, awayTeam: { select: { id: true, name: true } } } });
  }
  updateStatus(id: string, status: string) { return this.prisma.match.update({ where: { id }, data: { status: status as never }, include: { homeTeam: { select: { id: true, name: true } }, awayTeam: { select: { id: true, name: true } } } }); }
  async remove(id: string) { await this.prisma.match.delete({ where: { id } }); }
  findEvents(matchId: string) {
    return this.prisma.matchEvent.findMany({ where: { matchId }, include: { player: { select: { id: true, name: true, jerseyNumber: true, teamId: true } }, relatedPlayer: { select: { id: true, name: true, jerseyNumber: true, teamId: true } } }, orderBy: [{ minute: 'asc' }, { createdAt: 'asc' }] });
  }
  createEvent(input: { matchId: string; teamId: string; playerId: string; relatedPlayerId?: string; type: string; minute: number; details?: string; suspensionMatches?: number; suspensionFrom?: Date; suspensionTo?: Date; createdById: string }) {
    return this.prisma.$transaction(async (tx) => {
      const match = await tx.match.findUniqueOrThrow({ where: { id: input.matchId }, select: { status: true } });
      if (match.status === 'FINISHED' || match.status === 'CANCELLED') throw new ConflictError('La planilla está cerrada.');
      return tx.matchEvent.create({ data: { ...input, type: input.type as never }, include: { player: { select: { id: true, name: true, jerseyNumber: true, teamId: true } }, relatedPlayer: { select: { id: true, name: true, jerseyNumber: true, teamId: true } } } });
    }, { isolationLevel: 'Serializable' });
  }
  updateEvent(matchId: string, eventId: string, input: { teamId: string; playerId: string; relatedPlayerId?: string; type: string; minute: number; details?: string; suspensionMatches?: number; suspensionFrom?: Date; suspensionTo?: Date; createdById: string }) {
    const { createdById: _actor, ...changes } = input;
    return this.prisma.matchEvent.update({ where: { id: eventId, matchId }, data: { ...changes, type: input.type as never }, include: { player: { select: { id: true, name: true, jerseyNumber: true, teamId: true } }, relatedPlayer: { select: { id: true, name: true, jerseyNumber: true, teamId: true } } } });
  }
  async removeEvent(matchId: string, eventId: string) { await this.prisma.matchEvent.delete({ where: { id: eventId, matchId } }); }
  async finishMatch(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const match = await tx.match.findUniqueOrThrow({ where: { id } });
      if (match.status === 'FINISHED' || match.status === 'CANCELLED') throw new ConflictError('El partido ya no se puede finalizar.');
      const events = await tx.matchEvent.findMany({ where: { matchId: id, type: 'GOAL' }, select: { teamId: true } });
      const homeScore = events.filter((event) => event.teamId === match.homeTeamId).length;
      const awayScore = events.filter((event) => event.teamId === match.awayTeamId).length;
      return tx.match.update({ where: { id }, data: { status: 'FINISHED', homeScore, awayScore, version: { increment: 1 } }, include: { homeTeam: { select: { id: true, name: true } }, awayTeam: { select: { id: true, name: true } } } });
    }, { isolationLevel: 'Serializable' });
  }
  async listRedCardBans(tournamentId: string, playerId: string, excludeEventId?: string) {
    const cards = await this.prisma.matchEvent.findMany({ where: { playerId, ...(excludeEventId ? { id: { not: excludeEventId } } : {}), type: 'RED_CARD', match: { tournamentId, status: 'FINISHED' } }, select: { teamId: true, playerId: true, suspensionMatches: true, match: { select: { round: true } } } });
    return cards.map((card) => ({ teamId: card.teamId, playerId: card.playerId, round: card.match.round, dates: card.suspensionMatches ?? 0 }));
  }
  async listTeamFixtures(tournamentId: string, teamId: string) {
    const fixtures = await this.prisma.match.findMany({ where: { tournamentId, OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }] }, select: { round: true, status: true } });
    return fixtures.map((fixture) => ({ round: fixture.round, isFinished: fixture.status === 'FINISHED' }));
  }
}

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}
  private readonly accessInclude = { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } } as const;
  private mapUser<T extends { roles: Array<{ role: { code: string; permissions: Array<{ permission: { code: string } }> } }> }>(user: T) {
    const { roles, ...record } = user;
    return {
      ...record,
      role: (roles[0]?.role.code ?? Role.Manager) as Role,
      permissions: [...new Set(roles.flatMap((assignment) => assignment.role.permissions.map((item) => item.permission.code)))],
    };
  }
  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() }, include: this.accessInclude });
    return user ? this.mapUser(user) : null;
  }
  async listUsers() {
    const users = await this.prisma.user.findMany({ select: { id: true, email: true, displayName: true, isActive: true, roles: this.accessInclude.roles }, orderBy: { createdAt: 'asc' } });
    return users.map((user) => this.mapUser(user));
  }
  async findUserById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, include: this.accessInclude });
    return user ? this.mapUser(user) : null;
  }
  async createUser(input: { email: string; passwordHash: string; displayName: string; role: Role }) {
    const { role, ...userInput } = input;
    const user = await this.prisma.user.create({
      data: { ...userInput, email: input.email.toLowerCase(), roles: { create: { role: { connect: { code: role } } } } },
      include: this.accessInclude,
    });
    return this.mapUser(user);
  }
  async updateUser(id: string, input: Partial<{ displayName: string; role: Role; isActive: boolean }>) {
    const { role, ...changes } = input;
    const user = await this.prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id }, data: changes });
      if (role) {
        await tx.userRoleAssignment.deleteMany({ where: { userId: id } });
        await tx.userRoleAssignment.create({ data: { user: { connect: { id } }, role: { connect: { code: role } } } });
      }
      return tx.user.findUniqueOrThrow({ where: { id }, include: this.accessInclude });
    });
    return this.mapUser(user);
  }
  async updatePassword(id: string, passwordHash: string) { await this.prisma.user.update({ where: { id }, data: { passwordHash } }); }
  countOtherActiveAdministrators(id: string) {
    return this.prisma.user.count({ where: { id: { not: id }, isActive: true, roles: { some: { role: { code: Role.Administrator } } } } });
  }
}
