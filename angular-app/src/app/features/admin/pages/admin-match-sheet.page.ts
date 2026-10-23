import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, tap } from 'rxjs';
import { AdminMatchSheetFacade, MatchEventType, MatchSheetEvent } from '../../../application/state/admin-match-sheet.facade';
import { AdminSessionService } from '../services/admin-session.service';
import { AdminRecord, AdminWorkspaceFacade } from '../../../application/state/admin-workspace.facade';

@Component({selector:'gl-admin-match-sheet-page',standalone:true,imports:[AsyncPipe,FormsModule],changeDetection:ChangeDetectionStrategy.OnPush,
 templateUrl:'./admin-match-sheet.page.html',styleUrl:'./admin-match-sheet.page.css'})
export class AdminMatchSheetPage {
 private readonly facade=inject(AdminMatchSheetFacade);
 private readonly workspace=inject(AdminWorkspaceFacade);
 readonly session=inject(AdminSessionService);
 readonly matches$=this.facade.matches$.pipe(tap(matches=>{if(!this.matchId&&matches.length)this.selectMatch(matches[0].id);}));
 private readonly selectedMatchId=new BehaviorSubject('');
 private readonly selectedTeam=new BehaviorSubject('');
 readonly roster$=combineLatest([this.workspace.collection('jugadores'),this.selectedMatchId,this.selectedTeam,this.facade.events$]).pipe(map(([players,matchId,team])=>players.filter(player=>player.teamName===team).map(player=>({...player,suspended:this.facade.isSuspended(matchId,team,player.jerseyNumber??0)}))));
 readonly eventTypes:readonly MatchEventType[]=['Gol','Asistencia','Tarjeta amarilla','Tarjeta roja','Falta','Sanción','Sustitución'];
 readonly viewModel$=combineLatest([this.facade.matches$,this.selectedMatchId,this.facade.events$]).pipe(map(([matches,matchId,allEvents])=>{
  const match=matches.find(item=>item.id===matchId)??matches[0];
  if(!match)return null;
  const events=allEvents.filter(item=>item.matchId===match.id).slice().sort((a,b)=>a.minute-b.minute);
  return {match,events,goals:events.filter(item=>item.type==='Gol').length,yellow:events.filter(item=>item.type==='Tarjeta amarilla').length,red:events.filter(item=>item.type==='Tarjeta roja').length,fouls:events.filter(item=>item.type==='Falta').length,sanctions:events.filter(item=>item.type==='Sanción').length,homeScore:events.filter(item=>item.type==='Gol'&&item.team===match.home).length,awayScore:events.filter(item=>item.type==='Gol'&&item.team===match.away).length};
 }));
 matchId='';type:MatchEventType='Gol';minute=1;team='';playerNumber:number|null=null;relatedNumber:number|null=null;suspensionMatches=1;player='';relatedPlayer='';details='';suspensionFrom='';suspensionTo='';success='';error='';
 selectMatch(id:string):void{this.matchId=id;this.selectedMatchId.next(id);this.team=this.facade.match(id)?.home??'';this.selectedTeam.next(this.team);this.playerNumber=null;this.relatedNumber=null;this.success='';this.error='';}
 selectTeam(team:string):void{this.team=team;this.selectedTeam.next(team);this.playerNumber=null;this.relatedNumber=null;}
 onTypeChange():void{this.success='';this.error='';}
 record():void{
  const matchId=this.matchId;const eventType=this.type;
  const selected:AdminRecord|undefined=this.workspace.player(this.team,Number(this.playerNumber));
  const related:AdminRecord|undefined=this.relatedNumber?this.workspace.player(this.team,Number(this.relatedNumber)):undefined;
  if(!selected){this.error='Selecciona un jugador registrado de la plantilla de este equipo.';return;}
  if(this.facade.isSuspended(matchId,this.team,selected.jerseyNumber??0)){this.error=`El jugador #${selected.jerseyNumber} tiene fechas de sanción pendientes.`;return;}
  if((eventType==='Asistencia'||eventType==='Sustitución')&&!related){this.error='Selecciona también al jugador relacionado de la plantilla.';return;}
  if(eventType==='Sanción'&&(!this.suspensionFrom||!this.suspensionTo||this.suspensionTo<this.suspensionFrom)){this.error='Indica un rango válido: la fecha final debe ser igual o posterior a la inicial.';return;}
  if(eventType==='Tarjeta roja'&&(!Number.isInteger(Number(this.suspensionMatches))||Number(this.suspensionMatches)<1)){this.error='Indica cuántas fechas siguientes debe cumplir el jugador.';return;}
  if(eventType==='Gol'&&this.relatedNumber&&!related){this.error='Selecciona un asistente válido de la plantilla.';return;}
  this.facade.add({matchId,minute:Number(this.minute)||0,type:eventType,team:this.team,teamId:selected.teamId??'',player:selected.name,playerId:selected.id,shirtNumber:selected.jerseyNumber??0,relatedPlayer:related?.name,relatedPlayerId:related?.id,relatedShirtNumber:related?.jerseyNumber,details:this.details.trim()||undefined,suspensionFrom:eventType==='Sanción'?this.suspensionFrom:undefined,suspensionTo:eventType==='Sanción'?this.suspensionTo:undefined,suspensionMatches:eventType==='Tarjeta roja'?Number(this.suspensionMatches):undefined}).subscribe({next:()=>{this.playerNumber=null;this.relatedNumber=null;this.details='';this.suspensionFrom='';this.suspensionTo='';this.suspensionMatches=1;this.success='Acontecimiento guardado en la base de datos.';this.error='';},error:()=>{this.error='No se pudo guardar el acontecimiento. Verifica permisos y datos de la planilla.';this.success='';}});
 }
 remove(event:MatchSheetEvent):void{this.facade.remove(event.id).subscribe({error:()=>this.error='No se pudo eliminar el acontecimiento.'});}
 finish():void{this.facade.finish(this.matchId).subscribe({next:()=>{this.success='Partido finalizado. El resultado y las estadísticas ya están actualizados.';this.error='';},error:()=>this.error='No se pudo finalizar el partido. Verifica que los datos estén completos.'});}
 reopen():void{this.facade.reopen(this.matchId).subscribe({next:()=>{this.success='Planilla reabierta para hacer correcciones.';this.error='';},error:()=>this.error='No se pudo reabrir la planilla. Se requiere permiso de administrador.'});}
 crest(_team:string):string{return 'assets/asset-01.svg';}
}
