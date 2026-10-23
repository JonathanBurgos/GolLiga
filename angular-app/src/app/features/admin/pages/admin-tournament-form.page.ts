import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { AdminWorkspaceFacade } from '../../../application/state/admin-workspace.facade';

@Component({selector:'gl-admin-tournament-form-page',standalone:true,imports:[FormsModule,RouterLink],changeDetection:ChangeDetectionStrategy.OnPush,templateUrl:'./admin-tournament-form.page.html',styleUrl:'./admin-tournament-form.page.css'})
export class AdminTournamentFormPage {
 private readonly router=inject(Router);private readonly route=inject(ActivatedRoute);private readonly workspace=inject(AdminWorkspaceFacade);
 readonly tournamentId=this.route.snapshot.paramMap.get('tournamentId')??undefined;readonly isEditing=!!this.tournamentId;
 name='';competition='Fútbol';season=new Date().getFullYear();startDate='';endDate='';error='';saving=false;
 constructor(){if(this.tournamentId)this.workspace.collection('torneos').pipe(take(1)).subscribe(rows=>{const record=rows.find(row=>row.id===this.tournamentId);if(record){this.name=record.name;const [competition,season]=record.detail.split('·').map(value=>value.trim());this.competition=competition??'';this.season=Number(season)||new Date().getFullYear();}});}
 save():void{this.saving=true;this.error='';this.workspace.saveTournament(this.tournamentId,{name:this.name.trim(),competition:this.competition.trim(),season:Number(this.season),startDate:this.startDate||undefined,endDate:this.endDate||undefined}).subscribe({next:()=>{this.saving=false;this.router.navigate(this.tournamentId?['/admin/torneos',this.tournamentId]:['/admin/torneos']);},error:()=>{this.saving=false;this.error='No fue posible guardar el torneo. Verifica los datos e inténtalo de nuevo.';}});}
}
