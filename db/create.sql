CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL PRIMARY KEY,
  create_time TIMESTAMP,
  type VARCHAR(10) CHECK (type IN ('user', 'authority')),
  name VARCHAR(45)
);

CREATE TABLE IF NOT EXISTS events (
  id INT NOT NULL PRIMARY KEY,
  users_id INT NOT NULL,
  lat DECIMAL(10,6),
  long DECIMAL(10,6),
  time_created TIMESTAMP,
  time_updated TIMESTAMP,
  time_expiry TIMESTAMP,
  data JSONB,
  authority VARCHAR(45),
  severity VARCHAR(45),
  FOREIGN KEY (users_id) REFERENCES users (id)
);

CREATE INDEX events_users_id_idx ON events (users_id);