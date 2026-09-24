-- AlterTable
ALTER TABLE "House" ADD COLUMN "latitude" DOUBLE PRECISION,
ADD COLUMN "longitude" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "HouseImage" (
    "id" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HouseImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HouseImage_houseId_sortOrder_idx" ON "HouseImage"("houseId", "sortOrder");

-- AddForeignKey
ALTER TABLE "HouseImage" ADD CONSTRAINT "HouseImage_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE CASCADE ON UPDATE CASCADE;
