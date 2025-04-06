const express = require("express");
const path = require("path");
const app = express();
const db = require("./db/client");
const eventListener = require("./eventService");
const dbFunctions = require("./db/functions");
require("dotenv").config();

app.use(express.json());

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));

// Set up listener for database notifications
const http = require("http");
const server = http.createServer(app);

// Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", async (req, res) => {
  res.render("index");
});

app.get("/aboutUs", async (req, res) => {
  res.render("aboutUs");
});

app.get("/userSettings", async (req, res) => {
  res.render("userSettings");
});

app.get("/dashboard", async (req, res) => {
  res.render("dashboard");
});

app.get("/events", async (req, res) => {
  const result = await db.query("select * from events;");

  res.render("events", {
    includeListener: true,
    events: result.rows,
    eventsHash: dbFunctions.transformEventsToHash(result.rows),
  });
});

app.get("/users", async (req, res) => {
  const result = await db.query("select * from users;");
  console.log(JSON.stringify(result.rows));
  res.render("users", { users: result.rows });
});

app.get("/listeners", async (req, res) => {
  res.render("listeners");
});

// POST route for adding an event
app.post("/api/events", async (req, res) => {
  try {
    console.log("Received event data:", req.body);
    const { users_id, lat, long, data, authority, severity } = req.body;
    // let parsedData = {};
    // if (data) {
    //   try {
    //     parsedData = JSON.parse(data);
    //   } catch (err) {
    //     return res.status(400).send("Invalid JSON in additional data.");
    //   }
    // }
    await dbFunctions.insertEventNoId({
      users_id: Number(users_id),
      lat: Number(lat),
      long: Number(long),
      data: {description: data},
      authority,
      severity,
    });
    res.redirect("/events");
  } catch (error) {
    console.error("Error inserting event:", error);
    res.status(500).send("Server error.");
  }
});

// Initialize WebSockets BEFORE starting the server
eventListener.initialize(server);

const PORT = process.env.PORT || 3000;
// Use server.listen instead of app.listen
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
