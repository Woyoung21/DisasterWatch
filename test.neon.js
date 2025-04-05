const { Client } = require("pg");
require("dotenv").config();

async function testDirectNeonConnection() {
  // Create direct connection - no pooling
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    // Add these for better Neon DB compatibility
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    console.log("Connected directly to Neon DB");

    // Set up notification listener with detailed logging
    client.on("notification", (msg) => {
      console.log("🔔 NOTIFICATION RECEIVED:");
      console.log("Channel:", msg.channel);
      console.log("PID:", msg.processId);
      console.log("Payload:", msg.payload);

      try {
        const data = JSON.parse(msg.payload);
        console.log("Parsed data:", data);
      } catch (e) {
        console.log("Could not parse payload as JSON");
      }
    });

    // Listen for notifications
    await client.query("LISTEN events_channel");
    console.log("Listening on events_channel");

    // Send a test notification with the same connection
    console.log("Sending test notification...");
    await client.query(
      "SELECT pg_notify('events_channel', '{\"test\": \"Direct notification\"}')"
    );
    console.log("Test notification sent");

    // Insert a test record
    console.log("Inserting test record...");
    try {
      await client.query("BEGIN");
      await client.query(`
        INSERT INTO events (id, users_id, lat, long, data, authority, severity) 
        VALUES (99999, 1, 0, 0, '{}', 'test', 'low')
      `);
      await client.query("COMMIT");
      console.log("Test record inserted");
    } catch (err) {
      console.error("Error inserting test record:", err);
    }

    // Keep process alive
    console.log("Waiting for events (Ctrl+C to exit)...");
  } catch (err) {
    console.error("Error:", err);
  }
}

testDirectNeonConnection();
