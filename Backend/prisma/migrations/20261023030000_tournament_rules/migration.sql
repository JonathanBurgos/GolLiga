CREATE TABLE "TournamentRules" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "victoryPoints" INTEGER NOT NULL DEFAULT 3,
    "drawPoints" INTEGER NOT NULL DEFAULT 1,
    "defeatPoints" INTEGER NOT NULL DEFAULT 0,
    "tieBreakCriteria" TEXT[] NOT NULL DEFAULT ARRAY['goalDifference', 'goalsFor', 'headToHead', 'fairPlay', 'lottery']::TEXT[],
    "competitionFormat" TEXT NOT NULL DEFAULT 'GROUPS_PLAYOFFS',
    "groupCount" INTEGER NOT NULL DEFAULT 4,
    "qualifiersPerGroup" INTEGER NOT NULL DEFAULT 2,
    "yellowCardsForSuspension" INTEGER NOT NULL DEFAULT 3,
    "directRedSuspensionMatches" INTEGER NOT NULL DEFAULT 2,
    "secondYellowSuspensionMatches" INTEGER NOT NULL DEFAULT 1,
    "resetCardsAtPlayoffs" BOOLEAN NOT NULL DEFAULT true,
    "yellowCardPoints" INTEGER NOT NULL DEFAULT 1,
    "secondYellowPoints" INTEGER NOT NULL DEFAULT 3,
    "directRedPoints" INTEGER NOT NULL DEFAULT 4,
    "otherSanctions" TEXT NOT NULL DEFAULT 'Configurable por tipo',
    "timeZone" TEXT NOT NULL DEFAULT 'America/Bogota',
    "currency" TEXT NOT NULL DEFAULT 'COP',
    "registrationFee" INTEGER NOT NULL DEFAULT 350000,
    "organizationContact" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentRules_pkey" PRIMARY KEY ("id")
);

INSERT INTO "TournamentRules" ("id", "tournamentId", "updatedAt")
SELECT 'rules_' || "id", "id", CURRENT_TIMESTAMP
FROM "Tournament";

CREATE UNIQUE INDEX "TournamentRules_tournamentId_key" ON "TournamentRules"("tournamentId");
CREATE INDEX "TournamentRules_tournamentId_idx" ON "TournamentRules"("tournamentId");

ALTER TABLE "TournamentRules"
ADD CONSTRAINT "TournamentRules_tournamentId_fkey"
FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
