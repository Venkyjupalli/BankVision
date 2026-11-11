
const mysql = require("mysql2/promise");
const path = require("path");
const fs = require("fs");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

// Read TiDB SSL certificate.
// Locally, DB_SSL_CA can contain the certificate file path.
// On Render, it can contain the actual PEM certificate.
const caValue = process.env.DB_SSL_CA;

if (!caValue) {
  throw new Error("DB_SSL_CA is missing from environment variables.");
}

const caCertificate = fs.existsSync(caValue)
  ? fs.readFileSync(caValue, "utf8")
  : caValue;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 4000,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    ca: caCertificate,
    rejectUnauthorized: true,
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
