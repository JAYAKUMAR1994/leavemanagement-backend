const mysql = require("mysql2/promise");
require("dotenv").config();

const mysqlDBConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

let database;

async function connectToDatabase() {
  try {
    const pool = await mysql.createPool(mysqlDBConfig);

    database = pool;

    console.log("Connected to MySQL");
    return database;
  } catch (error) {
    console.error("Error connecting to database:", error.message);
    throw error;
  }
}

module.exports = { connectToDatabase };
