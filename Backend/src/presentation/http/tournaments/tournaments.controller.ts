import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TournamentService } from '../../../application/tournaments/tournament.service.js';
import { Role } from '../../../domain/common/roles.js';
import { Permissions, Public, Roles } from '../auth/auth.decorators.js';
import { CreateTournamentDto, UpdateTournamentDto } from '../dto/resource.dto.js';

@ApiTags('Torneos') @ApiBearerAuth() @Roles(Role.Administrator) @Permissions('tournaments:manage')
@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournaments: TournamentService) {}
  @Public() @Get() list() { return this.tournaments.list(); }
  @Public() @Get(':id') get(@Param('id') id: string) { return this.tournaments.get(id); }
  @Post() create(@Body() dto: CreateTournamentDto) {
    return this.tournaments.create({ ...dto, startDate: dto.startDate ? new Date(dto.startDate) : undefined, endDate: dto.endDate ? new Date(dto.endDate) : undefined });
  }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateTournamentDto) {
    return this.tournaments.update(id, { ...dto, startDate: dto.startDate ? new Date(dto.startDate) : undefined, endDate: dto.endDate ? new Date(dto.endDate) : undefined });
  }
  @Delete(':id') remove(@Param('id') id: string) { return this.tournaments.remove(id); }
}
