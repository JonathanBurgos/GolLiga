import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map, of, shareReplay, switchMap, catchError } from 'rxjs';
import { AdminWorkspaceFacade } from '../../../application/state/admin-workspace.facade';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'gl-admin-tournament-detail-page',
  standalone: true,
  imports: [AsyncPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-tournament-detail.page.html',
  styleUrl: './admin-tournament-detail.page.css'
})
export class AdminTournamentDetailPage {
  private readonly route=inject(ActivatedRoute);
  private readonly workspace=inject(AdminWorkspaceFacade);
  private readonly http=inject(HttpClient);
  readonly teams$=this.route.paramMap.pipe(map(params=>params.get('tournamentId')),switchMap(id=>id?this.http.get<Array<{id:string;name:string;groupName:string}>>(`${environment.apiUrl}/tournaments/${id}/teams`):of([])),catchError(()=>of([])),shareReplay({bufferSize:1,refCount:true}));
  readonly matches$=this.route.paramMap.pipe(map(params=>params.get('tournamentId')),switchMap(id=>id?this.http.get<Array<{id:string;round:number;groupName:string;scheduledAt:string;venue:string;status:string;homeTeam:{name:string};awayTeam:{name:string}}>>(`${environment.apiUrl}/tournaments/${id}/matches`):of([])),map(rows=>rows.map(row=>({...row,group:row.groupName,date:new Date(row.scheduledAt).toLocaleString('es-CO'),home:row.homeTeam.name,away:row.awayTeam.name,status:row.status==='FINISHED'?'Finalizado':row.status==='IN_PROGRESS'?'En juego':'Programado'}))),catchError(()=>of([])),shareReplay({bufferSize:1,refCount:true}));
  readonly groupNames$=this.teams$.pipe(map(teams=>[...new Set(teams.map(team=>team.groupName))]));
  readonly groups$=this.groupNames$.pipe(map(groups=>groups.length));
  readonly goals$=this.route.paramMap.pipe(map(params=>params.get('tournamentId')),switchMap(id=>id?this.http.get<{totals:{goals:number}}>(`${environment.apiUrl}/tournaments/${id}/insights`):of({totals:{goals:0}})),map(result=>result.totals.goals),catchError(()=>of(0)));
  teamsInGroup(teams:readonly {groupName:string}[],group:string):number{return teams.filter(team=>team.groupName===group).length;}
  readonly tournament$=this.route.paramMap.pipe(map(params=>params.get('tournamentId')),switchMap(id=>this.workspace.collection('torneos').pipe(map(rows=>rows.find(row=>row.id===id)??null))),shareReplay({bufferSize:1,refCount:true}));
}
