#!/usr/bin/env node

const { Pool, Client } = require("pg");
require("dotenv").config();
const db = require("./db/client"); // For regular queries only

// find and replace "-pool" with "-nonpool" in the connection string
const connectionString = process.env.DATABASE_URL.replace("-pooler", "");

// Create a direct client for notifications
const listenerClient = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Event handling
let eventSubscriptions = [];

async function main() {
  console.log("📡 Starting direct connection listener...");
  console.log("🔌 Connecting to database...");

  try {
    // Test regular connection with pool
    const testResult = await db.query(
      "SELECT current_database(), current_user"
    );
    console.log(
      `Connected to database: ${testResult.rows[0].current_database}`
    );
    console.log(`Connected as user: ${testResult.rows[0].current_user}`);

    // Check if triggers exist
    const triggersResult = await db.query(`
      SELECT trigger_name, event_manipulation, action_statement
      FROM information_schema.triggers
      WHERE event_object_table = 'events'
    `);
    console.log(
      `Found ${triggersResult.rows.length} triggers on events table:`
    );
    triggersResult.rows.forEach((trigger) => {
      console.log(`- ${trigger.trigger_name} (${trigger.event_manipulation})`);
    });

    // Connect the dedicated listener client
    await listenerClient.connect();
    console.log("✅ Direct listener connection established");

    // Set up notification listener
    listenerClient.on("notification", (notification) => {
      console.log("🔔 NOTIFICATION RECEIVED:");
      console.log("Channel:", notification.channel);
      console.log("PID:", notification.processId);
      console.log("Payload:", notification.payload);

      try {
        const payload = JSON.parse(notification.payload);
        console.log("Parsed data:", payload);

        // Notify any subscribers
        eventSubscriptions.forEach((subscription) => {
          if (
            subscription.channel === notification.channel ||
            subscription.channel === "*"
          ) {
            subscription.callback(payload);
          }
        });
      } catch (e) {
        console.error("Could not parse payload as JSON:", e);
      }
    });

    // Listen for events
    await listenerClient.query("LISTEN events_channel");
    console.log("👂 Listening on events_channel");

    // Send a test notification with the same connection
    console.log("📤 Sending test notification...");
    await listenerClient.query(
      "SELECT pg_notify('events_channel', '{\"test\": \"Direct notification\"}')"
    );
    console.log("Test notification sent");

    // Add explicit subscriber for structured output
    subscribe("events_channel", (payload) => {
      const timestamp = new Date().toISOString();
      console.log(`\n⚡ [${timestamp}] STRUCTURED EVENT DATA:`);
      console.log(JSON.stringify(payload, null, 2));
    });

    console.log("\n⏳ Waiting for events... (Press Ctrl+C to stop)");
    console.log(
      "💡 Try inserting/updating/deleting records in the events table"
    );

    // Keep process running
    process.stdin.resume();

    // Handle cleanup
    process.on("SIGINT", async () => {
      console.log("\n🛑 Shutting down...");
      await cleanup();
      process.exit(0);
    });
  } catch (error) {
    console.error(`❌ ERROR: ${error.message}`);
    console.error(error.stack);
    await cleanup();
    process.exit(1);
  }
}

function subscribe(channel, callback) {
  const subscription = { channel, callback };
  eventSubscriptions.push(subscription);

  // Return unsubscribe function
  return () => {
    eventSubscriptions = eventSubscriptions.filter((s) => s !== subscription);
  };
}

async function cleanup() {
  if (listenerClient) {
    try {
      await listenerClient.query("UNLISTEN *");
      await listenerClient.end();
      console.log("Listener connection closed");
    } catch (err) {
      console.error("Error closing listener:", err);
    }
  }
}

main().catch(async (err) => {
  console.error("Unhandled error:", err);
  await cleanup();
  process.exit(1);
});
