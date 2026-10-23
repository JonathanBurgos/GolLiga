import { NotFoundError } from '../../domain/common/domain-error.js';
import { MatchRepository } from '../../domain/matches/match.repository.js';
import { PlayerRepository } from '../../domain/players/player.repository.js';
import { TeamRepository } from '../../domain/teams/team.repository.js';
import { TournamentRepository } from '../../domain/tournaments/tournament.repository.js';

export class InsightsService {
  constructor(private readonly matches: MatchRepository, private readonly tournaments: TournamentRepository, private readonly players: PlayerRepository, private readonly teams: TeamRepository) {}

  async getPlayerStats(playerId: string) {
    const player = await this.players.findById(playerId);
    if (!player) throw new NotFoundError('El jugador');
    const team = await this.teams.findById(player.teamId);
    if (!team) throw new NotFoundError('El equipo del jugador');
    const tournamentId = team.tournamentId;
    const matches = await this.matches.findByTournament(tournamentId);
    const matchesById = new Map(matches.map((match) => [match.id, match]));
    const actions = (await Promise.all(matches.filter((match) => match.status === 'FINISHED').map((match) => this.matches.findEvents(match.id))))
      .flat().filter((event) => event.playerId === playerId);
    const cards = actions.filter((event) => event.type === 'RED_CARD');
    const suspensions = await Promise.all(cards.map(async (card) => {
      const match = matchesById.get(card.matchId)!;
      const fixtures = await this.matches.listTeamFixtures(tournamentId, card.teamId);
      const served = fixtures.filter((fixture) => fixture.isFinished && fixture.round > match.round).length;
      const total = card.suspensionMatches ?? 0;
      return { matchId: match.id, round: match.round, dates: total, served: Math.min(total, served), remaining: Math.max(0, total - served) };
    }));
    return {
      player: { id: player.id, name: player.name, jerseyNumber: player.jerseyNumber, position: player.position, status: player.status },
      team: { id: team.id, name: team.name },
      stats: {
        goals: actions.filter((event) => event.type === 'GOAL').length,
        assists: actions.filter((event) => event.type === 'ASSIST').length,
        yellowCards: actions.filter((event) => event.type === 'YELLOW_CARD').length,
        redCards: cards.length,
        fouls: actions.filter((event) => event.type === 'FOUL').length,
        substitutions: actions.filter((event) => event.type === 'SUBSTITUTION').length,
      },
      suspensions,
      actions: actions.map((event) => ({ id: event.id, type: event.type, minute: event.minute, matchId: event.matchId, round: matchesById.get(event.matchId)?.round, details: event.details, createdAt: event.createdAt })),
    };
  }

