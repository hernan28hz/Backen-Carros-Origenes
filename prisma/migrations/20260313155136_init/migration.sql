-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'OPERADOR');

-- CreateEnum
CREATE TYPE "public"."VehicleStatusType" AS ENUM ('REGISTERED', 'AVAILABLE', 'IN_MAINTENANCE', 'OUT_OF_SERVICE', 'SOLD');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'OPERADOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Vehicle" (
    "id" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "vin" TEXT,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "currentStatus" "public"."VehicleStatusType" NOT NULL DEFAULT 'AVAILABLE',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VehicleStatusHistory" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "statusType" "public"."VehicleStatusType" NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VehiclePhoto" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "description" TEXT,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehiclePhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_plate_key" ON "public"."Vehicle"("plate");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "public"."Vehicle"("vin");

-- CreateIndex
CREATE INDEX "Vehicle_plate_idx" ON "public"."Vehicle"("plate");

-- CreateIndex
CREATE INDEX "Vehicle_createdById_idx" ON "public"."Vehicle"("createdById");

-- CreateIndex
CREATE INDEX "Vehicle_currentStatus_idx" ON "public"."Vehicle"("currentStatus");

-- CreateIndex
CREATE INDEX "VehicleStatusHistory_vehicleId_idx" ON "public"."VehicleStatusHistory"("vehicleId");

-- CreateIndex
CREATE INDEX "VehicleStatusHistory_updatedById_idx" ON "public"."VehicleStatusHistory"("updatedById");

-- CreateIndex
CREATE INDEX "VehicleStatusHistory_statusType_idx" ON "public"."VehicleStatusHistory"("statusType");

-- CreateIndex
CREATE INDEX "VehiclePhoto_vehicleId_idx" ON "public"."VehiclePhoto"("vehicleId");

-- CreateIndex
CREATE INDEX "VehiclePhoto_uploadedById_idx" ON "public"."VehiclePhoto"("uploadedById");

-- AddForeignKey
ALTER TABLE "public"."Vehicle" ADD CONSTRAINT "Vehicle_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VehicleStatusHistory" ADD CONSTRAINT "VehicleStatusHistory_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VehicleStatusHistory" ADD CONSTRAINT "VehicleStatusHistory_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VehiclePhoto" ADD CONSTRAINT "VehiclePhoto_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VehiclePhoto" ADD CONSTRAINT "VehiclePhoto_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
