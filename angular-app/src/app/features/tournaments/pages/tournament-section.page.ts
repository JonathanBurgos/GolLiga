import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { TournamentFacade } from '../../../application/state/tournament.facade';
import { AdminMatchSheetFacade } from '../../../application/state/admin-match-sheet.facade';

const sectionLabels: Record<string,string>={jugadores:'Jugadores',grupos:'Grupos',fixture:'Fixture',resultados:'Resultados',posiciones:'Posiciones',estadisticas:'Estadísticas','fair-play':'Fair Play',sancionados:'Sancionados'};

@Component({selector:'gl-tournament-section-page',standalone:true,imports:[AsyncPipe,RouterLink],changeDetection:ChangeDetectionStrategy.OnPush,
 templateUrl: './tournament-section.page.html',
 styleUrl: './tournament-section.page.css' })
export class TournamentSectionPage {
  private readonly route=inject(ActivatedRoute);
  private readonly facade=inject(TournamentFacade);
  readonly insights$=inject(AdminMatchSheetFacade).insights$;
  readonly view$=combineLatest([this.route.paramMap,this.facade.activeTournament$]).pipe(map(([params,tournament])=>({title:sectionLabels[params.get('section') ?? ''] ?? 'Torneo',tournament})));
}
