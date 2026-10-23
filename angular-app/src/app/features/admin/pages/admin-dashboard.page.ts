import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminWorkspaceFacade } from '../../../application/state/admin-workspace.facade';

@Component({selector:'gl-admin-dashboard-page',standalone:true,imports:[AsyncPipe,RouterLink],changeDetection:ChangeDetectionStrategy.OnPush,templateUrl:'./admin-dashboard.page.html',styleUrl:'./admin-dashboard.page.css'})
export class AdminDashboardPage {
 private readonly workspace=inject(AdminWorkspaceFacade);
 readonly metrics$=this.workspace.metrics$;
 readonly fixture$=this.workspace.collection('fixture');
 readonly results$=this.workspace.recentResults$;
 readonly standings$=this.workspace.collection('posiciones');
 readonly leaders$=this.workspace.collection('estadisticas');
 readonly reviews$=this.fixture$;
}
