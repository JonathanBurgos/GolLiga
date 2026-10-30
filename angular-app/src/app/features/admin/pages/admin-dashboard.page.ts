import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminDashboardData, AdminWorkspaceFacade, DashboardMatch, DashboardTeam } from '../../../application/state/admin-workspace.facade';

@Component({
  selector: 'gl-admin-dashboard-page',
  standalone: true,
  imports: [AsyncPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.css', './admin-dashboard-layout.css'],
})
export class AdminDashboardPage {
  private readonly workspace = inject(AdminWorkspaceFacade);
  readonly dashboard$ = this.workspace.dashboard$;
  selectedGroup = 'Todos';

  nextMatch(matches: readonly DashboardMatch[]): DashboardMatch | undefined {
    const scheduled = matches
      .filter((match) => match.status === 'SCHEDULED')
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    return scheduled.find((match) => new Date(match.scheduledAt).getTime() >= Date.now()) ?? scheduled[0];
  }

  featuredTeam(teams: readonly DashboardTeam[], id: string): DashboardTeam | undefined {
    return teams.find((team) => team.id === id);
  }

  standings(data: AdminDashboardData) {
    return data.standings.filter((row) => this.selectedGroup === 'Todos' || row.group === this.selectedGroup);
  }

  recentResults(matches: readonly DashboardMatch[]): DashboardMatch[] {
    return matches
      .filter((match) => match.status === 'FINISHED')
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
      .slice(0, 3);
  }

  missingVenue(matches: readonly DashboardMatch[]): DashboardMatch[] {
    return matches.filter((match) => match.status === 'SCHEDULED' && !match.venue).slice(0, 3);
  }

  inProgress(matches: readonly DashboardMatch[]): DashboardMatch[] {
    return matches.filter((match) => match.status === 'IN_PROGRESS').slice(0, 3);
  }

  dateLabel(value: string): string {
    return new Date(value).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  timeLabel(value: string): string {
    return new Date(value).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }

  playedPercentage(played: number, total: number): number {
    return total ? Math.round((played / total) * 100) : 0;
  }

  goalsPerMatch(goals: number, played: number): string {
    return played ? (goals / played).toFixed(1).replace('.', ',') : '0';
  }
}
