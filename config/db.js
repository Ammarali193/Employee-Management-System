const { Pool } = require('pg');

// Create a connection pool (reuses connections) instead of creating new ones per query
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'env',
  password: process.env.DB_PASSWORD || 'Ammar@193',
  port: process.env.DB_PORT || 5432,
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Timeout for acquiring a connection
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Export the pool directly - all queries use the same connection pool
module.exports = pool;

