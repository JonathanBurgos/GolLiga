import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { UserRepository } from '../../domain/users/user.repository.js';

@Injectable()
@Injectable()
export class AuthService {
  constructor(private readonly users: UserRepository, private readonly jwt: JwtService, private readonly config: ConfigService) {}
  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email.trim().toLowerCase());
    if (!user?.isActive || !(await compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Correo o contraseña incorrectos.');
    }
    const claims = { sub: user.id, email: user.email, role: user.role, permissions: user.permissions, displayName: user.displayName };
    return { accessToken: await this.jwt.signAsync(claims), tokenType: 'Bearer', expiresIn: this.config.get<string>('JWT_EXPIRES_IN', '15m'), user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role, permissions: user.permissions } };
  }
}
