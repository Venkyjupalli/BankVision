
const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

const allowedOrigins = (
  process.env.FRONTEND_URL || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header, such as server-side health checks.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
  })
);

app.use(express.json());

app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("BankVision Backend is Running");
});

app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS database_status");

    res.json({
      status: "success",
      message: "BankVision backend is running",
      database:
        rows[0].database_status === 1
          ? "Connected"
          : "Disconnected",
    });
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

app.listen(PORT, () => {
  console.log(`BankVision backend running on port ${PORT}`);
});
