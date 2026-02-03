-- CreateTable
CREATE TABLE "Race" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "roomCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "startTime" DATETIME,
    "endTime" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" TEXT NOT NULL,
    "sentenceId" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Race_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RaceParticipant" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "raceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wpm" REAL NOT NULL DEFAULT 0,
    "accuracy" REAL NOT NULL DEFAULT 100,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "finished" BOOLEAN NOT NULL DEFAULT false,
    "finishTime" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RaceParticipant_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race" ("_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RaceParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Race_roomCode_key" ON "Race"("roomCode");

-- CreateIndex
CREATE INDEX "Race_roomCode_idx" ON "Race"("roomCode");

-- CreateIndex
CREATE INDEX "Race_creatorId_idx" ON "Race"("creatorId");

-- CreateIndex
CREATE INDEX "RaceParticipant_raceId_idx" ON "RaceParticipant"("raceId");

-- CreateIndex
CREATE INDEX "RaceParticipant_userId_idx" ON "RaceParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RaceParticipant_raceId_userId_key" ON "RaceParticipant"("raceId", "userId");
