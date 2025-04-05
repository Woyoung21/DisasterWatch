const express = require("express");
const path = require("path");
const app = express();
const db = require("./db/client");
require("dotenv").config();

app.use(express.json());

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, "public")));

// Set EJS as the templating engine
app.set("view engine", "ejs");
// Optionally set the views directory (default is "./views")
app.set("views", path.join(__dirname, "views"));

app.get("/", async (req, res) => {
  // Render the 'index' template
  res.render("index");
});

app.get("/events", async (req, res) => {
  const result = await db.query("select * from events;");
  // Render the 'index' template and pass data to it
  console.log(JSON.stringify(result.rows));
  res.render("events", { events: result.rows });
  // res.send(result.rows[0]);
});

app.get("/users", async (req, res) => {
  const result = await db.query("select * from users;");

  console.log(JSON.stringify(result.rows));
  res.render("users", { users: result.rows });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
