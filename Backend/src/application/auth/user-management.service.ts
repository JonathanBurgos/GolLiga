import { Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { ConflictError, ForbiddenDomainError, NotFoundError } from '../../domain/common/domain-error.js';
import { Role } from '../../domain/common/roles.js';
import { UserRepository } from '../../domain/users/user.repository.js';

@Injectable()
export class UserManagementService {
  constructor(private readonly users: UserRepository) {}
  list() { return this.users.listUsers(); }
  create(input: { email: string; password: string; displayName: string; role: Role }) {
    return hash(input.password, 12).then((passwordHash) => this.users.createUser({ ...input, email: input.email.trim().toLowerCase(), passwordHash }));
  }
  async update(id: string, input: Partial<{ displayName: string; role: Role; isActive: boolean }>, actorId: string) {
    const current = await this.users.findUserById(id);
    if (!current) throw new NotFoundError('El usuario');
    if (id === actorId && input.isActive === false) throw new ForbiddenDomainError('No puedes desactivar tu propio usuario.');
    if (current?.role === Role.Administrator && (input.role === Role.Manager || input.isActive === false) && !(await this.users.countOtherActiveAdministrators(id))) {
      throw new ConflictError('Debe permanecer al menos un administrador activo en la organización.');
    }
    if (id === actorId && input.role === Role.Manager) throw new ForbiddenDomainError('No puedes cambiar tu propio rol de administrador.');
    return this.users.updateUser(id, input);
  }
  async resetPassword(id: string, password: string) {
    if (!(await this.users.findUserById(id))) throw new NotFoundError('El usuario');
    await this.users.updatePassword(id, await hash(password, 12));
  }
}
