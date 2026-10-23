import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PlayerService } from '../../../application/players/player.service.js';
import { InsightsService } from '../../../application/insights/insights.service.js';
import { Role } from '../../../domain/common/roles.js';
import { Permissions, Public, Roles } from '../auth/auth.decorators.js';
import { CreatePlayerDto, UpdatePlayerDto } from '../dto/resource.dto.js';

@ApiTags('Jugadores') @ApiBearerAuth() @Roles(Role.Administrator) @Permissions('players:manage')
@Controller()
export class PlayersController {
  constructor(private readonly players: PlayerService, private readonly insights: InsightsService) {}
  @Public() @Get('players/:id') get(@Param('id') id: string) { return this.players.get(id); }
  @Public() @Get('players/:id/stats') stats(@Param('id') id: string) { return this.insights.getPlayerStats(id); }
  @Public() @Get('teams/:teamId/players') list(@Param('teamId') teamId: string) { return this.players.list(teamId); }
  @Post('teams/:teamId/players') create(@Param('teamId') teamId: string, @Body() dto: CreatePlayerDto) {
    return this.players.create({ ...dto, teamId, dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined });
  }
  @Patch('players/:id') update(@Param('id') id: string, @Body() dto: UpdatePlayerDto) {
    return this.players.update(id, { ...dto, dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined });
  }
  @Delete('players/:id') remove(@Param('id') id: string) { return this.players.remove(id); }
}
