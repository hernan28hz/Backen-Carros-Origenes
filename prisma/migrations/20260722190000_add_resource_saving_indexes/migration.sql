CREATE INDEX `FinanceRecord_type_date_idx` ON `FinanceRecord`(`type`, `date`);

CREATE INDEX `Vehicle_soatExpiry_idx` ON `Vehicle`(`soatExpiry`);
CREATE INDEX `Vehicle_tecnomecanicaExpiry_idx` ON `Vehicle`(`tecnomecanicaExpiry`);
CREATE INDEX `Vehicle_vehicleTaxExpiry_idx` ON `Vehicle`(`vehicleTaxExpiry`);

CREATE INDEX `VehicleStatusHistory_vehicleId_createdAt_idx` ON `VehicleStatusHistory`(`vehicleId`, `createdAt`);
CREATE INDEX `VehiclePhoto_vehicleId_createdAt_idx` ON `VehiclePhoto`(`vehicleId`, `createdAt`);
CREATE INDEX `VehicleAdminHistory_vehicleId_createdAt_idx` ON `VehicleAdminHistory`(`vehicleId`, `createdAt`);
