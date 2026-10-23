import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../../../application/auth/auth.service.js';
import { AuthenticatedUser, CurrentUser, Public } from './auth.decorators.js';
import { LoginDto } from './login.dto.js';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Public() @Post('login') @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión y obtener un token JWT' })
  login(@Body() dto: LoginDto) { return this.auth.login(dto.email, dto.password); }

  @Get('me') @ApiBearerAuth()
  current(@CurrentUser() user: AuthenticatedUser) {
    return { id: user.sub, email: user.email, displayName: user.displayName, role: user.role, permissions: user.permissions };
  }
}
