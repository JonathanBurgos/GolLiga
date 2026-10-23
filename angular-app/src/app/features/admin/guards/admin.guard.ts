import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AdminSessionService } from '../services/admin-session.service';
import { map } from 'rxjs';

export const adminGuard:CanActivateFn=(_route,state)=>{
 const session=inject(AdminSessionService);
 const router=inject(Router);
 return session.restore().pipe(map(authenticated=>authenticated||router.createUrlTree(['/admin/acceso'],{queryParams:{returnUrl:state.url}})));
};

export const adminRoleGuard:CanActivateChildFn=(_route,state)=>{
 const session=inject(AdminSessionService);
 const router=inject(Router);
 return session.restore().pipe(map(authenticated=>{
  if(!authenticated)return router.createUrlTree(['/admin/acceso'],{queryParams:{returnUrl:state.url}});
  if(session.role==='Gestor'&&state.url!=='/admin/planilla')return router.createUrlTree(['/admin/planilla']);
  return true;
 }));
};
