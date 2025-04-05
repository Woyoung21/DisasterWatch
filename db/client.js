const { Pool, Client } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Event emitters to bridge database notifications with application code
const EventEmitter = require("events");
const eventEmitter = new EventEmitter();

// Create a dedicated client for listening to notifications
let listenerClient = null;
let isListening = false;

/**
 * Initialize a dedicated client for listening to PostgreSQL notifications
 */
async function initializeListener() {
  if (isListening) return; // Prevent multiple listeners

  try {
    // Create a dedicated client instead of getting from pool
    listenerClient = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    await listenerClient.connect();
    console.log("Dedicated listener connection established");

    // Set up notification handling
    listenerClient.on("notification", (notification) => {
      console.log("🔔 Raw notification received:", notification);
      try {
        const payload = JSON.parse(notification.payload);
        console.log("✅ Successfully parsed payload:", payload);
        eventEmitter.emit("db-notification", payload);
        eventEmitter.emit(`channel:${notification.channel}`, payload);
      } catch (err) {
        console.error("❌ Error processing notification:", err);
        console.error("📄 Raw payload:", notification.payload);
      }
    });

    isListening = true;
    console.log("PostgreSQL notification listener initialized");
  } catch (err) {
    console.error("Failed to initialize notification listener:", err);
    if (listenerClient) {
      await listenerClient.end().catch(console.error);
      listenerClient = null;
    }
    isListening = false;
  }
}

/**
 * Listen for notifications on a specific channel
 * @param {string} channel - The PostgreSQL channel to listen on
 */
async function listen(channel) {
  if (!listenerClient || !isListening) {
    await initializeListener();
  }

  try {
    await listenerClient.query(`LISTEN ${channel}`);
    console.log(`Listening on channel: ${channel}`);
    return true;
  } catch (err) {
    console.error(`Failed to listen on channel ${channel}:`, err);
    return false;
  }
}

/**
 * Stop listening for notifications on a specific channel
 * @param {string} channel - The PostgreSQL channel to unlisten
 */
async function unlisten(channel) {
  if (!listenerClient || !isListening) return false;

  try {
    await listenerClient.query(`UNLISTEN ${channel}`);
    console.log(`Stopped listening on channel: ${channel}`);
    return true;
  } catch (err) {
    console.error(`Failed to unlisten channel ${channel}:`, err);
    return false;
  }
}

/**
 * Send a notification to a specific channel
 * @param {string} channel - The channel to notify
 * @param {Object} payload - The data to send
 */
async function notify(channel, payload) {
  try {
    const payloadString = JSON.stringify(payload);
    await pool.query(`SELECT pg_notify($1, $2)`, [channel, payloadString]);
    return true;
  } catch (err) {
    console.error(`Failed to notify channel ${channel}:`, err);
    return false;
  }
}

/**
 * Subscribe to database notifications
 * @param {string} channel - The channel to subscribe to ('*' for all channels)
 * @param {function} callback - Callback function receiving the payload
 * @returns {function} Unsubscribe function
 */
function subscribe(channel, callback) {
  const eventName = channel === "*" ? "db-notification" : `channel:${channel}`;
  eventEmitter.on(eventName, callback);

  return () => {
    eventEmitter.off(eventName, callback);
  };
}

/**
 * Clean up resources when shutting down
 */
async function closeListener() {
  if (listenerClient) {
    try {
      await listenerClient.query("UNLISTEN *");
      await listenerClient.end();
      listenerClient = null;
      isListening = false;
      console.log("PostgreSQL notification listener closed");
    } catch (err) {
      console.error("Error closing notification listener:", err);
    }
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  listen,
  unlisten,
  notify,
  subscribe,
  initializeListener,
  closeListener,
  pool,
};
