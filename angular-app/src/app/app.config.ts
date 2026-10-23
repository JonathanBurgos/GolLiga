import { ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { TOURNAMENT_REPOSITORY } from './application/tokens';
import { ApiTournamentRepository } from './infrastructure/repositories/api-tournament.repository';
import { authInterceptor } from './infrastructure/http/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: TOURNAMENT_REPOSITORY, useClass: ApiTournamentRepository }
  ]
};
