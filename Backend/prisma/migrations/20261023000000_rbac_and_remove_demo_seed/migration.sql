-- Normalize authorization into roles, permissions and their assignments.
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserRoleAssignment" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserRoleAssignment_pkey" PRIMARY KEY ("userId", "roleId")
);

CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId", "permissionId")
);

CREATE UNIQUE INDEX "Role_code_key" ON "Role"("code");
CREATE INDEX "Role_isSystem_name_idx" ON "Role"("isSystem", "name");
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");
CREATE INDEX "UserRoleAssignment_roleId_idx" ON "UserRoleAssignment"("roleId");
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

INSERT INTO "Role" ("id", "code", "name", "description", "isSystem") VALUES
    ('role-admin', 'ADMINISTRADOR', 'Administrador', 'Acceso completo a la administración.', true),
    ('role-manager', 'GESTOR', 'Gestor', 'Acceso a planillas y registro de partidos.', true);

INSERT INTO "Permission" ("id", "code", "name", "description") VALUES
    ('permission-users-manage', 'users:manage', 'Administrar usuarios', 'Crear usuarios y asignar roles.'),
    ('permission-tournaments-manage', 'tournaments:manage', 'Administrar torneos', 'Crear, editar y eliminar torneos.'),
    ('permission-teams-manage', 'teams:manage', 'Administrar equipos', 'Gestionar equipos y grupos.'),
    ('permission-players-manage', 'players:manage', 'Administrar jugadores', 'Gestionar plantillas y dorsales.'),
    ('permission-matches-manage', 'matches:manage', 'Administrar partidos', 'Crear y programar partidos.'),
    ('permission-sheets-manage', 'match-sheets:manage', 'Gestionar planillas', 'Registrar y finalizar acontecimientos.'),
    ('permission-sheets-reopen', 'match-sheets:reopen', 'Reabrir planillas', 'Reabrir partidos finalizados.'),
    ('permission-insights-read', 'insights:read', 'Consultar estadísticas', 'Ver tablas e indicadores.');

-- Preserve the existing administrator and manager accounts while converting their role values.
INSERT INTO "UserRoleAssignment" ("userId", "roleId")
SELECT u."id", r."id"
FROM "User" u
JOIN "Role" r ON r."code" = u."role"::TEXT;

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT r."id", p."id"
FROM "Role" r CROSS JOIN "Permission" p
WHERE r."code" = 'ADMINISTRADOR';

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT r."id", p."id"
FROM "Role" r JOIN "Permission" p ON p."code" = 'match-sheets:manage'
WHERE r."code" = 'GESTOR';

-- The seeded tournament, roster and fixtures were sample data; remove that known demo set.
DELETE FROM "Tournament" WHERE "id" = 'copa-aficionados-2026';

ALTER TABLE "UserRoleAssignment"
    ADD CONSTRAINT "UserRoleAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "UserRoleAssignment_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RolePermission"
    ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DROP INDEX "User_role_isActive_idx";
ALTER TABLE "User" DROP COLUMN "role";
DROP TYPE "UserRole";
