const WebSocket = require("ws");
const { Client } = require("pg");
require("dotenv").config();
const debug = require("./eventDebug");
const { EventPayload } = require("./public/eventModels");

function initialize(server) {
  const wss = new WebSocket.Server({ server, path: "/ws" });
  console.log("WebSocket server initialized at path /ws");

  // Set up WebSocket server
  wss.on("connection", (ws, req) => {
    debug.logConnection(ws, req);

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`[WS:${ws.id}] Message received:`, data);

        if (data.type === "subscribe" && data.userId) {
          debug.trackSubscription(ws, data.userId);
          ws.userId = data.userId;
          ws.send(JSON.stringify({ type: "subscribed", status: "success" }));
        }
      } catch (err) {
        console.error(`[WS:${ws.id}] Error processing message:`, err);
      }
    });

    ws.on("close", () => {
      debug.logDisconnection(ws);
    });

    // Send a test message after connection
    setTimeout(() => {
      const testMessage = {
        type: "event_update",
        operation: "TEST",
        data: { message: "Test connection message" },
      };
      ws.send(JSON.stringify(testMessage));
      debug.trackMessageSent(ws, testMessage);
    }, 2000);
  });

  // Initialize direct database listener connection
  initDirectDbListener(wss);

  return wss;
}

// Create a dedicated PostgreSQL client for notifications
let listenerClient = null;

async function initDirectDbListener(wss) {
  console.log("📡 Initializing direct PostgreSQL notification listener");

  try {
    // Create a dedicated client with direct connection (no pooling)
    // Fix the pooler connection string if needed
    const connectionString = process.env.DATABASE_URL.replace("-pooler", "");

    listenerClient = new Client({
      connectionString: connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    // Connect the dedicated listener client
    await listenerClient.connect();
    console.log("✅ Direct notification listener connection established");

    // Set up notification listener
    listenerClient.on("notification", (notification) => {
      console.log("🔔 NOTIFICATION RECEIVED:");
      console.log("Channel:", notification.channel);
      console.log("PID:", notification.processId);

      try {
        // Use the EventPayload class to parse the notification
        const eventPayload = EventPayload.fromJSON(notification.payload);
        console.log("✅ Successfully parsed payload:", eventPayload);

        // Broadcast to WebSocket clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            // Send to all users or filter by userId
            if (
              !client.userId ||
              client.userId === eventPayload.record.users_id
            ) {
              const message = {
                type: "event_update",
                operation: eventPayload.operation || "NOTIFY",
                data: eventPayload.record.toObject(),
              };
              client.send(JSON.stringify(message));
              debug.trackMessageSent(client, message);
            }
          }
        });
      } catch (err) {
        console.error("❌ Error processing notification:", err);
        console.error("📄 Raw payload:", notification.payload);
      }
    });

    // Listen for events - using the LISTEN command directly
    await listenerClient.query("LISTEN events_channel");
    console.log("👂 Now listening on events_channel");

    // For testing, send a notification 5 seconds after startup
    setTimeout(async () => {
      console.log("📤 Sending a test notification to database channel");
      try {
        await listenerClient.query(
          'SELECT pg_notify(\'events_channel\', \'{"operation":"TEST","record":{"id":0,"message":"Direct server-generated test notification"}}\')'
        );
        console.log("✅ Test notification sent successfully");
      } catch (err) {
        console.error("❌ Failed to send test notification:", err);
      }
    }, 5000);

    // Set up cleanup on process exit
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
  } catch (error) {
    console.error(`❌ ERROR setting up database listener: ${error.message}`);
    console.error(error.stack);
  }
}

async function cleanup() {
  if (listenerClient) {
    try {
      console.log("🧹 Cleaning up notification listener...");
      await listenerClient.query("UNLISTEN *");
      await listenerClient.end();
      console.log("🔌 PostgreSQL notification listener closed");
    } catch (err) {
      console.error("❌ Error closing listener:", err);
    }
  }
}

module.exports = { initialize };
