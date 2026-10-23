import { Routes } from '@angular/router';
import { TournamentPickerPage } from './features/tournaments/pages/tournament-picker.page';
import { TournamentShellComponent } from './features/tournaments/components/tournament-shell.component';
import { TournamentHomePage } from './features/tournaments/pages/tournament-home.page';
import { TeamsPage } from './features/teams/pages/teams.page';
import { TeamRosterPage } from './features/teams/pages/team-roster.page';
import { PlayerProfilePage } from './features/players/pages/player-profile.page';
import { TournamentSectionPage } from './features/tournaments/pages/tournament-section.page';
import { AdminAccessPage } from './features/admin/pages/admin-access.page';
import { AdminShellComponent } from './features/admin/components/admin-shell.component';
import { AdminDashboardPage } from './features/admin/pages/admin-dashboard.page';
import { AdminCollectionPage } from './features/admin/pages/admin-collection.page';
import { AdminTournamentFormPage } from './features/admin/pages/admin-tournament-form.page';
import { AdminTournamentDetailPage } from './features/admin/pages/admin-tournament-detail.page';
import { AdminMatchSheetPage } from './features/admin/pages/admin-match-sheet.page';
import { adminGuard, adminRoleGuard } from './features/admin/guards/admin.guard';

export const routes: Routes = [
  { path: '', component: TournamentPickerPage, title: 'GolLiga · Selecciona un torneo' },
  { path: 'admin/acceso', component: AdminAccessPage, title: 'GolLiga · Acceso administrador' },
  { path: 'admin', component: AdminShellComponent, canActivate: [adminGuard], canActivateChild: [adminRoleGuard], children: [
    { path: '', component: AdminDashboardPage, title: 'Administración · Resumen' },
    { path: 'torneos/nuevo', component: AdminTournamentFormPage, title: 'Administración · Crear torneo' },
    { path: 'torneos/:tournamentId/editar', component: AdminTournamentFormPage, title: 'Administración · Editar torneo' },
    { path: 'torneos/:tournamentId', component: AdminTournamentDetailPage, title: 'Administración · Detalle del torneo' },
    { path: 'planilla', component: AdminMatchSheetPage, title: 'Administración · Planilla del partido' },
    { path: ':section', component: AdminCollectionPage }
  ] },
  { path: 'torneos/:tournamentId', component: TournamentShellComponent, children: [
    { path: '', component: TournamentHomePage, title: 'Inicio' },
    { path: 'equipos', component: TeamsPage, title: 'Equipos' },
    { path: 'equipos/:teamId/plantilla', component: TeamRosterPage, title: 'Plantilla' },
    { path: 'jugadores/:playerId', component: PlayerProfilePage, title: 'Jugador' },
    { path: ':section', component: TournamentSectionPage }
  ] },
  { path: '**', redirectTo: '' }
];
