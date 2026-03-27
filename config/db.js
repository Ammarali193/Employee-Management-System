// //const { Pool } = require("pg");

// //const pool = new Pool({
//    // user: "postgres",
//     //host: "localhost",
//     //database: "env",
//     //password: "Ammar@193",
//     //port: 5432,
// //});

// //module.exports = pool;

// ////////New Database Work //////////
// const { Pool } = require("pg");

// const pool = new Pool({
//     user: process.env.DB_USER || "postgres",
//     host: "localhost",
//     database: "env",
//     password: process.env.DB_PASSWORD || "Ammar@193",
//     port: 5432,
// });

// // Prevent process crash on unexpected idle client errors.
// pool.on("error", (err) => {
//     console.error("Unexpected PostgreSQL pool error:", err);
// });

// module.exports = pool;

const { Pool } = require("pg");

// ✅ Create Pool
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "env",
  password: process.env.DB_PASSWORD || "Ammar@193",
  port: process.env.DB_PORT || 5432,

  // 🔥 Optional but recommended
  max: 10, // max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// ✅ Handle unexpected errors
pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err);
});

// ✅ Test DB connection (run once on start)
(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL connected successfully");
    client.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
})();

module.exports = pool;