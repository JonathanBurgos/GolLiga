import 'dotenv/config';
import { hash } from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/infrastructure/persistence/prisma/generated/client.js';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

const roleDefinitions = [
  { code: 'ADMINISTRADOR', name: 'Administrador', description: 'Acceso completo a la administración.' },
  { code: 'GESTOR', name: 'Gestor', description: 'Acceso a planillas y registro de partidos.' },
] as const;

const permissionDefinitions = [
  { code: 'users:manage', name: 'Administrar usuarios', description: 'Crear usuarios y asignar roles.' },
  { code: 'tournaments:manage', name: 'Administrar torneos', description: 'Crear, editar y eliminar torneos.' },
  { code: 'teams:manage', name: 'Administrar equipos', description: 'Gestionar equipos y grupos.' },
  { code: 'players:manage', name: 'Administrar jugadores', description: 'Gestionar plantillas y dorsales.' },
  { code: 'matches:manage', name: 'Administrar partidos', description: 'Crear y programar partidos.' },
  { code: 'match-sheets:manage', name: 'Gestionar planillas', description: 'Registrar y finalizar acontecimientos.' },
  { code: 'match-sheets:reopen', name: 'Reabrir planillas', description: 'Reabrir partidos finalizados.' },
  { code: 'insights:read', name: 'Consultar estadísticas', description: 'Ver tablas e indicadores.' },
] as const;

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const managerPassword = process.env.SEED_GESTOR_PASSWORD;
  if (!process.env.DATABASE_URL || !adminPassword || !managerPassword) {
    throw new Error('Configura DATABASE_URL y las contraseñas SEED_* en .env.');
  }

  const roles = new Map<string, string>();
  for (const definition of roleDefinitions) {
    const role = await prisma.role.upsert({
      where: { code: definition.code },
      update: { name: definition.name, description: definition.description, isSystem: true },
      create: { ...definition, isSystem: true },
    });
    roles.set(role.code, role.id);
  }

  const permissions = new Map<string, string>();
  for (const definition of permissionDefinitions) {
    const permission = await prisma.permission.upsert({ where: { code: definition.code }, update: definition, create: definition });
    permissions.set(permission.code, permission.id);
  }

  const adminRoleId = roles.get('ADMINISTRADOR')!;
  const managerRoleId = roles.get('GESTOR')!;
  for (const [roleId, allowedCodes] of [
    [adminRoleId, permissionDefinitions.map((item) => item.code)],
    [managerRoleId, ['match-sheets:manage']],
  ] as const) {
    for (const code of allowedCodes) {
      const permissionId = permissions.get(code)!;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId } },
        update: {}, create: { roleId, permissionId },
      });
    }
  }

  const accounts = [
    { email: process.env.SEED_ADMIN_EMAIL ?? 'admin@golliga.local', password: adminPassword, displayName: 'Administrador GolLiga', roleId: adminRoleId },
    { email: process.env.SEED_GESTOR_EMAIL ?? 'gestor@golliga.local', password: managerPassword, displayName: 'Gestor de planillas', roleId: managerRoleId },
  ];
  for (const account of accounts) {
    const passwordHash = await hash(account.password, 12);
    const user = await prisma.user.upsert({
      where: { email: account.email.toLowerCase() },
      update: { passwordHash, displayName: account.displayName, isActive: true },
      create: { email: account.email.toLowerCase(), passwordHash, displayName: account.displayName, isActive: true },
    });
    await prisma.userRoleAssignment.deleteMany({ where: { userId: user.id } });
    await prisma.userRoleAssignment.create({ data: { userId: user.id, roleId: account.roleId } });
  }

  console.log('RBAC inicializado: roles Administrador/Gestor y cuentas de prueba. No se crean datos deportivos.');
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
