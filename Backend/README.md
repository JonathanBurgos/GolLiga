# GolLiga Backend

API REST para el panel administrativo y la plataforma pública de GolLiga. Se ejecuta en una carpeta independiente de `angular-app/`.

## Stack

- NestJS 11 y TypeScript estricto.
- PostgreSQL 18 y Prisma ORM 7.
- JWT de acceso, roles Administrador/Gestor, validación DTO y control de solicitudes.
- Swagger en `/docs`.

## Arquitectura

`src/domain` contiene reglas e interfaces de repositorio. `src/application` coordina casos de uso sin depender de NestJS ni Prisma. `src/infrastructure` adapta Prisma/PostgreSQL a los puertos del dominio. `src/presentation/http` contiene controladores, DTO, guards, filtros y el contrato HTTP.

Los módulos funcionales están organizados por bounded context: torneos, equipos, jugadores, partidos/planillas, autenticación y estadísticas. Las operaciones que cierran una planilla calculan y guardan el marcador dentro de una transacción; las consultas de clasificación, goleadores, Fair Play y sanciones se derivan de las acciones finalizadas.

## Inicio local

Requisitos: Node.js 22.22.3+ (rama 22) o 24.15+, PostgreSQL 18 instalado en Windows en `C:\Program Files\PostgreSQL\18`.

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm install
npm run prisma:generate
./scripts/start-local-postgres.ps1
npm run prisma:deploy
npm run prisma:seed
npm run start:dev
```

La instancia local guarda sus datos en `.local-postgres-data/` (ignorada por Git) y escucha solo en `127.0.0.1:5434`. La configuración de desarrollo está en `.env`; no uses las credenciales de ejemplo en entornos compartidos.

La API escucha en `http://localhost:3000/api/v1`; documentación en `http://localhost:3000/docs` y estado en `http://localhost:3000/api/v1/health`.

Configura `CLOUDINARY_URL` en `.env` con las credenciales de una cuenta Cloudinary. El endpoint autenticado `POST /api/v1/teams/crest` recibe el archivo multipart en el campo `crest`; admite PNG y SVG de hasta 2 GB, los convierte a WebP y los optimiza a un máximo de 150 KB antes de subirlos. La respuesta incluye `url`, que el formulario guarda en `crestUrl` del equipo. Mantén la URL de Cloudinary únicamente en variables de entorno y nunca la publiques en Git.

Las cuentas demo quedan configuradas en `.env.example`: `admin@golliga.local` y `gestor@golliga.local`, ambas con contraseña `ChangeMe_123!`. Cambia las contraseñas antes de exponer el servicio fuera de tu entorno local. El seed actualiza la contraseña de estas cuentas cada vez que se ejecuta.

## API

El listado `GET /tournaments/:id/teams` incluye `activePlayerCount` (jugadores activos). La clasificación incluye a todos los equipos inscritos aunque todavía no hayan disputado partidos; sus estadísticas comienzan en cero.

Para crear cuentas adicionales después de la inicialización, configura temporalmente `NEW_ADMIN_EMAIL`, `NEW_ADMIN_PASSWORD` (mínimo 16 caracteres) y `NEW_ADMIN_NAME`, y ejecuta `npm run prisma:create-admin`. El script guarda la contraseña con bcrypt y no modifica cuentas existentes. El esquema de roles y permisos ya está en la migración `20261023000000_rbac_and_remove_demo_seed`; la migración de bootstrap de abajo solo configura las dos cuentas iniciales solicitadas.

La migración `20261023020000_bootstrap_admin_manager` crea las cuentas iniciales `admin.plataforma@golliga.local` (Administrador) y `gestor.plataforma@golliga.local` (Gestor), con contraseñas bcrypt. Tras aplicarla, cambia ambas contraseñas desde un entorno seguro; las claves iniciales se entregan al operador y no se guardan en texto plano en la migración.

Las rutas `GET` del torneo son públicas para que el sitio pueda mostrar el contenido del torneo seleccionado. Las operaciones de escritura requieren `Authorization: Bearer <accessToken>`. `POST /api/v1/auth/login` y `GET /api/v1/health` también son públicos.

| Recurso | Rutas principales | Acceso |
|---|---|---|
| Autenticación | `POST /auth/login` | Público |
| Usuarios | `GET/POST /users`, `PATCH /users/:id`, `POST /users/:id/password` | Administrador |
| Torneos | `GET /tournaments`, `GET /tournaments/:id` (públicos); `POST/PATCH/DELETE` | Administrador |
| Equipos | `GET /tournaments/:id/teams`, `GET /teams/:id` (públicos); `POST`, `PATCH/DELETE /teams/:id` | Administrador |
| Jugadores | `GET /teams/:id/players`, `GET /players/:id`, `/players/:id/stats` (públicos); `POST`, `PATCH/DELETE /players/:id` | Administrador |
| Fixture | `GET /tournaments/:id/matches`, `GET /matches/:id` (públicos); `POST/PATCH/DELETE /matches/:id` | Administrador |
| Planillas | `GET/POST /matches/:id/events`, `PUT/DELETE /events/:eventId`, `POST /finish` | Administrador, Gestor |
| Reabrir planilla | `POST /matches/:id/reopen` | Administrador |
| Indicadores | `GET /tournaments/:id/insights`, `/standings`, `/results`, `/scorers`, `/fair-play`, `/sanctions` (públicos) | Público |

El dorsal es único por equipo. Los eventos referencian `playerId` y el equipo participante; el nombre y dorsal visible se resuelven desde la plantilla. Una tarjeta roja exige `suspensionMatches` (1–20); cada partido finalizado posterior del equipo consume una fecha, y se rechazan acciones de un jugador con fechas pendientes.

## Normalización relacional

- **1FN:** cada atributo contiene un solo valor; plantillas, partidos y acciones se guardan como filas independientes, sin listas embebidas en columnas.
- **2FN:** cada fila tiene clave primaria propia y sus atributos dependen de esa clave completa. Se conservan claves naturales únicas como `(name, season)` para torneos y `(teamId, jerseyNumber)` para dorsales.
- **3FN:** los datos propios de usuario, torneo, equipo, jugador, partido y evento residen en tablas separadas y se relacionan mediante claves foráneas. Los roles, estados y tipos de evento se restringen con enums; resultados, posiciones, goleadores, Fair Play y sanciones se consultan desde los partidos y eventos finalizados.

El esquema y su migración inicial están en `prisma/schema.prisma` y `prisma/migrations/20261022000000_init/`.

## Ejemplo de registro

```json
{
  "teamId": "leones",
  "playerId": "andres-mejia",
  "type": "RED_CARD",
  "minute": 76,
  "suspensionMatches": 2,
  "details": "Juego brusco grave"
}
```

## Notas de seguridad/operación

- `JWT_SECRET` debe ser un secreto aleatorio largo, inyectado por el gestor de secretos del entorno.
- Las contraseñas se almacenan con bcrypt; los tokens no guardan contraseñas.
- `ValidationPipe` elimina campos no declarados y rechaza payloads desconocidos.
- Helmet, CORS explícito, rate limit y respuestas de error estables vienen habilitados.
- La base de datos de ejemplo está pensada para desarrollo. En producción se debe configurar backup, TLS, rotación de secretos, logging estructurado y despliegue de migraciones como paso de release.
