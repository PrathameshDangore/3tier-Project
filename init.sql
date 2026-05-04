CREATE DATABASE IF NOT EXISTS appdb;
USE appdb;

CREATE TABLE IF NOT EXISTS users (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(100),
  email VARCHAR(100)
);

INSERT INTO users (name, email) VALUES
  ('Alice',   'alice@email.com'),
  ('Bob',     'bob@email.com'),
  ('Charlie', 'charlie@email.com');