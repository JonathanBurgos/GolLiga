import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminSessionService } from '../services/admin-session.service';
import { finalize } from 'rxjs';

@Component({selector:'gl-admin-access-page',standalone:true,imports:[FormsModule,RouterLink],changeDetection:ChangeDetectionStrategy.OnPush,
 templateUrl: './admin-access.page.html',
 styleUrl: './admin-access.page.css' })
export class AdminAccessPage {
 private readonly session=inject(AdminSessionService);private readonly router=inject(Router);private readonly route=inject(ActivatedRoute);
 email='';password='';error='';submitted=false;
 submitting=false;
 submit(form:NgForm):void{this.submitted=true;this.error='';if(form.invalid){form.control.markAllAsTouched();return;}this.submitting=true;this.session.signIn(this.email.trim(),this.password).pipe(finalize(()=>this.submitting=false)).subscribe({next:role=>{const target=this.route.snapshot.queryParamMap.get('returnUrl');this.router.navigateByUrl(role==='Gestor'?'/admin/planilla':target?.startsWith('/admin')?target:'/admin');},error:(err:unknown)=>{this.error=err instanceof HttpErrorResponse&&err.status===401?'El usuario o la contraseña no son correctos.':'No fue posible iniciar sesión. Inténtalo de nuevo.';}});}
 clearError():void{this.error='';}
}
