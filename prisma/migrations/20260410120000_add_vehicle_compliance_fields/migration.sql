ALTER TABLE `Vehicle`
  ADD COLUMN `soatExpiry` DATETIME(3) NULL,
  ADD COLUMN `tecnomecanicaExpiry` DATETIME(3) NULL,
  ADD COLUMN `vehicleTaxExpiry` DATETIME(3) NULL,
  ADD COLUMN `pendingProcedures` TEXT NULL,
  ADD COLUMN `fines` TEXT NULL;
