const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "138.197.83.151",
  user: process.env.DB_USER ?? "lablens-api",
  password: process.env.DB_PASSWORD ?? "juE)x0-7W2Ct",
  database: process.env.DB_NAME ?? "db_lablens",
  port: Number(process.env.DB_PORT ?? 3001),
  waitForConnections: true,
  connectionLimit: 6,
  queueLimit: 0,
});

module.exports = pool;
