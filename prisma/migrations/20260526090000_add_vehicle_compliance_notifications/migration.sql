CREATE TABLE `VehicleComplianceNotification` (
  `id` VARCHAR(191) NOT NULL,
  `vehicleId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `documentType` VARCHAR(191) NOT NULL,
  `alertType` VARCHAR(191) NOT NULL,
  `expiryDate` DATETIME(3) NOT NULL,
  `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `VehicleComplianceNotification_vehicleId_userId_documentType_alertType_expiryDate_key`(`vehicleId`, `userId`, `documentType`, `alertType`, `expiryDate`),
  INDEX `VehicleComplianceNotification_vehicleId_idx`(`vehicleId`),
  INDEX `VehicleComplianceNotification_userId_idx`(`userId`),
  INDEX `VehicleComplianceNotification_sentAt_idx`(`sentAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `VehicleComplianceNotification`
  ADD CONSTRAINT `VehicleComplianceNotification_vehicleId_fkey`
  FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `VehicleComplianceNotification`
  ADD CONSTRAINT `VehicleComplianceNotification_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
