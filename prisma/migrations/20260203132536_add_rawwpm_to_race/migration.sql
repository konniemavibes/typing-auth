-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RaceParticipant" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "raceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wpm" REAL NOT NULL DEFAULT 0,
    "rawWpm" REAL NOT NULL DEFAULT 0,
    "accuracy" REAL NOT NULL DEFAULT 100,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "finished" BOOLEAN NOT NULL DEFAULT false,
    "finishTime" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RaceParticipant_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race" ("_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RaceParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RaceParticipant" ("_id", "accuracy", "createdAt", "finishTime", "finished", "progress", "raceId", "userId", "wpm") SELECT "_id", "accuracy", "createdAt", "finishTime", "finished", "progress", "raceId", "userId", "wpm" FROM "RaceParticipant";
DROP TABLE "RaceParticipant";
ALTER TABLE "new_RaceParticipant" RENAME TO "RaceParticipant";
CREATE INDEX "RaceParticipant_raceId_idx" ON "RaceParticipant"("raceId");
CREATE INDEX "RaceParticipant_userId_idx" ON "RaceParticipant"("userId");
CREATE UNIQUE INDEX "RaceParticipant_raceId_userId_key" ON "RaceParticipant"("raceId", "userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
