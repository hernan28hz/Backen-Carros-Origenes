ALTER TABLE `FinanceRecord` DROP FOREIGN KEY `FinanceRecord_createdById_fkey`;
ALTER TABLE `Vehicle` DROP FOREIGN KEY `Vehicle_createdById_fkey`;
ALTER TABLE `VehicleStatusHistory` DROP FOREIGN KEY `VehicleStatusHistory_updatedById_fkey`;
ALTER TABLE `VehiclePhoto` DROP FOREIGN KEY `VehiclePhoto_uploadedById_fkey`;
ALTER TABLE `VehicleAdminHistory` DROP FOREIGN KEY `VehicleAdminHistory_updatedById_fkey`;

ALTER TABLE `FinanceRecord` MODIFY `createdById` VARCHAR(191) NULL;
ALTER TABLE `Vehicle` MODIFY `createdById` VARCHAR(191) NULL;
ALTER TABLE `VehicleStatusHistory` MODIFY `updatedById` VARCHAR(191) NULL;
ALTER TABLE `VehiclePhoto` MODIFY `uploadedById` VARCHAR(191) NULL;
ALTER TABLE `VehicleAdminHistory` MODIFY `updatedById` VARCHAR(191) NULL;

ALTER TABLE `FinanceRecord`
  ADD CONSTRAINT `FinanceRecord_createdById_fkey`
  FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Vehicle`
  ADD CONSTRAINT `Vehicle_createdById_fkey`
  FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `VehicleStatusHistory`
  ADD CONSTRAINT `VehicleStatusHistory_updatedById_fkey`
  FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `VehiclePhoto`
  ADD CONSTRAINT `VehiclePhoto_uploadedById_fkey`
  FOREIGN KEY (`uploadedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `VehicleAdminHistory`
  ADD CONSTRAINT `VehicleAdminHistory_updatedById_fkey`
  FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
