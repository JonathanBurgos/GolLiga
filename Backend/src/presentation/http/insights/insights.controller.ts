import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InsightsService } from '../../../application/insights/insights.service.js';
import { Role } from '../../../domain/common/roles.js';
import { Permissions, Public, Roles } from '../auth/auth.decorators.js';

@ApiTags('Estadísticas') @ApiBearerAuth() @Roles(Role.Administrator) @Permissions('insights:read')
@Controller('tournaments/:tournamentId')
export class InsightsController {
  constructor(private readonly insights: InsightsService) {}
  @Public() @Get('insights') get(@Param('tournamentId') tournamentId: string) { return this.insights.getTournamentInsights(tournamentId); }
  @Public() @Get('standings') async standings(@Param('tournamentId') id: string) { return (await this.insights.getTournamentInsights(id)).standings; }
  @Public() @Get('results') async results(@Param('tournamentId') id: string) { return (await this.insights.getTournamentInsights(id)).results; }
  @Public() @Get('scorers') async scorers(@Param('tournamentId') id: string) { return (await this.insights.getTournamentInsights(id)).scorers; }
  @Public() @Get('fair-play') async fairPlay(@Param('tournamentId') id: string) { return (await this.insights.getTournamentInsights(id)).fairPlay; }
  @Public() @Get('sanctions') async sanctions(@Param('tournamentId') id: string) { return (await this.insights.getTournamentInsights(id)).suspensions; }
}
