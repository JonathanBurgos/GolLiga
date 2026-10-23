import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { AdminSessionService } from '../services/admin-session.service';
import { AdminIconComponent } from '../../../design-system/atoms/admin-icon.component';

@Component({selector:'gl-admin-shell',standalone:true,imports:[NgIf,RouterLink,RouterLinkActive,RouterOutlet,AdminIconComponent],changeDetection:ChangeDetectionStrategy.OnPush,
 templateUrl: './admin-shell.component.html',
 styleUrl: './admin-shell.component.css' })
export class AdminShellComponent {readonly session=inject(AdminSessionService);private readonly router=inject(Router);signOut():void{this.session.signOut();this.router.navigateByUrl('/');}}
