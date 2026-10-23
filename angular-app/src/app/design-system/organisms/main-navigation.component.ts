import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({ selector:'gl-main-navigation', standalone:true, imports:[RouterLink,RouterLinkActive], changeDetection:ChangeDetectionStrategy.OnPush,
  templateUrl: './main-navigation.component.html',
  styleUrl: './main-navigation.component.css' })
export class MainNavigationComponent { readonly tournamentId=input.required<string>(); }
