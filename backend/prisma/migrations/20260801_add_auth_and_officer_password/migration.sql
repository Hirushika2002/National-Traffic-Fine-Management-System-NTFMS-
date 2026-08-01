-- Prisma Migrate Migration
-- Create auth refresh token support and add officer password storage for login.

ALTER TABLE `officers`
ADD COLUMN `password_hash` VARCHAR(255);

CREATE TABLE `refresh_tokens` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `token_hash` VARCHAR(255) NOT NULL UNIQUE,
  `user_type` VARCHAR(16) NOT NULL,
  `admin_id` INT NULL,
  `officer_id` INT NULL,
  `expires_at` DATETIME NOT NULL,
  `revoked` BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`),
  FOREIGN KEY (`officer_id`) REFERENCES `officers`(`id`)
);
