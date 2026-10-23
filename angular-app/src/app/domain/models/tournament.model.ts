export interface Tournament {
  readonly id: string;
  readonly name: string;
  readonly competition: string;
  readonly status: 'En curso' | 'Próximamente' | 'Datos pendientes';
  readonly teamCount: number;
  readonly season: number;
  readonly summary: string;
}

export type TournamentSection = 'inicio' | 'equipos' | 'jugadores' | 'grupos' | 'fixture' | 'resultados' | 'posiciones' | 'estadisticas' | 'fair-play';
