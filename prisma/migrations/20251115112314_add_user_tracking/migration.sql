-- AlterTable
ALTER TABLE "Score" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "Score_userId_idx" ON "Score"("userId");
