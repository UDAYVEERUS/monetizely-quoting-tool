-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Tier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "basePricePerSeat" REAL NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tier_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "productId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Feature_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TierFeature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tierId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_AVAILABLE',
    "addonPricingModel" TEXT,
    "addonPrice" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TierFeature_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "Tier" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TierFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "termLength" TEXT NOT NULL,
    "discountPercent" REAL NOT NULL DEFAULT 0,
    "totalPrice" REAL NOT NULL,
    "shareToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Quote_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Quote_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "Tier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuoteLineItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quoteId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "calculationNote" TEXT,
    "amount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QuoteLineItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuoteAddon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quoteId" TEXT NOT NULL,
    "tierFeatureId" TEXT NOT NULL,
    "seats" INTEGER,
    "amount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QuoteAddon_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuoteAddon_tierFeatureId_fkey" FOREIGN KEY ("tierFeatureId") REFERENCES "TierFeature" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Tier_productId_name_key" ON "Tier"("productId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_productId_name_key" ON "Feature"("productId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "TierFeature_tierId_featureId_key" ON "TierFeature"("tierId", "featureId");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_shareToken_key" ON "Quote"("shareToken");
