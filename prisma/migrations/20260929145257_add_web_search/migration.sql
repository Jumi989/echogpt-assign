-- CreateTable
CREATE TABLE "WebSearch" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "results" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "WebSearch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebSearch_userId_createdAt_idx" ON "WebSearch"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "WebSearch" ADD CONSTRAINT "WebSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
