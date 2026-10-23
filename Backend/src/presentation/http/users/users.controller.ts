import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserManagementService } from '../../../application/auth/user-management.service.js';
import { Role } from '../../../domain/common/roles.js';
import { AuthenticatedUser, CurrentUser, Permissions, Roles } from '../auth/auth.decorators.js';
import { CreateUserDto, ResetPasswordDto, UpdateUserDto } from '../dto/user.dto.js';

@ApiTags('Usuarios') @ApiBearerAuth() @Roles(Role.Administrator) @Permissions('users:manage') @Controller('users')
export class UsersController {
  constructor(private readonly users: UserManagementService) {}
  @Get() list() { return this.users.list(); }
  @Post() create(@Body() dto: CreateUserDto) { return this.users.create({ ...dto, role: dto.role as Role }); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.users.update(id, { ...dto, role: dto.role as Role | undefined }, actor.sub);
  }
  @Post(':id/password') resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) { return this.users.resetPassword(id, dto.password); }
}
