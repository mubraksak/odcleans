-- Add session fields to admin_users table
ALTER TABLE admin_users 
ADD COLUMN session_token VARCHAR(255) NULL,
ADD COLUMN session_expires TIMESTAMP NULL;

-- Add indexes for performance
CREATE INDEX idx_admin_users_session_token ON admin_users(session_token);
