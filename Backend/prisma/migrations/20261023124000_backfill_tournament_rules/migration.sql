INSERT INTO "TournamentRules" ("id", "tournamentId", "updatedAt")
SELECT 'rules_' || tournament."id", tournament."id", CURRENT_TIMESTAMP
FROM "Tournament" AS tournament
WHERE NOT EXISTS (
    SELECT 1
    FROM "TournamentRules" AS rules
    WHERE rules."tournamentId" = tournament."id"
);
