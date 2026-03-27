const { Client } = require('pg');

async function getDB() {
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'env',
    password: process.env.DB_PASSWORD || 'Ammar@193',
    port: process.env.DB_PORT || 5432,
  });
  
  await client.connect();
  return client;
}

// For backward compatibility - serverless DB helper
async function query(sql, params = []) {
  const client = await getDB();
  try {
    return await client.query(sql, params);
  } finally {
    await client.end();
  }
}

module.exports = {
  query,
  getDB,
  Client
};

