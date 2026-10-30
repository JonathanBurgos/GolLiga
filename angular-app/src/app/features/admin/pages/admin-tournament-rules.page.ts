import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { NotificationService } from '../../../application/state/notification.service';
import { environment } from '../../../../environments/environment';

interface TournamentRules {
  victoryPoints: number;
  drawPoints: number;
  defeatPoints: number;
  tieBreakCriteria: string[];
  competitionFormat: string;
  groupCount: number;
  qualifiersPerGroup: number;
  yellowCardsForSuspension: number;
  directRedSuspensionMatches: number;
  secondYellowSuspensionMatches: number;
  resetCardsAtPlayoffs: boolean;
  yellowCardPoints: number;
  secondYellowPoints: number;
  directRedPoints: number;
  otherSanctions: string;
  timeZone: string;
  currency: string;
  registrationFee: number;
  organizationContact: string;
}

const criterionLabels: Record<string, string> = {
  goalDifference: 'Diferencia de goles',
  goalsFor: 'Goles a favor',
  headToHead: 'Enfrentamiento directo',
  fairPlay: 'Fair Play',
  lottery: 'Sorteo',
};

@Component({
  selector: 'gl-admin-tournament-rules-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-tournament-rules.page.html',
  styleUrl: './admin-tournament-rules.page.css',
})
export class AdminTournamentRulesPage {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly notifications = inject(NotificationService);
  readonly tournamentId = this.route.snapshot.paramMap.get('tournamentId') ?? '';
  private readonly base = environment.apiUrl;
  private savedRules: TournamentRules | null = null;
  readonly criterionOptions = Object.entries(criterionLabels);
  readonly scoringOptions: ReadonlyArray<{
    label: string;
    field: 'victoryPoints' | 'drawPoints' | 'defeatPoints';
    min: number;
    max: number;
  }> = [
    { label: 'Victoria', field: 'victoryPoints', min: 0, max: 10 },
    { label: 'Empate', field: 'drawPoints', min: 0, max: 10 },
    { label: 'Derrota', field: 'defeatPoints', min: 0, max: 10 },
  ];
  rules: TournamentRules | null = null;
  tournamentName = 'Reglamento del torneo';
  loading = true;
  saving = false;
  error = '';
  draggingIndex = -1;

  constructor() {
    this.loadRules();
  }

  loadRules(): void {
    if (!this.tournamentId) {
      this.error = 'No se encontró el identificador del torneo.';
      this.loading = false;
      this.changeDetector.markForCheck();
      return;
    }

    this.loading = true;
    this.error = '';
    this.rules = null;
    this.changeDetector.markForCheck();

    forkJoin({
      tournament: this.http.get<{ name: string }>(`${this.base}/tournaments/${this.tournamentId}`),
      rules: this.http.get<TournamentRules>(`${this.base}/tournaments/${this.tournamentId}/rules`),
    }).subscribe({
      next: ({ tournament, rules }) => {
        this.tournamentName = tournament.name;
        this.rules = structuredClone(rules);
        this.savedRules = structuredClone(rules);
        this.loading = false;
        this.error = '';
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.error = 'No fue posible cargar el reglamento. Verifica tu conexión e inténtalo de nuevo.';
        this.loading = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  get isDirty(): boolean {
    return !!this.rules && !!this.savedRules && JSON.stringify(this.rules) !== JSON.stringify(this.savedRules);
  }

  criterionName(code: string): string {
    return criterionLabels[code] ?? code;
  }

  availableCriteria(): Array<[string, string]> {
    const selected = this.rules?.tieBreakCriteria ?? [];
    return this.criterionOptions.filter(([code]) => !selected.includes(code));
  }

  addCriterion(): void {
    const next = this.availableCriteria()[0];
    if (this.rules && next) this.rules.tieBreakCriteria.push(next[0]);
  }

  removeCriterion(index: number): void {
    this.rules?.tieBreakCriteria.splice(index, 1);
  }

  moveCriterion(from: number, to: number): void {
    const criteria = this.rules?.tieBreakCriteria;
    if (!criteria || from < 0 || to < 0 || from >= criteria.length || to >= criteria.length || from === to) return;
    const [criterion] = criteria.splice(from, 1);
    criteria.splice(to, 0, criterion);
    this.draggingIndex = -1;
  }

  adjust(field: 'victoryPoints' | 'drawPoints' | 'defeatPoints' | 'groupCount' | 'qualifiersPerGroup' | 'yellowCardsForSuspension' | 'directRedSuspensionMatches' | 'secondYellowSuspensionMatches' | 'yellowCardPoints' | 'secondYellowPoints' | 'directRedPoints', change: number, min: number, max: number): void {
    if (!this.rules) return;
    this.rules[field] = Math.min(max, Math.max(min, this.rules[field] + change));
  }

  discard(): void {
    if (this.savedRules) this.rules = structuredClone(this.savedRules);
    this.error = '';
  }

  save(): void {
    if (!this.rules || this.saving || !this.isDirty) return;
    this.saving = true;
    this.error = '';
    this.http.patch<TournamentRules>(`${this.base}/tournaments/${this.tournamentId}/rules`, this.rules).subscribe({
      next: (rules) => {
        this.rules = structuredClone(rules);
        this.savedRules = structuredClone(rules);
        this.saving = false;
        this.notifications.success('Reglamento guardado', 'Los cambios se guardaron para este torneo.');
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.saving = false;
        this.error = 'No se pudo guardar el reglamento. Revisa los datos e inténtalo de nuevo.';
        this.notifications.error('No se pudo guardar', this.error);
        this.changeDetector.markForCheck();
      },
    });
  }
}
