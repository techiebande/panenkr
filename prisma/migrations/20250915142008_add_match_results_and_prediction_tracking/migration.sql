/*
  Warnings:

  - You are about to drop the column `historicalResult` on the `Prediction` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalMatchId" TEXT,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "leagueId" TEXT,
    "kickoffAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "scoreHome" INTEGER,
    "scoreAway" INTEGER,
    "htScoreHome" INTEGER,
    "htScoreAway" INTEGER,
    "finishedAt" DATETIME,
    "minute" INTEGER,
    "oddsJson" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Match_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Match_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Match_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Match" ("awayTeamId", "createdAt", "externalMatchId", "homeTeamId", "id", "kickoffAt", "leagueId", "oddsJson", "scoreAway", "scoreHome", "status", "updatedAt") SELECT "awayTeamId", "createdAt", "externalMatchId", "homeTeamId", "id", "kickoffAt", "leagueId", "oddsJson", "scoreAway", "scoreHome", "status", "updatedAt" FROM "Match";
DROP TABLE "Match";
ALTER TABLE "new_Match" RENAME TO "Match";
CREATE TABLE "new_Prediction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "publishStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" DATETIME,
    "content" JSONB NOT NULL,
    "result" TEXT NOT NULL DEFAULT 'PENDING',
    "resultNote" TEXT,
    "evaluatedAt" DATETIME,
    "evaluatedBy" TEXT,
    "actualOutcome" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Prediction_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Prediction_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Prediction" ("authorId", "confidence", "content", "createdAt", "id", "isPremium", "matchId", "publishStatus", "publishedAt", "slug", "title", "type", "updatedAt", "value") SELECT "authorId", "confidence", "content", "createdAt", "id", "isPremium", "matchId", "publishStatus", "publishedAt", "slug", "title", "type", "updatedAt", "value" FROM "Prediction";
DROP TABLE "Prediction";
ALTER TABLE "new_Prediction" RENAME TO "Prediction";
CREATE UNIQUE INDEX "Prediction_slug_key" ON "Prediction"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
