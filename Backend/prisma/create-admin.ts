import 'dotenv/config';
import { hash } from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/infrastructure/persistence/prisma/generated/client.js';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

async function main() {
  const email = process.env.NEW_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.NEW_ADMIN_PASSWORD;
  const displayName = process.env.NEW_ADMIN_NAME?.trim();

  if (!process.env.DATABASE_URL || !email || !password || !displayName) {
    throw new Error('Configura DATABASE_URL, NEW_ADMIN_EMAIL, NEW_ADMIN_PASSWORD y NEW_ADMIN_NAME.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('NEW_ADMIN_EMAIL no contiene una dirección válida.');
  }
  if (password.length < 16) {
    throw new Error('NEW_ADMIN_PASSWORD debe tener al menos 16 caracteres.');
  }
  if (displayName.length < 2) {
    throw new Error('NEW_ADMIN_NAME debe tener al menos 2 caracteres.');
  }

  const [existingUser, administratorRole] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.role.findUnique({ where: { code: 'ADMINISTRADOR' } }),
  ]);
  if (existingUser) {
    throw new Error('Ya existe un usuario con ese correo; no se modificó ninguna cuenta.');
  }
  if (!administratorRole) {
    throw new Error('No existe el rol ADMINISTRADOR. Ejecuta primero las migraciones y el seed de Prisma.');
  }

  const user = await prisma.user.create({
    data: {
      email,
      displayName,
      passwordHash: await hash(password, 12),
      isActive: true,
      roles: { create: { roleId: administratorRole.id } },
    },
    include: { roles: { include: { role: true } } },
  });
  if (!user.isActive || !user.roles.some(({ role }) => role.code === 'ADMINISTRADOR')) {
    throw new Error('No se pudo verificar la asignación del rol administrador.');
  }
  console.log(`Usuario administrador creado y verificado: ${email}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
