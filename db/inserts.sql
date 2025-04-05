INSERT INTO users (id, create_time, type, name) 
VALUES (1, CURRENT_TIMESTAMP, 'user', 'John Doe');

INSERT INTO events (id, users_id, lat, long, time_created, time_updated, time_expiry, data, authority, severity)
VALUES (1, 1, 40.712776, -74.005974, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 day', '{"description": "Traffic accident"}', 'Police', 'High');
