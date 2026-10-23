import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminSessionService } from '../services/admin-session.service';
import { finalize } from 'rxjs';

@Component({selector:'gl-admin-access-page',standalone:true,imports:[FormsModule,RouterLink],changeDetection:ChangeDetectionStrategy.OnPush,
 templateUrl: './admin-access.page.html',
 styleUrl: './admin-access.page.css' })
export class AdminAccessPage {
 private readonly session=inject(AdminSessionService);private readonly router=inject(Router);private readonly route=inject(ActivatedRoute);
 email='';password='';error='';
 submitting=false;
 submit():void{if(!this.email.trim()||!this.password){this.error='Completa el correo y la contraseña para continuar.';return;}this.error='';this.submitting=true;this.session.signIn(this.email,this.password).pipe(finalize(()=>this.submitting=false)).subscribe(role=>{if(!role){this.error='No fue posible iniciar sesión. Verifica tus credenciales y que la API esté disponible.';return;}const target=this.route.snapshot.queryParamMap.get('returnUrl');this.router.navigateByUrl(role==='Gestor'?'/admin/planilla':target?.startsWith('/admin')?target:'/admin');});}
}
