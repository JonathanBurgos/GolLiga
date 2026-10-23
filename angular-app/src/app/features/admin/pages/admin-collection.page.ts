import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest, map, Observable, shareReplay, switchMap } from 'rxjs';
import { AdminRecord, AdminSectionKey, AdminWorkspaceFacade } from '../../../application/state/admin-workspace.facade';
import { AdminMatchSheetFacade, DerivedStanding } from '../../../application/state/admin-match-sheet.facade';
import { ConfirmationDialogService } from '../../../application/state/confirmation-dialog.service';
import { FeedbackStateComponent } from '../../../design-system/molecules/feedback-state.component';
import { NotificationService } from '../../../application/state/notification.service';

const sections: Record<AdminSectionKey,{title:string;description:string;singular:string;action:string}> = {
  torneos:{title:'Torneos',description:'Crea y administra las competencias de tu organización.',singular:'torneo',action:'Crear torneo'},
  equipos:{title:'Equipos',description:'Gestiona clubes, grupos y estado de inscripción.',singular:'equipo',action:'Añadir equipo'},
  jugadores:{title:'Jugadores',description:'Administra plantillas y datos de jugadores.',singular:'jugador',action:'Añadir jugador'},
  fixture:{title:'Fixture',description:'Organiza los próximos encuentros y sus jornadas.',singular:'partido',action:'Programar partido'},
  resultados:{title:'Resultados',description:'Registra marcadores y publica los resultados.',singular:'resultado',action:'Añadir resultado'},
  posiciones:{title:'Tabla de posiciones',description:'Consulta y administra la clasificación por grupo.',singular:'equipo',action:''},
  estadisticas:{title:'Estadísticas',description:'Resumen de actividad competitiva y rendimiento.',singular:'registro',action:''},
  fairplay:{title:'Tabla de Fair Play',description:'Consulta el puntaje disciplinario calculado con tarjetas y faltas.',singular:'equipo',action:''},
  sancionados:{title:'Jugadores sancionados',description:'Revisa las fechas de suspensión registradas en las planillas.',singular:'jugador',action:''},
  configuracion:{title:'Configuración',description:'Preferencias de la organización y permisos de acceso.',singular:'ajuste',action:''}
};
const validKeys = Object.keys(sections) as AdminSectionKey[];
interface StandingRow { readonly rank:number; readonly team:string; readonly crest:string; readonly played:number; readonly won:number; readonly drawn:number; readonly lost:number; readonly goalsFor:number; readonly goalsAgainst:number; readonly points:number; readonly group?:string; }

