const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "localhost",
  user: process.env.DB_USER ?? "your_user",
  password: process.env.DB_PASSWORD ?? "your_password",
  database: process.env.DB_NAME ?? "lablens",
  port: Number(process.env.DB_PORT ?? 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
