const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "visa_matrix",
  password: "Ruushisdeo14$",
  port: 5432,
});

module.exports = pool;