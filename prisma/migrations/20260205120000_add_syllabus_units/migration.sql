-- CreateTable
CREATE TABLE "SyllabusUnit" (
    "id" TEXT NOT NULL,
    "trackingId" TEXT NOT NULL,
    "unitName" TEXT NOT NULL,
    "completedPercent" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyllabusUnit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SyllabusUnit_trackingId_idx" ON "SyllabusUnit"("trackingId");

-- AddForeignKey
ALTER TABLE "SyllabusUnit" ADD CONSTRAINT "SyllabusUnit_trackingId_fkey" FOREIGN KEY ("trackingId") REFERENCES "SyllabusTracking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
