import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({selector:'gl-admin-icon',standalone:true,changeDetection:ChangeDetectionStrategy.OnPush,
 templateUrl: './admin-icon.component.html',
 styleUrl: './admin-icon.component.css'})
export class AdminIconComponent {readonly name=input.required<string>();}
