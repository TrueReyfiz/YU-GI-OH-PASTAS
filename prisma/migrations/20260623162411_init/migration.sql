-- CreateTable
CREATE TABLE "GlobalCard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "namePt" TEXT,
    "type" TEXT NOT NULL,
    "frameType" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "descPt" TEXT,
    "atk" INTEGER,
    "def" INTEGER,
    "level" INTEGER,
    "race" TEXT,
    "attribute" TEXT,
    "imageUrl" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CardSet" (
    "setCode" TEXT NOT NULL PRIMARY KEY,
    "setName" TEXT NOT NULL,
    "setRarity" TEXT,
    "cardId" INTEGER NOT NULL,
    CONSTRAINT "CardSet_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "GlobalCard" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "GlobalCard_name_key" ON "GlobalCard"("name");

-- CreateIndex
CREATE INDEX "CardSet_cardId_idx" ON "CardSet"("cardId");
