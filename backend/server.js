const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const listingsRouter = require("./routes/listings");
const db = require("./db/database");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Mera Basera Backend is running 🚀",
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/health/db", async (req, res) => {
  try {
    const now = await db.checkConnection();
    res.json({ status: "ok", db_time: now });
  } catch (err) {
    console.error("DB health check failed:", err.message);
    res.status(500).json({ status: "error", error: "Could not reach the database" });
  }
});

app.use("/api/listings", listingsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
