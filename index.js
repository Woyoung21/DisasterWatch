const express = require("express");
const app = express();
const db = require("./db/client");
require("dotenv").config();

app.use(express.json());

app.get("/", async (req, res) => {
  const result = await db.query("select * from events;");
  res.send(result.rows[0]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
