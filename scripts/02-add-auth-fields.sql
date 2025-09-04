-- Add authentication fields to users table
ALTER TABLE users 
ADD COLUMN magic_token VARCHAR(255) NULL,
ADD COLUMN magic_token_expires TIMESTAMP NULL,
ADD COLUMN session_token VARCHAR(255) NULL,
ADD COLUMN session_expires TIMESTAMP NULL;

-- Add indexes for performance
CREATE INDEX idx_users_magic_token ON users(magic_token);
CREATE INDEX idx_users_session_token ON users(session_token);
