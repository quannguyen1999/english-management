CREATE TABLE `conversation` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `is_group` BOOLEAN NOT NULL DEFAULT FALSE,
    `name` VARCHAR(255), -- Only used if it's a group
    `last_message_id` VARCHAR(36),
    `last_message_at` TIMESTAMP NULL,
    `created_by` VARCHAR(36) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_conversation_last_message_at` (`last_message_at`),
    INDEX `idx_conversation_created_by` (`created_by`),
    FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE CASCADE
    -- `last_message_id` will be added as a foreign key later
);

CREATE TABLE `message` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `conversation_id` VARCHAR(36) NOT NULL,
    `sender_id` VARCHAR(36) NOT NULL,
    `content` TEXT,
    `type` ENUM('TEXT', 'IMAGE', 'VIDEO', 'FILE') DEFAULT 'TEXT',
    `reply_to` VARCHAR(36),
    `is_deleted` BOOLEAN DEFAULT FALSE,
    `is_edited` BOOLEAN DEFAULT FALSE,
    `edited_at` TIMESTAMP NULL,
    `version` BIGINT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_message_conversation_id` (`conversation_id`),
    INDEX `idx_message_sender_id` (`sender_id`),
    INDEX `idx_message_reply_to` (`reply_to`),
    FOREIGN KEY (`conversation_id`) REFERENCES `conversation`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`sender_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`reply_to`) REFERENCES `message`(`id`) ON DELETE SET NULL
);

-- Now that both `message` and `conversation` tables exist, you can add the foreign key for `last_message_id`
ALTER TABLE `conversation`
ADD CONSTRAINT `fk_conversation_last_message_id` FOREIGN KEY (`last_message_id`) REFERENCES `message`(`id`) ON DELETE SET NULL;

CREATE TABLE `conversation_participant` (
    `conversation_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`conversation_id`, `user_id`),
    INDEX `idx_conversation_participant_user_id` (`user_id`),
    FOREIGN KEY (`conversation_id`) REFERENCES `conversation`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);

CREATE TABLE `message_status` (
    `message_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `status` ENUM('SENT', 'DELIVERED', 'READ') DEFAULT 'SENT',
    `read_at` TIMESTAMP NULL,
    `delivered_at` TIMESTAMP NULL,
    `reaction` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`message_id`, `user_id`),
    INDEX `idx_message_status_user_id` (`user_id`),
    INDEX `idx_message_status_status` (`status`),
    FOREIGN KEY (`message_id`) REFERENCES `message`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
