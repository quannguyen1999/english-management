ALTER TABLE `message`
MODIFY COLUMN `type` ENUM('TEXT', 'IMAGE', 'VIDEO', 'FILE', 'GIF') DEFAULT 'TEXT';
