import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TournamentFacade } from '../../../application/state/tournament.facade';

@Component({selector:'gl-tournament-home-page',standalone:true,imports:[AsyncPipe,RouterLink],changeDetection:ChangeDetectionStrategy.OnPush,
 templateUrl: './tournament-home.page.html',
 styleUrl: './tournament-home.page.css' })
export class TournamentHomePage { private readonly facade=inject(TournamentFacade); readonly tournament$=this.facade.activeTournament$; }
