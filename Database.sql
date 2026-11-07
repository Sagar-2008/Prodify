-- 1) Create DB
CREATE DATABASE IF NOT EXISTS prodify;
USE prodify;

-- 2) users
CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NULL,
  otp_expires DATETIME NULL,
  is_verified TINYINT(1) NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email)
);

-- 3) habits
CREATE TABLE IF NOT EXISTS habits (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  CONSTRAINT habits_ibfk_1
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

-- 4) habit_logs
CREATE TABLE IF NOT EXISTS habit_logs (
  id INT NOT NULL AUTO_INCREMENT,
  habit_id INT NOT NULL,
  user_id INT NOT NULL,
  log_date DATE NOT NULL,
  completed TINYINT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY habit_id (habit_id),
  KEY user_id (user_id),
  CONSTRAINT habit_logs_ibfk_1
    FOREIGN KEY (habit_id) REFERENCES habits(id)
    ON DELETE CASCADE,
  CONSTRAINT habit_logs_ibfk_2
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

-- 5) subjects
CREATE TABLE IF NOT EXISTS subjects (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  CONSTRAINT subjects_ibfk_1
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

-- 6) subject_points
CREATE TABLE IF NOT EXISTS subject_points (
  id INT NOT NULL AUTO_INCREMENT,
  subject_id INT NOT NULL,
  user_id INT NOT NULL,
  point_title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  mastery_level ENUM('rookie','intermediate','advanced','ace') NULL DEFAULT 'rookie',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY subject_id (subject_id),
  KEY user_id (user_id),
  CONSTRAINT subject_points_ibfk_1
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
    ON DELETE CASCADE,
  CONSTRAINT subject_points_ibfk_2
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

-- 7) pomodoro_sessions
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  task_name VARCHAR(255) NOT NULL,
  duration INT NOT NULL,
  completed_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  KEY completed_at (completed_at),
  CONSTRAINT pomodoro_sessions_ibfk_1
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

-- 8) journal_entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  entry_date DATE NOT NULL,
  title VARCHAR(255) NULL,
  content LONGTEXT NOT NULL,
  mood VARCHAR(50) NULL DEFAULT 'neutral',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  KEY entry_date (entry_date),
  UNIQUE KEY user_date (user_id, entry_date),
  CONSTRAINT journal_entries_ibfk_1
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

-- 9) ZENKAI OS productivity tables. Keep in sync with backend/src/migrations/001_productivity.sql.
CREATE TABLE IF NOT EXISTS productivity_quests (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  client_id VARCHAR(80) NOT NULL,
  title VARCHAR(160) NOT NULL,
  category VARCHAR(64) NOT NULL,
  xp_reward SMALLINT NOT NULL DEFAULT 20,
  due_date DATE NOT NULL,
  is_completed TINYINT(1) NOT NULL DEFAULT 0,
  completed_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_productivity_quests_client (user_id, client_id),
  KEY idx_productivity_quests_day (user_id, due_date, is_completed),
  CONSTRAINT productivity_quests_user_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS productivity_goals (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  client_id VARCHAR(80) NOT NULL,
  title VARCHAR(160) NOT NULL,
  area VARCHAR(64) NOT NULL,
  kind VARCHAR(32) NOT NULL DEFAULT 'Goal',
  target INT NOT NULL DEFAULT 5,
  progress INT NOT NULL DEFAULT 0,
  target_date DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_productivity_goals_client (user_id, client_id),
  KEY idx_productivity_goals_user (user_id, progress),
  CONSTRAINT productivity_goals_user_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS productivity_training_entries (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  client_id VARCHAR(80) NOT NULL,
  title VARCHAR(160) NOT NULL,
  category VARCHAR(64) NOT NULL,
  duration_minutes SMALLINT UNSIGNED NOT NULL,
  is_solved TINYINT(1) NOT NULL DEFAULT 0,
  entry_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_productivity_training_client (user_id, client_id),
  KEY idx_productivity_training_user_date (user_id, entry_date),
  CONSTRAINT productivity_training_user_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS productivity_categories (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  module VARCHAR(16) NOT NULL,
  name VARCHAR(64) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_productivity_category_name (user_id, module, name),
  CONSTRAINT productivity_categories_user_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS productivity_settings (
  user_id INT NOT NULL,
  xp_per_level SMALLINT UNSIGNED NOT NULL DEFAULT 100,
  xp_multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.00,
  focus_xp SMALLINT UNSIGNED NOT NULL DEFAULT 25,
  training_xp_per_hour SMALLINT UNSIGNED NOT NULL DEFAULT 60,
  solved_bonus SMALLINT UNSIGNED NOT NULL DEFAULT 20,
  rank_names TEXT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT productivity_settings_user_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS productivity_profiles (
  user_id INT NOT NULL,
  theme_id VARCHAR(32) NOT NULL DEFAULT 'capsule',
  poster_mime VARCHAR(32) NULL,
  poster_name VARCHAR(160) NULL,
  poster_data MEDIUMBLOB NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT productivity_profiles_user_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
