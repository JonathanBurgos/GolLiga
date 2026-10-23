BEGIN;

INSERT INTO "User" ("id", "email", "passwordHash", "displayName", "isActive", "createdAt", "updatedAt")
VALUES
    ('bootstrap-admin-20261023', 'admin.plataforma@golliga.local', '$2b$12$Cynl6dpbi0ZuHHu/.2Ke7uNuDpik13LJKvDIaVL0TUkaE9IANjY4u', 'Administrador de Plataforma', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('bootstrap-manager-20261023', 'gestor.plataforma@golliga.local', '$2b$12$HYPuOI67/lc2QFl5WkfA1eSlvfZvCsKOvA1ZLeJ0MjITDL/nViDqy', 'Gestor de Plataforma', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "UserRoleAssignment" ("userId", "roleId")
SELECT u."id", r."id"
FROM "User" u
JOIN "Role" r ON r."code" = CASE u."id"
    WHEN 'bootstrap-admin-20261023' THEN 'ADMINISTRADOR'
    WHEN 'bootstrap-manager-20261023' THEN 'GESTOR'
END
WHERE u."id" IN ('bootstrap-admin-20261023', 'bootstrap-manager-20261023');

COMMIT;
