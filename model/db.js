import mysql from "mysql2";
import createAllTables from "../utils/db.utils.js";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "Leads_DB",
  port: process.env.DB_PORT || "3306",
  password: process.env.DB_PASSWORD || "iseeyou!!",
  database: process.env.DB_NAME || "VAULT",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  idleTimeout: 60000,
  connectTimeout: 10000,
})
  .promise();


pool
  .getConnection()
  .then((connection) => {
    console.log("Database connected successfully!");
    createAllTables();
    connection.release();
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });


// // Test pool connection with async/await
// (async () => {
//   try {
//     const connection = await pool.getConnection();
//     console.log("Connected to the database");
//     connection.release();
//   } catch (err) {
//     console.error("Database connection failed:", err.message);
//   }
// })();

// pool.query(createAllTables)
//   .then(() => console.log("Database tables created successfully"))

//   .catch((err) =>
//     console.error("Error creating database tables:", err.message)
//   );

export default pool;
