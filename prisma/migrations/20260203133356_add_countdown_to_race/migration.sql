-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Race" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "roomCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "startTime" DATETIME,
    "endTime" DATETIME,
    "countdown" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" TEXT NOT NULL,
    "sentenceId" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Race_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Race" ("_id", "createdAt", "creatorId", "endTime", "roomCode", "sentenceId", "startTime", "status") SELECT "_id", "createdAt", "creatorId", "endTime", "roomCode", "sentenceId", "startTime", "status" FROM "Race";
DROP TABLE "Race";
ALTER TABLE "new_Race" RENAME TO "Race";
CREATE UNIQUE INDEX "Race_roomCode_key" ON "Race"("roomCode");
CREATE INDEX "Race_roomCode_idx" ON "Race"("roomCode");
CREATE INDEX "Race_creatorId_idx" ON "Race"("creatorId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
