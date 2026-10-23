import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MatchService } from '../../../application/matches/match.service.js';
import { Role } from '../../../domain/common/roles.js';
import { AuthenticatedUser, CurrentUser, Permissions, Public, Roles } from '../auth/auth.decorators.js';
import { CreateMatchDto, CreateMatchEventDto, UpdateMatchDto } from '../dto/resource.dto.js';

@ApiTags('Partidos') @ApiBearerAuth() @Roles(Role.Administrator) @Permissions('matches:manage')
@Controller()
export class MatchesController {
  constructor(private readonly matches: MatchService) {}
  @Public() @Get('matches/:id') get(@Param('id') id: string) { return this.matches.get(id); }
  @Public() @Get('tournaments/:tournamentId/matches') list(@Param('tournamentId') id: string) { return this.matches.list(id); }
  @Post('tournaments/:tournamentId/matches') create(@Param('tournamentId') tournamentId: string, @Body() dto: CreateMatchDto) {
    return this.matches.create({ ...dto, tournamentId, scheduledAt: new Date(dto.scheduledAt) });
  }
  @Patch('matches/:id') update(@Param('id') id: string, @Body() dto: UpdateMatchDto) {
    return this.matches.update(id, { ...dto, scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined });
  }
  @Delete('matches/:id') remove(@Param('id') id: string) { return this.matches.remove(id); }
}

@ApiTags('Planillas') @ApiBearerAuth() @Roles(Role.Administrator, Role.Manager) @Permissions('match-sheets:manage')
@Controller('matches/:matchId')
export class MatchSheetsController {
  constructor(private readonly matches: MatchService) {}
  @Get('events') events(@Param('matchId') matchId: string) { return this.matches.events(matchId); }
  @Post('events') add(@Param('matchId') matchId: string, @Body() dto: CreateMatchEventDto, @CurrentUser() user: AuthenticatedUser) {
    return this.matches.addEvent(matchId, {
      ...dto, createdById: user.sub,
      suspensionFrom: dto.suspensionFrom ? new Date(dto.suspensionFrom) : undefined,
      suspensionTo: dto.suspensionTo ? new Date(dto.suspensionTo) : undefined,
    });
  }
  @Put('events/:eventId') updateEvent(@Param('matchId') matchId: string, @Param('eventId') eventId: string, @Body() dto: CreateMatchEventDto, @CurrentUser() user: AuthenticatedUser) {
    return this.matches.updateEvent(matchId, eventId, {
      ...dto, createdById: user.sub,
      suspensionFrom: dto.suspensionFrom ? new Date(dto.suspensionFrom) : undefined,
      suspensionTo: dto.suspensionTo ? new Date(dto.suspensionTo) : undefined,
    });
  }
  @Delete('events/:eventId') remove(@Param('matchId') matchId: string, @Param('eventId') eventId: string) { return this.matches.removeEvent(matchId, eventId); }
  @Post('finish') finish(@Param('matchId') matchId: string) { return this.matches.finish(matchId); }
  @Post('reopen') @Roles(Role.Administrator) @Permissions('match-sheets:reopen') reopen(@Param('matchId') matchId: string) { return this.matches.reopen(matchId); }
}
