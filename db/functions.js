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

/**
 * Get a user by ID.
 * @param {number} id - The user ID.
 * @returns {Promise<Object>} The user object.
 */
async function getUserById(id) {
  const query = `SELECT * FROM users WHERE id = $1`;
  const params = [id];
  const result = await db.query(query, params);
  return result.rows[0];
}

/**
 * Get all users.
 * @returns {Promise<Array>} Array of user objects.
 */
async function getAllUsers() {
  const query = `SELECT * FROM users`;
  const result = await db.query(query);
  return result.rows;
}

/**
 * Update a user.
 * @param {Object} user - The user object with updated info.
 * @param {number} user.id - The user ID.
 * @param {string} [user.type] - New user type.
 * @param {string} [user.name] - New user name.
 * @returns {Promise} A promise that resolves when the update is complete.
 */
async function updateUser({ id, type, name }) {
  const query = `
        UPDATE users
        SET type = COALESCE($2, type),
            name = COALESCE($3, name)
        WHERE id = $1
    `;
  const params = [id, type, name];
  return db.query(query, params);
}

/**
 * Delete a user.
 * @param {number} id - The ID of the user to delete.
 * @returns {Promise} A promise that resolves when deletion completes.
 */
async function deleteUser(id) {
  const query = `DELETE FROM users WHERE id = $1`;
  const params = [id];
  return db.query(query, params);
}

/**
 * Get an event by ID.
 * @param {number} id - The event ID.
 * @returns {Promise<Object>} The event object.
 */
async function getEventById(id) {
  const query = `SELECT * FROM events WHERE id = $1`;
  const params = [id];
  const result = await db.query(query, params);
  return result.rows[0];
}

/**
 * Get all events for a specified user.
 * @param {number} users_id - The user ID.
 * @returns {Promise<Array>} Array of event objects.
 */
async function getEventsByUserId(users_id) {
  const query = `SELECT * FROM events WHERE users_id = $1`;
  const params = [users_id];
  const result = await db.query(query, params);
  return result.rows;
}

/**
 * Update an event.
 * @param {Object} event - The event object with updated data.
 * @param {number} event.id - The event ID.
 * @param {number} [event.lat] - Updated latitude.
 * @param {number} [event.long] - Updated longitude.
 * @param {Date|string} [event.time_created] - Updated creation time.
 * @param {Date|string} [event.time_updated] - Updated update time.
 * @param {Date|string} [event.time_expiry] - Updated expiry time.
 * @param {Object} [event.data] - Updated additional event data.
 * @param {string} [event.authority] - Updated authority.
 * @param {string} [event.severity] - Updated severity.
 * @returns {Promise} A promise that resolves when the update is complete.
 */
async function updateEvent({
  id,
  lat,
  long,
  time_created,
  time_updated,
  time_expiry,
  data,
  authority,
  severity,
}) {
  const query = `
        UPDATE events
        SET lat = COALESCE($2, lat),
            long = COALESCE($3, long),
            time_created = COALESCE($4, time_created),
            time_updated = COALESCE($5, time_updated),
            time_expiry = COALESCE($6, time_expiry),
            data = COALESCE($7, data),
            authority = COALESCE($8, authority),
            severity = COALESCE($9, severity)
        WHERE id = $1
    `;
  const params = [
    id,
    lat,
    long,
    time_created,
    time_updated,
    time_expiry,
    data ? JSON.stringify(data) : null,
    authority,
    severity,
  ];
  return db.query(query, params);
}

/**
 * Delete an event.
 * @param {number} id - The event ID.
 * @returns {Promise} A promise that resolves when deletion is complete.
 */
async function deleteEvent(id) {
  const query = `DELETE FROM events WHERE id = $1`;
  const params = [id];
  return db.query(query, params);
}
/**
 * Get all events.
 * @returns {Promise<Array>} Array of event objects.
 */
async function getAllEvents() {
  const query = `SELECT * FROM events`;
  const result = await db.query(query);
  return result.rows;
}
module.exports = {
  insertUser,
  insertEvent,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllEvents,
  getEventById,
  getEventsByUserId,
  updateEvent,
  deleteEvent,
};
