-- Nepali Kadam database schema (PostgreSQL)
CREATE TABLE roles (
  role_id SERIAL PRIMARY KEY,
  name VARCHAR(20) UNIQUE NOT NULL
);
CREATE TABLE permissions (
  permission_id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(150)
);
CREATE TABLE role_permissions (
  role_id INT REFERENCES roles(role_id) ON DELETE CASCADE,
  permission_id INT REFERENCES permissions(permission_id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  role_id INT NOT NULL REFERENCES roles(role_id),
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMP
);
CREATE TABLE user_profiles (
  profile_id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  height_cm NUMERIC(5,1),
  weight_kg NUMERIC(5,1),
  date_of_birth DATE,
  gender VARCHAR(10)
);
CREATE TABLE password_reset_tokens (
  token_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP
);
CREATE TABLE activities (
  activity_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  activity_type VARCHAR(10) NOT NULL CHECK (activity_type IN ('walk','run')),
  source VARCHAR(10) NOT NULL DEFAULT 'gps' CHECK (source IN ('gps','manual')),
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP NOT NULL,
  moving_time_sec INT NOT NULL,
  distance_km NUMERIC(7,3) NOT NULL,
  avg_pace_sec_km INT,
  steps_est INT,
  calories_kcal NUMERIC(7,1)
);
CREATE INDEX idx_activities_user_started ON activities(user_id, started_at DESC);
CREATE TABLE activity_points (
  point_id BIGSERIAL PRIMARY KEY,
  activity_id INT NOT NULL REFERENCES activities(activity_id) ON DELETE CASCADE,
  recorded_at TIMESTAMP NOT NULL,
  latitude NUMERIC(9,6) NOT NULL,
  longitude NUMERIC(9,6) NOT NULL,
  accuracy_m NUMERIC(6,1)
);

-- Seed data
INSERT INTO roles (name) VALUES ('user'), ('admin');
INSERT INTO permissions (name, description) VALUES
  ('activity:create',  'Record or add own activities'),
  ('activity:read',    'View own activities and totals'),
  ('activity:delete',  'Delete own activities'),
  ('profile:manage',   'View and update own profile'),
  ('users:list',       'View list of user accounts'),
  ('users:status',     'Activate or deactivate user accounts'),
  ('stats:view',       'View aggregate system statistics');
-- user gets permissions 1-4; admin gets 4-7 (own profile + admin functions)
INSERT INTO role_permissions SELECT 1, permission_id FROM permissions WHERE permission_id BETWEEN 1 AND 4;
INSERT INTO role_permissions SELECT 2, permission_id FROM permissions WHERE permission_id BETWEEN 4 AND 7;
