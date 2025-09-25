-- CreateTable
CREATE TABLE "Site" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shortId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "customer" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BoardChange" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "boardId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BoardChange_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AccessLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shortId" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "siteId" INTEGER,
    "boardId" INTEGER,
    CONSTRAINT "AccessLog_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AccessLog_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AccessLog" ("boardId", "createdAt", "id", "ip", "shortId", "success", "userAgent") SELECT "boardId", "createdAt", "id", "ip", "shortId", "success", "userAgent" FROM "AccessLog";
DROP TABLE "AccessLog";
ALTER TABLE "new_AccessLog" RENAME TO "AccessLog";
CREATE TABLE "new_Board" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shortId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "siteId" INTEGER,
    "customerName" TEXT,
    "siteAddress" TEXT,
    "qrTokenId" INTEGER,
    "type" TEXT,
    "supplyType" TEXT,
    "voltage" TEXT,
    "earthingSystem" TEXT,
    "incomingCable" TEXT,
    "ratedCurrent" TEXT,
    "frequency" TEXT,
    "solar" BOOLEAN,
    "description" TEXT,
    "lastInspection" DATETIME,
    "nextInspection" DATETIME,
    "state" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Board_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Board" ("createdAt", "customerName", "id", "name", "qrTokenId", "shortId", "siteAddress", "state", "updatedAt") SELECT "createdAt", "customerName", "id", "name", "qrTokenId", "shortId", "siteAddress", "state", "updatedAt" FROM "Board";
DROP TABLE "Board";
ALTER TABLE "new_Board" RENAME TO "Board";
CREATE UNIQUE INDEX "Board_shortId_key" ON "Board"("shortId");
CREATE TABLE "new_QrToken" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shortId" TEXT NOT NULL,
    "pinHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNASSIGNED',
    "siteId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QrToken_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_QrToken" ("createdAt", "id", "pinHash", "shortId", "status", "updatedAt") SELECT "createdAt", "id", "pinHash", "shortId", "status", "updatedAt" FROM "QrToken";
DROP TABLE "QrToken";
ALTER TABLE "new_QrToken" RENAME TO "QrToken";
CREATE UNIQUE INDEX "QrToken_shortId_key" ON "QrToken"("shortId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Site_shortId_key" ON "Site"("shortId");
