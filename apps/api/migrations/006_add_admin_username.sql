ALTER TABLE admin_users ADD COLUMN username TEXT;

CREATE UNIQUE INDEX admin_users_username_lower_idx ON admin_users (LOWER(username));
