const express = require("express");
const path = require("path");
const app = express();
const db = require("./db/client");
require("dotenv").config();

app.use(express.json());

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res) => {
  const result = await db.query("select * from events;");
  res.send(result.rows[0]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
