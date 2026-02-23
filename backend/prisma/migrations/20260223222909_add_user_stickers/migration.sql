-- CreateTable
CREATE TABLE "user_stickers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stickerId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_stickers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_stickers_userId_stickerId_key" ON "user_stickers"("userId", "stickerId");

-- AddForeignKey
ALTER TABLE "user_stickers" ADD CONSTRAINT "user_stickers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
