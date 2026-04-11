CREATE TABLE `VehicleAdminHistory` (
  `id` VARCHAR(191) NOT NULL,
  `vehicleId` VARCHAR(191) NOT NULL,
  `field` VARCHAR(191) NOT NULL,
  `oldValue` TEXT NULL,
  `newValue` TEXT NULL,
  `updatedById` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `VehicleAdminHistory_vehicleId_idx`(`vehicleId`),
  INDEX `VehicleAdminHistory_updatedById_idx`(`updatedById`),
  INDEX `VehicleAdminHistory_createdAt_idx`(`createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `VehicleAdminHistory`
  ADD CONSTRAINT `VehicleAdminHistory_vehicleId_fkey`
    FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `VehicleAdminHistory_updatedById_fkey`
    FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
