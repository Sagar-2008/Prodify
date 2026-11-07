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
