-- Keep the user table focused on permanent profile data.
ALTER TABLE `User`
  ADD COLUMN `contactEmailVerified` BOOLEAN NOT NULL DEFAULT false,
  DROP COLUMN `contactEmailVerifiedAt`,
  DROP COLUMN `pendingContactEmail`,
  DROP COLUMN `emailVerificationCodeHash`,
  DROP COLUMN `emailVerificationExpiresAt`,
  DROP COLUMN `emailVerificationLastSentAt`;

CREATE TABLE `EmailVerification` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `codeHash` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `lastSentAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `EmailVerification_userId_key`(`userId`),
  INDEX `EmailVerification_email_idx`(`email`),
  INDEX `EmailVerification_expiresAt_idx`(`expiresAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `EmailVerification`
  ADD CONSTRAINT `EmailVerification_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
