//const { Pool } = require("pg");

//const pool = new Pool({
   // user: "postgres",
    //host: "localhost",
    //database: "env",
    //password: "Ammar@193",
    //port: 5432,
//});

//module.exports = pool;

//New Database Work //
const { Pool } = require("pg");

const pool = new Pool({
    user: process.env.DB_USER,
    host: "localhost",
    database: "env",
    password: "Ammar@193",
    port: 5432,
});

module.exports = pool;