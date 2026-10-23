import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { PlayerFacade } from '../../../application/state/player.facade';
import { PlayerStatCardComponent } from '../../../design-system/molecules/player-stat-card.component';

@Component({selector:'gl-player-profile-page',standalone:true,imports:[AsyncPipe,RouterLink,PlayerStatCardComponent],changeDetection:ChangeDetectionStrategy.OnPush,
 templateUrl: './player-profile.page.html',
 styleUrl: './player-profile.page.css' })
export class PlayerProfilePage {
  private readonly route=inject(ActivatedRoute);
  private readonly facade=inject(PlayerFacade);
  readonly tournamentId=this.route.parent?.snapshot.paramMap.get('tournamentId') ?? '';
  readonly player$=this.route.paramMap.pipe(map(params=>params.get('playerId') ?? ''),switchMap(id=>this.facade.profileFor(id)));
}
