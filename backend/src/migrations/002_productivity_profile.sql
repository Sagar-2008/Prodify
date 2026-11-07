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
