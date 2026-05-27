-- Add optional notification email for user profiles.
ALTER TABLE `User` ADD COLUMN `contactEmail` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `User_contactEmail_key` ON `User`(`contactEmail`);
