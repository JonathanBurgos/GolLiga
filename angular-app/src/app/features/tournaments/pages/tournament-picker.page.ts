import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TournamentFacade } from '../../../application/state/tournament.facade';
import { TournamentCardComponent } from '../../../design-system/molecules/tournament-card.component';

@Component({selector:'gl-tournament-picker-page',standalone:true,imports:[AsyncPipe,RouterLink,TournamentCardComponent],changeDetection:ChangeDetectionStrategy.OnPush,
 templateUrl: './tournament-picker.page.html',
 styleUrl: './tournament-picker.page.css' })
export class TournamentPickerPage { private readonly facade=inject(TournamentFacade); readonly tournaments$=this.facade.tournaments$; }
