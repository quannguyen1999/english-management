ALTER TABLE `user`
MODIFY COLUMN `role` ENUM('ADMIN', 'USER', 'AI_TEACHER') NOT NULL;

-- Create default AI Teacher user
INSERT INTO `User` (
    id,
    username,
    email,
    password,
    role,
    full_name,
    is_email_verified,
    is_active,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'ai_teacher',
    'ai.teacher@english-learning.com',
    'no-pass',
    'AI_TEACHER',
    'AI English Teacher',
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON DUPLICATE KEY UPDATE
    username = VALUES(username),
    email = VALUES(email),
    role = VALUES(role),
    full_name = VALUES(full_name),
    updated_at = CURRENT_TIMESTAMP;
