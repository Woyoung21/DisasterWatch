const db = require("./client");

/**
 * Insert a new user into the users table.
 * @param {Object} user - The user object.
 * @param {number} user.id - The user ID.
 * @param {string} user.type - The user type (e.g., 'user' or 'authority').
 * @param {string} user.name - The user's name.
 * @param {Date|string} [user.create_time=new Date()] - The creation time. Defaults to current time.
 * @returns {Promise} A promise that resolves when the insert completes.
 */
async function insertUser({ id, type, name, create_time = new Date() }) {
  const query = `
        INSERT INTO users (id, create_time, type, name)
        VALUES ($1, $2, $3, $4)
    `;
  const params = [id, create_time, type, name];
  return db.query(query, params);
}

/**
 * Insert a new event into the events table.
 * @param {Object} event - The event object.
 * @param {number} event.id - The event ID.
 * @param {number} event.users_id - The user ID associated with the event.
 * @param {number} event.lat - Latitude.
 * @param {number} event.long - Longitude.
 * @param {Date|string} [event.time_created=new Date()] - Time when the event was created.
 * @param {Date|string} [event.time_updated=new Date()] - Time when the event was updated.
 * @param {Date|string} [event.time_expiry] - When the event expires. Defaults to 1 day from now.
 * @param {Object} event.data - Additional event data as a JSON object.
 * @param {string} event.authority - The authority handling the event.
 * @param {string} event.severity - The event severity.
 * @returns {Promise} A promise that resolves when the insert completes.
 */
async function insertEvent({
  id,
  users_id,
  lat,
  long,
  time_created = new Date(),
  time_updated = new Date(),
  time_expiry,
  data,
  authority,
  severity,
}) {
  if (!time_expiry) {
    time_expiry = new Date(Date.now() + 86400000); // default to 1 day later
  }
  const query = `
        INSERT INTO events (id, users_id, lat, long, time_created, time_updated, time_expiry, data, authority, severity)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
  const params = [
    id,
    users_id,
    lat,
    long,
    time_created,
    time_updated,
    time_expiry,
    JSON.stringify(data),
    authority,
    severity,
  ];
  return db.query(query, params);
}

module.exports = {
  insertUser,
  insertEvent,
};
