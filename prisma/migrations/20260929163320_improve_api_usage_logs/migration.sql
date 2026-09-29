-- DropForeignKey
ALTER TABLE "ApiUsageLog" DROP CONSTRAINT "ApiUsageLog_userId_fkey";

-- AlterTable
ALTER TABLE "ApiUsageLog" ADD COLUMN     "durationMs" INTEGER,
ADD COLUMN     "method" TEXT,
ADD COLUMN     "path" TEXT,
ADD COLUMN     "statusCode" INTEGER,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "ApiUsageLog_createdAt_idx" ON "ApiUsageLog"("createdAt");

-- AddForeignKey
ALTER TABLE "ApiUsageLog" ADD CONSTRAINT "ApiUsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
