import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { TeamService } from '../../../application/teams/team.service.js';
import { Role } from '../../../domain/common/roles.js';
import { Permissions, Public, Roles } from '../auth/auth.decorators.js';
import { CreateTeamDto, UpdateTeamDto } from '../dto/resource.dto.js';
import { TeamCrestStorageService } from '../../../infrastructure/storage/team-crest-storage.service.js';

@ApiTags('Equipos') @ApiBearerAuth() @Roles(Role.Administrator) @Permissions('teams:manage')
@Controller()
export class TeamsController {
  constructor(private readonly teams: TeamService, private readonly crestStorage: TeamCrestStorageService) {}
  @Public() @Get('teams/:id') get(@Param('id') id: string) { return this.teams.get(id); }
  @Public() @Get('tournaments/:tournamentId/teams') list(@Param('tournamentId') id: string) { return this.teams.list(id); }
  @Post('tournaments/:tournamentId/teams') create(@Param('tournamentId') tournamentId: string, @Body() dto: CreateTeamDto) { return this.teams.create({ ...dto, tournamentId, registeredAt: dto.registeredAt ? new Date(dto.registeredAt) : undefined }); }
  @Patch('teams/:id') update(@Param('id') id: string, @Body() dto: UpdateTeamDto) { return this.teams.update(id, { ...dto, registeredAt: dto.registeredAt ? new Date(dto.registeredAt) : undefined }); }
  @Delete('teams/:id') remove(@Param('id') id: string) { return this.teams.remove(id); }

  @Post('teams/crest')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { crest: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('crest', {
    storage: diskStorage({
      destination: tmpdir(),
      filename: (_request, _file, callback) => callback(null, randomUUID()),
    }),
    limits: { fileSize: 2 * 1024 * 1024 * 1024, files: 1, fields: 0 },
    fileFilter: (_request, file, callback) => {
      if (!['image/png', 'image/svg+xml'].includes(file.mimetype)) {
        callback(new BadRequestException('El archivo debe ser una imagen PNG o SVG.'), false);
        return;
      }
      callback(null, true);
    },
  }))
  uploadCrest(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Selecciona un escudo PNG o SVG para subir.');
    return this.crestStorage.upload(file);
  }
}
