-- Seed admin user (password should be replaced with a bcrypt hash before use)
INSERT INTO users (name, username, password, role) VALUES (
  'Administrator',
  'admin',
  '$2a$10$u4FzJj1pX5ZqQvN6t1Hj9e2QwQpQOe7A5Zs7oFqfYtCav5e1u8WQu',
  'admin'
);
-- The above hash corresponds to password: Admin@123