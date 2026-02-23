-- CreateTable
CREATE TABLE "support_messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_messages_pkey" PRIMARY KEY ("id")
);
