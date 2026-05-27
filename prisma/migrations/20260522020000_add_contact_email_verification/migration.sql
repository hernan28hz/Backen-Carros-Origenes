-- Add verification workflow fields for profile contact emails.
ALTER TABLE `User`
  ADD COLUMN `contactEmailVerifiedAt` DATETIME(3) NULL,
  ADD COLUMN `pendingContactEmail` VARCHAR(191) NULL,
  ADD COLUMN `emailVerificationCodeHash` VARCHAR(191) NULL,
  ADD COLUMN `emailVerificationExpiresAt` DATETIME(3) NULL,
  ADD COLUMN `emailVerificationLastSentAt` DATETIME(3) NULL;
