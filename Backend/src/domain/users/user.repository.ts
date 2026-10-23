import { Role } from '../common/roles.js';

export interface UserRecord {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly displayName: string;
  readonly role: Role;
  readonly permissions: readonly string[];
  readonly isActive: boolean;
}

export abstract class UserRepository {
  abstract findByEmail(email: string): Promise<UserRecord | null>;
  abstract listUsers(): Promise<readonly Omit<UserRecord, 'passwordHash'>[]>;
  abstract findUserById(id: string): Promise<UserRecord | null>;
  abstract createUser(input: { email: string; passwordHash: string; displayName: string; role: Role }): Promise<Omit<UserRecord, 'passwordHash'>>;
  abstract updateUser(id: string, input: Partial<{ displayName: string; role: Role; isActive: boolean }>): Promise<Omit<UserRecord, 'passwordHash'>>;
  abstract updatePassword(id: string, passwordHash: string): Promise<void>;
  abstract countOtherActiveAdministrators(id: string): Promise<number>;
}
