import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TeamService } from '../../../application/teams/team.service.js';
import { Role } from '../../../domain/common/roles.js';
import { Permissions, Public, Roles } from '../auth/auth.decorators.js';
import { CreateTeamDto, UpdateTeamDto } from '../dto/resource.dto.js';

@ApiTags('Equipos') @ApiBearerAuth() @Roles(Role.Administrator) @Permissions('teams:manage')
@Controller()
export class TeamsController {
  constructor(private readonly teams: TeamService) {}
  @Public() @Get('teams/:id') get(@Param('id') id: string) { return this.teams.get(id); }
  @Public() @Get('tournaments/:tournamentId/teams') list(@Param('tournamentId') id: string) { return this.teams.list(id); }
  @Post('tournaments/:tournamentId/teams') create(@Param('tournamentId') tournamentId: string, @Body() dto: CreateTeamDto) { return this.teams.create({ ...dto, tournamentId, registeredAt: dto.registeredAt ? new Date(dto.registeredAt) : undefined }); }
  @Patch('teams/:id') update(@Param('id') id: string, @Body() dto: UpdateTeamDto) { return this.teams.update(id, { ...dto, registeredAt: dto.registeredAt ? new Date(dto.registeredAt) : undefined }); }
  @Delete('teams/:id') remove(@Param('id') id: string) { return this.teams.remove(id); }
}
