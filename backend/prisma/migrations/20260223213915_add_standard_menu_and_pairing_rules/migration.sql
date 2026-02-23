-- CreateTable
CREATE TABLE "standard_menus" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "displayNameEn" TEXT,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "cuisine" TEXT,
    "fatLevel" TEXT,
    "sweetness" TEXT,
    "spiciness" TEXT,
    "keywords" TEXT[],
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "standard_menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pairing_rules" (
    "id" TEXT NOT NULL,
    "menuCategory" TEXT NOT NULL,
    "menuSubcategory" TEXT,
    "occasion" TEXT,
    "drinkTypes" TEXT[],
    "drinkTastes" TEXT[],
    "score" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "reason" TEXT NOT NULL,
    "reasonEn" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pairing_rules_pkey" PRIMARY KEY ("id")
);
