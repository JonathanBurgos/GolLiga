import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, combineLatest, forkJoin, map, of, shareReplay, startWith, switchMap, tap, throwError } from 'rxjs';
import { NotificationService } from './notification.service';
import { environment } from '../../../environments/environment';

export type AdminSectionKey='torneos'|'equipos'|'jugadores'|'fixture'|'resultados'|'posiciones'|'estadisticas'|'fairplay'|'sancionados'|'configuracion';
export interface AdminRecord { readonly id:string; readonly name:string; readonly detail:string; readonly status:string; readonly score?:string; readonly teamName?:string; readonly teamId?:string; readonly jerseyNumber?:number; readonly position?:string; readonly groupName?:string; readonly homeTeamId?:string; readonly awayTeamId?:string; readonly round?:number; readonly scheduledAt?:string; readonly shortName?:string; readonly crestUrl?:string|null; readonly primaryColor?:string; readonly enrollmentStatus?:string; readonly activePlayerCount?:number; readonly played?:number; readonly won?:number; readonly drawn?:number; readonly lost?:number; readonly goalDifference?:number; readonly points?:number; readonly competition?:string; readonly season?:number; }
export interface AdminMetrics { readonly tournaments:number; readonly teams:number; readonly players:number; readonly matches:number; readonly pending:number; }
interface Tournament { id:string; name:string; season:number; competition:string; status:string; startDate?:string|null; endDate?:string|null; }
interface Team { id:string; tournamentId:string; name:string; shortName:string; groupName:string; crestUrl?:string|null; primaryColor:string; status:string; enrollmentStatus:string; activePlayerCount?:number; players?: Player[]; }
interface Player { id:string; teamId:string; name:string; jerseyNumber:number; position:string; status:string; }
interface Match { id:string; tournamentId:string; homeTeamId:string; awayTeamId:string; homeTeam:{id:string;name:string}; awayTeam:{id:string;name:string}; round:number; groupName:string; scheduledAt:string; venue?:string|null; status:string; homeScore:number; awayScore:number; }
interface Insights { results:Match[]; standings:Array<{teamId:string;team:string;group:string;played:number;won:number;drawn:number;lost:number;goalsFor:number;goalsAgainst:number;goalDifference:number;points:number;position:number}>; scorers:Array<{playerId:string;name:string;shirtNumber:number;teamId:string;team:string;goals:number;assists:number;yellow:number;red:number}>; fairPlay:Array<{teamId:string;team:string;yellow:number;red:number;fouls:number;points:number}>; suspensions:Array<Record<string,unknown>>; totals:{matchesPlayed:number;goals:number;assists:number}; }
export interface AdminTournamentContext { readonly id:string; readonly name:string; readonly competition:string; readonly season:number; }