  async getTournamentInsights(tournamentId: string) {
    if (!(await this.tournaments.findById(tournamentId))) throw new NotFoundError('El torneo');
    const all = await this.matches.findByTournament(tournamentId);
    const completed = all.filter((match) => match.status === 'FINISHED');
    const table = new Map<string, {
      teamId: string; team: string; group: string; played: number; won: number; drawn: number; lost: number;
      goalsFor: number; goalsAgainst: number; fairPlayPoints: number;
    }>();
    const scorers = new Map<string, { playerId: string; name: string; shirtNumber: number; teamId: string; team: string; goals: number; assists: number; yellow: number; red: number }>();
    const fairPlay = new Map<string, { teamId: string; team: string; yellow: number; red: number; fouls: number; points: number }>();
    const suspensions: Array<Record<string, unknown>> = [];

    for (const team of await this.teams.findByTournament(tournamentId)) {
      table.set(team.id, {
        teamId: team.id, team: team.name, group: team.groupName, played: 0, won: 0, drawn: 0,
        lost: 0, goalsFor: 0, goalsAgainst: 0, fairPlayPoints: 0,
      });
    }

    for (const match of all) {
      for (const side of [match.homeTeam, match.awayTeam]) {
        if (!table.has(side.id)) table.set(side.id, {
          teamId: side.id, team: side.name, group: match.groupName, played: 0, won: 0, drawn: 0,
          lost: 0, goalsFor: 0, goalsAgainst: 0, fairPlayPoints: 0,
        });
      }
      const events = match.status === 'FINISHED' ? await this.matches.findEvents(match.id) : [];
      let homeGoals = 0;
      let awayGoals = 0;
      for (const event of events) {
        if (event.type === 'GOAL') {
          if (event.teamId === match.homeTeamId) homeGoals++;
          if (event.teamId === match.awayTeamId) awayGoals++;
        }
        const scorer = scorers.get(event.playerId) ?? {
          playerId: event.playerId, name: event.player.name, shirtNumber: event.player.jerseyNumber,
          teamId: event.teamId, team: event.teamId === match.homeTeamId ? match.homeTeam.name : match.awayTeam.name,
          goals: 0, assists: 0, yellow: 0, red: 0,
        };
        if (event.type === 'GOAL') scorer.goals++;
        if (event.type === 'ASSIST') scorer.assists++;
        if (event.type === 'YELLOW_CARD') scorer.yellow++;
        if (event.type === 'RED_CARD') scorer.red++;
        scorers.set(event.playerId, scorer);

        const teamName = event.teamId === match.homeTeamId ? match.homeTeam.name : match.awayTeam.name;
        const discipline = fairPlay.get(event.teamId) ?? { teamId: event.teamId, team: teamName, yellow: 0, red: 0, fouls: 0, points: 0 };
        if (event.type === 'YELLOW_CARD') { discipline.yellow++; discipline.points += 1; }
        if (event.type === 'RED_CARD') { discipline.red++; discipline.points += 3; }
        if (event.type === 'FOUL') { discipline.fouls++; discipline.points += 1; }
        fairPlay.set(event.teamId, discipline);
        const row = table.get(event.teamId);
        if (row && ['YELLOW_CARD', 'RED_CARD', 'FOUL'].includes(event.type)) row.fairPlayPoints += event.type === 'RED_CARD' ? 3 : 1;

        if (event.type === 'RED_CARD' || event.type === 'SANCTION') {
          const fixtures = await this.matches.listTeamFixtures(tournamentId, event.teamId);
          const served = event.type === 'RED_CARD'
            ? fixtures.filter((fixture) => fixture.isFinished && fixture.round > match.round).length
            : 0;
          const total = event.suspensionMatches ?? 0;
          suspensions.push({
            id: event.id, matchId: match.id, match: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
            type: event.type, playerId: event.player.id, player: event.player.name,
            jerseyNumber: event.player.jerseyNumber, teamId: event.teamId, team: event.teamId === match.homeTeamId ? match.homeTeam.name : match.awayTeam.name,
            suspensionMatches: total, suspensionServed: Math.min(total, served), suspensionRemaining: Math.max(0, total - served),
            suspensionFrom: event.suspensionFrom, suspensionTo: event.suspensionTo, details: event.details,
          });
        }
      }
      if (match.status === 'FINISHED') {
        const home = table.get(match.homeTeamId)!;
        const away = table.get(match.awayTeamId)!;
        home.played++; away.played++;
        home.goalsFor += homeGoals; home.goalsAgainst += awayGoals;
        away.goalsFor += awayGoals; away.goalsAgainst += homeGoals;
        if (homeGoals > awayGoals) { home.won++; away.lost++; }
        else if (homeGoals < awayGoals) { away.won++; home.lost++; }
        else { home.drawn++; away.drawn++; }
      }
    }
    const standings = [...table.values()].map((row) => ({
      ...row,
      goalDifference: row.goalsFor - row.goalsAgainst,
      points: row.won * 3 + row.drawn,
    })).sort((a, b) => a.group.localeCompare(b.group) || b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor)
      .map((row, index, rows) => ({ ...row, position: rows.slice(0, index).filter((other) => other.group === row.group).length + 1 }));
    const results = completed.map((match) => ({
      id: match.id, homeTeam: match.homeTeam.name, awayTeam: match.awayTeam.name,
      homeScore: match.homeScore, awayScore: match.awayScore, round: match.round,
      groupName: match.groupName, scheduledAt: match.scheduledAt,
    }));
    return {
      results, standings,
      scorers: [...scorers.values()].sort((a, b) => b.goals - a.goals || b.assists - a.assists),
      fairPlay: [...fairPlay.values()].sort((a, b) => a.points - b.points || b.fouls - a.fouls),
      suspensions,
      totals: {
        matchesPlayed: completed.length,
        goals: [...scorers.values()].reduce((total, player) => total + player.goals, 0),
        assists: [...scorers.values()].reduce((total, player) => total + player.assists, 0),
      },
    };
  }
}
