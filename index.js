const express = require("express");
const path = require("path");
const app = express();
const db = require("./db/client");
const eventListener = require("./eventService");
require("dotenv").config();

app.use(express.json());

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, "public")));

// Set up listener for database notifications
const http = require("http");
const server = http.createServer(app);

// Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", async (req, res) => {
  res.render("index");
});

app.get("/events", async (req, res) => {
  const result = await db.query("select * from events;");
  console.log(JSON.stringify(result.rows));
  res.render("events", { events: result.rows });
});

app.get("/users", async (req, res) => {
  const result = await db.query("select * from users;");
  console.log(JSON.stringify(result.rows));
  res.render("users", { users: result.rows });
});

app.get("/listeners", async (req, res) => {
  res.render("listeners");
});

// Initialize WebSockets BEFORE starting the server
eventListener.initialize(server);

const PORT = process.env.PORT || 3000;
// Use server.listen instead of app.listen
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
