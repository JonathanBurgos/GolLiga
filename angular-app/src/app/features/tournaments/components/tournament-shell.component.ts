import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { distinctUntilChanged, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TournamentFacade } from '../../../application/state/tournament.facade';
import { MainNavigationComponent } from '../../../design-system/organisms/main-navigation.component';
import { StatusBadgeComponent } from '../../../design-system/atoms/status-badge.component';

@Component({selector:'gl-tournament-shell',standalone:true,imports:[AsyncPipe,RouterLink,RouterOutlet,MainNavigationComponent,StatusBadgeComponent],changeDetection:ChangeDetectionStrategy.OnPush,
 templateUrl: './tournament-shell.component.html',
 styleUrl: './tournament-shell.component.css' })
export class TournamentShellComponent {
  private readonly route=inject(ActivatedRoute);
  private readonly facade=inject(TournamentFacade);
  readonly tournament$=this.facade.activeTournament$;
  constructor(){this.route.paramMap.pipe(map(p=>p.get('tournamentId')),distinctUntilChanged(),takeUntilDestroyed()).subscribe(id=>{if(id)this.facade.selectTournament(id);});}
}