@Component({
  selector:'gl-admin-collection-page', standalone:true, imports:[AsyncPipe,FormsModule,RouterLink,FeedbackStateComponent], changeDetection:ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-collection.page.html',
  styleUrl: './admin-collection.page.css'
})
export class AdminCollectionPage {
  private readonly route=inject(ActivatedRoute);
  private readonly workspace=inject(AdminWorkspaceFacade);
  private readonly confirmations=inject(ConfirmationDialogService);
  private readonly notifications=inject(NotificationService);
  readonly matchSheet=inject(AdminMatchSheetFacade);
  readonly insights$=this.matchSheet.insights$;
  private readonly querySubject=new BehaviorSubject('');
  private readonly groupSubject=new BehaviorSubject('Todos');
  readonly groupFilter$=this.groupSubject.asObservable();
  readonly standings$:Observable<readonly StandingRow[]>=combineLatest([this.groupSubject,this.insights$]).pipe(map(([group,insights])=>{
    const rows:StandingRow[]=insights.standings.map((row:DerivedStanding)=>({...row,rank:row.position,crest:'assets/asset-01.svg'}));
    const filtered=group==='General'||group==='Todos'?rows:rows.filter(row=>row.group===group);
    return group==='General'||group==='Todos'?[...filtered].sort((a,b)=>b.points-a.points||b.goalsFor-a.goalsFor).map((row,index)=>({...row,rank:index+1})):filtered;
  }));
  readonly view$=this.route.paramMap.pipe(map(params=>params.get('section') ?? ''),map(section=>{const key=validKeys.includes(section as AdminSectionKey)?section as AdminSectionKey:'configuracion';return {key,config:sections[key]};}),shareReplay({bufferSize:1,refCount:true}));
  readonly records$=this.view$.pipe(switchMap(view=>this.workspace.collection(view.key)));
  readonly teams$=this.workspace.collection('equipos');
  readonly teamsLoadError$=this.workspace.teamsLoadError$;
  readonly groupOptions$=this.teams$.pipe(map(rows=>['Todos',...new Set(rows.map(row=>row.groupName).filter((group):group is string=>!!group)),'General']));
  readonly teamGroupOptions$=this.teams$.pipe(map(rows=>['Todos',...new Set(rows.map(row=>row.groupName).filter((group):group is string=>!!group))]));
  readonly teamsContext$=this.workspace.teamsContext$;
  private readonly teamGroupSubject=new BehaviorSubject('Todos');
  readonly teamGroupFilter$=this.teamGroupSubject.asObservable();
  private readonly teamStatusSubject=new BehaviorSubject('Todos');
  readonly teamStatusFilter$=this.teamStatusSubject.asObservable();
  readonly filteredTeams$=combineLatest([this.teams$,this.querySubject,this.teamGroupSubject,this.teamStatusSubject]).pipe(map(([teams,query,group,status])=>{
    const q=query.trim().toLocaleLowerCase();
    return teams.filter(team=>(group==='Todos'||team.groupName===group)&&(status==='Todos'||team.status===status)&&(!q||team.name.toLocaleLowerCase().includes(q)));
  }),shareReplay({bufferSize:1,refCount:true}));
  readonly players$=combineLatest([this.workspace.collection('jugadores'),this.querySubject]).pipe(map(([rows,query])=>{const q=query.trim().toLowerCase();return rows.filter(row=>!q||`${row.name} ${row.detail} ${row.teamName??''}`.toLowerCase().includes(q));}));
  readonly filteredRecords$=combineLatest([this.records$,this.querySubject,this.groupSubject,this.view$]).pipe(map(([rows,query,group,view])=>{const q=query.trim().toLowerCase();return rows.filter(row=>(view.key!=='equipos'||group==='Todos'||row.detail.includes(group))&&(!q||`${row.name} ${row.detail} ${row.status}`.toLowerCase().includes(q)));}),shareReplay({bufferSize:1,refCount:true}));
  readonly recordCount$=this.filteredRecords$.pipe(map(rows=>rows.length));
  showCreate=false;newName='';newDetail='';newTeam='';newJerseyNumber:number|null=null;newPosition='';playerError='';query='';editingId:string|null=null;editName='';
  setQuery(value:string):void{this.query=value;this.querySubject.next(value);}
  setGroup(value:string):void{this.groupSubject.next(value);}
  setTeamGroup(value:string):void{this.teamGroupSubject.next(value);}
  setTeamStatus(value:string):void{this.teamStatusSubject.next(value);}
  setTeamView(value:'cards'|'table'):void{this.teamView=value;}
  teamView:'cards'|'table'='cards';
  groupIcon(_name:string):string{return 'asset-01.svg';}
  tournamentId(id:string):string{return id;}
  matchName(id:string):string{const match=this.matchSheet.match(id);return match?`${match.home} vs ${match.away}`:id;}
  create(key:AdminSectionKey):void{this.workspace.add(key,this.newName,this.newDetail);this.newName='';this.newDetail='';this.showCreate=false;}
  createPlayer():void{this.workspace.addPlayer(this.newName,this.newTeam,Number(this.newJerseyNumber),this.newPosition).subscribe({next:ok=>{if(!ok){this.playerError='Selecciona un equipo y un número de camiseta válido.';this.notifications.error('No se pudo guardar','Selecciona un equipo y un número de camiseta válido.');return;}this.newName='';this.newJerseyNumber=null;this.newPosition='';this.playerError='';this.showCreate=false;this.notifications.success('Jugador guardado','El jugador se agregó correctamente a la plantilla.');},error:()=>{this.playerError='No fue posible guardar el jugador en la base de datos.';this.notifications.error('No se pudo guardar',this.playerError);}});}
  edit(record:AdminRecord):void{if(this.editingId===record.id){this.editingId=null;return;}this.editingId=record.id;this.editName=record.name;}
  saveName(key:AdminSectionKey,id:string):void{this.workspace.rename(key,id,this.editName);this.editingId=null;}
  toggle(key:AdminSectionKey,id:string):void{this.workspace.toggleStatus(key,id);}
  async   remove(key:AdminSectionKey,id:string,name='este registro'):Promise<void>{
    const noun=sections[key].singular;
    const confirmed=await this.confirmations.confirm({
      title:`¿Eliminar ${noun}?`,
      message:`Se eliminará «${name}». Esta acción no se puede deshacer.`,
      confirmLabel:'Eliminar',
      tone:'danger'
    });
    if(confirmed)this.workspace.remove(key,id);
  }
}