@Injectable({providedIn:'root'})
export class AdminWorkspaceFacade {
 private readonly http=inject(HttpClient);
 private readonly base=environment.apiUrl;
 private readonly notifications=inject(NotificationService);
 private readonly refresh$=new BehaviorSubject(0);
 private readonly lastErrorSubject=new BehaviorSubject<string|null>(null);
 readonly error$=this.lastErrorSubject.asObservable();
 private readonly teamsLoadErrorSubject=new BehaviorSubject<string|null>(null);
 readonly teamsLoadError$=this.teamsLoadErrorSubject.asObservable();
 private playerCache:readonly AdminRecord[]=[];
 private readonly reload$=this.refresh$.pipe(startWith(0));
 private tournaments():Observable<Tournament[]>{return this.http.get<Tournament[]>(`${this.base}/tournaments`).pipe(catchError(()=>of([])));}
 private firstTournament():Observable<Tournament|null>{return this.tournaments().pipe(map(items=>items[0]??null));}
 private teamsFor(tournamentId:string):Observable<Team[]>{this.teamsLoadErrorSubject.next(null);return this.http.get<Team[]>(`${this.base}/tournaments/${tournamentId}/teams`).pipe(catchError(()=>{this.teamsLoadErrorSubject.next('No se pudo cargar el listado de equipos. Revisa tu conexión e inténtalo de nuevo.');return of([]);}));}
 private matchesFor(tournamentId:string):Observable<Match[]>{return this.http.get<Match[]>(`${this.base}/tournaments/${tournamentId}/matches`).pipe(catchError(()=>of([])));}
 private insightsFor(tournamentId:string):Observable<Insights|null>{return this.http.get<Insights>(`${this.base}/tournaments/${tournamentId}/insights`).pipe(catchError(()=>of(null)));}
 private tournamentRecords():Observable<AdminRecord[]>{return this.tournaments().pipe(map(rows=>rows.map(row=>({id:row.id,name:row.name,detail:`${row.competition} · ${row.season}`,status:this.tournamentStatus(row.status)}))));}
 private teamRecords():Observable<AdminRecord[]>{return this.firstTournament().pipe(switchMap(tournament=>tournament?forkJoin([this.teamsFor(tournament.id),this.insightsFor(tournament.id)]).pipe(map(([teams,insights])=>teams.map(team=>{const standing=insights?.standings.find(row=>row.teamId===team.id);return{id:team.id,name:team.name,detail:team.groupName,status:this.activeStatus(team.status),teamId:team.id,groupName:team.groupName,shortName:team.shortName,crestUrl:team.crestUrl,primaryColor:team.primaryColor,enrollmentStatus:team.enrollmentStatus,activePlayerCount:team.activePlayerCount??team.players?.length??0,played:standing?.played,won:standing?.won,drawn:standing?.drawn,lost:standing?.lost,goalDifference:standing?.goalDifference,points:standing?.points,competition:tournament.competition,season:tournament.season};}))):of([])));}
 private asyncPlayerRecords():Observable<AdminRecord[]>{
  return this.firstTournament().pipe(
   switchMap(tournament=>{
    if(!tournament)return of([] as AdminRecord[]);
    return this.teamsFor(tournament.id).pipe(switchMap(teams=>{
     if(!teams.length)return of([] as AdminRecord[]);
     return forkJoin(teams.map(team=>this.http.get<Player[]>(`${this.base}/teams/${team.id}/players`).pipe(
      map(players=>players.map(player=>({id:player.id,name:player.name,teamName:team.name,teamId:team.id,jerseyNumber:player.jerseyNumber,position:player.position,detail:`#${player.jerseyNumber} · ${team.name} · ${player.position}`,status:this.activeStatus(player.status)} as AdminRecord))),
      catchError(()=>of([] as AdminRecord[]))
     ))).pipe(map(groups=>groups.flat()));
    }));
   }),tap(rows=>this.playerCache=rows)
  );
 }
 private matchRecords(includeFinished:boolean):Observable<AdminRecord[]>{return this.firstTournament().pipe(switchMap(tournament=>tournament?this.matchesFor(tournament.id):of([])),map(matches=>matches.filter(match=>includeFinished||match.status!=='FINISHED').map(match=>this.matchRecord(match))));}
 private matchRecord(match:Match):AdminRecord{return{id:match.id,name:`${match.homeTeam.name} vs ${match.awayTeam.name}`,detail:`J${match.round} · ${match.groupName} · ${new Date(match.scheduledAt).toLocaleString('es-CO')}${match.venue?` · ${match.venue}`:''}`,score:match.status==='FINISHED'?`${match.homeScore} – ${match.awayScore}`:undefined,status:this.matchStatus(match.status),homeTeamId:match.homeTeamId,awayTeamId:match.awayTeamId,groupName:match.groupName,round:match.round,scheduledAt:match.scheduledAt};}
 collection(key:AdminSectionKey):Observable<readonly AdminRecord[]>{return this.reload$.pipe(switchMap(()=>this.recordsFromDatabase(key)),shareReplay({bufferSize:1,refCount:true}));}
 readonly teamsContext$:Observable<AdminTournamentContext|null>=this.reload$.pipe(switchMap(()=>this.firstTournament()),map(tournament=>tournament?({id:tournament.id,name:tournament.name,competition:tournament.competition,season:tournament.season}):null),shareReplay({bufferSize:1,refCount:true}));
 private recordsFromDatabase(key:AdminSectionKey):Observable<AdminRecord[]>{
  switch(key){
   case 'torneos':return this.tournamentRecords();
   case 'equipos':return this.teamRecords();
   case 'jugadores':return this.asyncPlayerRecords();
   case 'fixture':return this.matchRecords(false);
   case 'resultados':return this.matchRecords(true).pipe(map(rows=>rows.filter(row=>row.status==='Finalizado')));
   case 'posiciones':return this.firstTournament().pipe(switchMap(t=>t?this.insightsFor(t.id):of(null)),map(i=>(i?.standings??[]).map(row=>({id:row.teamId,name:`${row.position} · ${row.team}`,detail:`${row.group} · ${row.played} PJ · ${row.goalDifference} DG`,status:`${row.points} pts`,teamName:row.team,groupName:row.group}))));
   case 'estadisticas':return this.firstTournament().pipe(switchMap(t=>t?this.insightsFor(t.id):of(null)),map(i=>(i?.scorers??[]).map(row=>({id:row.playerId,name:row.name,detail:`${row.team} · #${row.shirtNumber} · ${row.assists} asistencias`,status:`${row.goals} goles`,teamName:row.team,teamId:row.teamId,jerseyNumber:row.shirtNumber}))));
   case 'fairplay':return this.firstTournament().pipe(switchMap(t=>t?this.insightsFor(t.id):of(null)),map(i=>(i?.fairPlay??[]).map(row=>({id:row.teamId,name:row.team,detail:`${row.yellow} amarillas · ${row.red} rojas · ${row.fouls} faltas`,status:`${row.points} pts`,teamName:row.team}))));
   case 'sancionados':return this.firstTournament().pipe(switchMap(t=>t?this.insightsFor(t.id):of(null)),map(i=>(i?.suspensions??[]).map(item=>({id:String(item['id']),name:String(item['player']),detail:`${item['team']} · ${item['suspensionMatches']} fechas`,status:`${item['suspensionRemaining']} pendientes`,teamName:String(item['team'])}))));
   case 'configuracion':return this.http.get<Array<{id:string;displayName:string;email:string;role:string;isActive:boolean}>>(`${this.base}/users`).pipe(map(users=>users.map(user=>({id:user.id,name:user.displayName,detail:user.email,status:`${user.role} · ${user.isActive?'Activo':'Inactivo'}`}))),catchError(()=>of([])));
  }
 }
 readonly metrics$:Observable<AdminMetrics>=combineLatest([this.collection('torneos'),this.collection('equipos'),this.collection('jugadores'),this.collection('fixture'),this.collection('resultados')]).pipe(map(([tournaments,teams,players,fixtures,results])=>({tournaments:tournaments.length,teams:teams.length,players:players.length,matches:fixtures.length+results.length,pending:fixtures.length})),shareReplay({bufferSize:1,refCount:true}));
 readonly recentResults$=this.collection('resultados');
 player(teamName:string,jerseyNumber:number):AdminRecord|undefined{return this.playerCache.find(row=>row.teamName===teamName&&row.jerseyNumber===jerseyNumber);}
 add(key:AdminSectionKey,name:string,detail:string):void{
  if(key==='torneos'){
   const season=Number(detail.match(/20\d{2}/)?.[0]??new Date().getFullYear());
   this.write(this.http.post(`${this.base}/tournaments`,{name:name.trim(),season,competition:detail.split('·')[0]?.trim()||'Fútbol'}),'Torneo creado correctamente.');
  }else if(key==='equipos'){
   this.write(this.firstTournament().pipe(switchMap(t=>t?this.http.post(`${this.base}/tournaments/${t.id}/teams`,{name:name.trim(),groupName:detail.trim()||'Grupo A'}):throwError(()=>new Error('No hay un torneo disponible para registrar el equipo.')))),'Equipo registrado correctamente.');
  }else if(key==='fixture'){
   const [home,away]=name.split(/\s+vs\s+/i).map(value=>value.trim());
   this.write(this.firstTournament().pipe(switchMap(t=>t?this.teamsFor(t.id).pipe(switchMap(teams=>{const h=teams.find(item=>item.name===home),a=teams.find(item=>item.name===away);if(!h||!a)return throwError(()=>new Error('Selecciona dos equipos registrados para crear el partido.'));const date=new Date(detail);return this.http.post(`${this.base}/tournaments/${t.id}/matches`,{homeTeamId:h.id,awayTeamId:a.id,round:Number(detail.match(/J(?:ornada)?\s*(\d+)/i)?.[1]??1),groupName:h.groupName,scheduledAt:Number.isNaN(date.getTime())?new Date(Date.now()+86400000).toISOString():date.toISOString()});})):throwError(()=>new Error('No hay un torneo disponible para programar el partido.')))),'Partido programado correctamente.');
  }
 }
 saveTournament(id:string|undefined,input:{name:string;competition:string;season:number;startDate?:string;endDate?:string}):Observable<unknown>{
  const body={...input,...(input.startDate?{startDate:new Date(input.startDate).toISOString()}:{}),...(input.endDate?{endDate:new Date(input.endDate).toISOString()}:{})};
  const request=id?this.http.patch(`${this.base}/tournaments/${id}`,body):this.http.post(`${this.base}/tournaments`,body);
  this.lastErrorSubject.next(null);return request.pipe(tap(()=>this.refresh()));
 }
 addPlayer(name:string,teamName:string,jerseyNumber:number,position:string):Observable<boolean>{
  return this.firstTournament().pipe(switchMap(t=>t?this.teamsFor(t.id).pipe(switchMap(teams=>{const team=teams.find(row=>row.name===teamName);return team?this.http.post(`${this.base}/teams/${team.id}/players`,{name:name.trim(),jerseyNumber,position:position.trim()||'Sin posición'}).pipe(map(()=>true)):of(false);})):of(false)),tap(ok=>{if(ok)this.refresh();}));
 }
 remove(key:AdminSectionKey,id:string):void{const path=key==='torneos'?'tournaments':key==='equipos'?'teams':key==='jugadores'?'players':key==='fixture'?'matches':null;if(path)this.write(this.http.delete(`${this.base}/${path}/${id}`),'Registro eliminado correctamente.');}
 rename(key:AdminSectionKey,id:string,name:string):void{const path=key==='torneos'?'tournaments':key==='equipos'?'teams':key==='jugadores'?'players':null;if(path)this.write(this.http.patch(`${this.base}/${path}/${id}`,{name:name.trim()}),'Nombre actualizado correctamente.');}
 update(key:AdminSectionKey,id:string,changes:Partial<Pick<AdminRecord,'name'|'detail'|'status'>>):void{this.rename(key,id,changes.name??'');}
 toggleStatus(key:AdminSectionKey,id:string):void{
  if(key==='equipos'||key==='jugadores')this.collection(key).pipe(map(rows=>rows.find(row=>row.id===id)),switchMap(row=>row?this.http.patch(`${this.base}/${key==='equipos'?'teams':'players'}/${id}`,{status:row.status==='Activo'?'INACTIVE':'ACTIVE'}):throwError(()=>new Error('No se encontró el registro que quieres actualizar.')))).subscribe({next:()=>{this.refresh();this.notifications.success('Estado actualizado','El cambio se guardó correctamente.');},error:()=>this.notifications.error('No se pudo actualizar','Inténtalo de nuevo. Si el problema continúa, revisa los datos y permisos.')});
  if(key==='torneos')this.firstTournament().pipe(switchMap(t=>t?.id===id?this.http.patch(`${this.base}/tournaments/${id}`,{status:t.status==='ACTIVE'?'FINISHED':'ACTIVE'}):throwError(()=>new Error('No se encontró el torneo seleccionado.')))).subscribe({next:()=>{this.refresh();this.notifications.success('Estado actualizado','El cambio se guardó correctamente.');},error:()=>this.notifications.error('No se pudo actualizar','Inténtalo de nuevo. Si el problema continúa, revisa los datos y permisos.')});
 }
 setScore(_id:string,_home:number,_away:number):void{}
 private write(request:Observable<unknown>,successMessage='Cambios guardados correctamente.'):void{this.lastErrorSubject.next(null);request.subscribe({next:()=>{this.refresh();this.notifications.success('Guardado',successMessage);},error:()=>{const message='No se pudo guardar el cambio. Revisa los datos e inténtalo de nuevo.';this.lastErrorSubject.next(message);this.notifications.error('No se pudo guardar',message);}});}
 private refresh():void{this.refresh$.next(this.refresh$.value+1);}
 private tournamentStatus(status:string):string{return status==='ACTIVE'?'En curso':status==='UPCOMING'?'Próximamente':status==='FINISHED'?'Finalizado':'Borrador';}
 private activeStatus(status:string):string{return status==='ACTIVE'?'Activo':'Inactivo';}
 private matchStatus(status:string):string{return status==='FINISHED'?'Finalizado':status==='IN_PROGRESS'?'En juego':status==='CANCELLED'?'Cancelado':'Programado';}
}
