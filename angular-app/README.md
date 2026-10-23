# GolLiga · Angular 21

Aplicación Angular standalone con el flujo **seleccionar torneo → explorar equipos → abrir plantilla → consultar ficha y estadísticas del jugador**.

## Capas

- `src/app/domain`: modelos y puerto del repositorio. No depende de Angular ni de la interfaz.
- `src/app/application`: casos de uso y fachadas RxJS. Coordina estado y operaciones de lectura.
- `src/app/infrastructure`: adaptador HTTP que implementa el puerto del dominio; las lecturas de torneos, equipos, plantillas y estadísticas usan NestJS. El interceptor adjunta el JWT al escribir.
- `src/app/features`: páginas y composición por funcionalidad del torneo, equipos y jugadores.
- `src/app/design-system`: componentes de Diseño Atómico: átomos, moléculas y organismos reutilizables.
- `src/app/features/admin`: acceso, guard de rutas, shell y páginas para gestionar torneos, equipos, jugadores, fixture, resultados, estadísticas y configuración.

Cada componente mantiene su lógica en `.ts`, su plantilla en `.html` y sus estilos encapsulados en `.css`, ubicados junto al componente. El componente raíz también sigue esta convención para mantener una estructura uniforme.

## Flujo y rutas

- `/` muestra el selector de torneo.
- `/torneos/:tournamentId` carga el contexto y el menú común.
- `/torneos/:tournamentId/equipos/:teamId/plantilla` abre una plantilla.
- `/torneos/:tournamentId/jugadores/:playerId` muestra goles, asistencias y tarjetas.
- Las demás opciones del menú usan la ruta `/torneos/:tournamentId/:section`.
- `/admin/acceso` muestra el acceso de organización; `/admin` y sus secciones quedan detrás de `adminGuard`.

El estado de torneo se deriva del parámetro de ruta y se expone mediante `TournamentFacade`. Las páginas consumen observables con `AsyncPipe`; `ApiTournamentRepository` usa la URL configurable en `src/environments/environment.ts`.

## Desarrollo

Requiere Node.js compatible con Angular CLI 21.

```bash
npm install
npm start
```

Para compilar: `npm run build`.

La base local se inicializa con torneo, equipos, jugadores y fixture de demostración. Los torneos secundarios mantienen la navegación, pero aún no tienen contenido publicado.

La API local se ejecuta desde `../Backend` en `http://localhost:3000/api/v1`; el endpoint se configura en `src/environments/environment.ts`. Arranca primero PostgreSQL y NestJS según el README de `Backend`.

El módulo de administración incluye el resumen visual, clasificación por grupo y general, equipos filtrables, catálogo de torneos, alta/edición y detalle de torneo, jugadores, fixture y resultados. Las páginas conservan sus plantillas y estilos en archivos `.html` y `.css` separados.

El acceso llama `POST /auth/login`; el rol lo devuelve la API y ya no se elige en el navegador. **Administrador** ve todo el panel y **Gestor** solo ve Planilla del partido. El token se guarda en `localStorage` y lo adjunta el interceptor HTTP. La integración actual cubre autenticación y las lecturas públicas de torneos, equipos, jugadores y estadísticas; las escrituras del panel y las acciones de planilla siguen pendientes de migrar de su almacenamiento local a la API.

Cada jugador de la plantilla tiene un número de camiseta único dentro de su equipo. La planilla registra las acciones por equipo y camiseta, y bloquea a un jugador con expulsión durante las fechas posteriores pendientes. Una fecha queda cumplida cuando se cierra la planilla del siguiente partido de su equipo. El alta de jugadores y sus camisetas se conserva también en el almacenamiento local del navegador.

