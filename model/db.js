import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const db = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    connectionLimit: 10,
  })
  .promise();

// ✅ Test pool connection with async/await
(async () => {
  try {
    const connection = await db.getConnection();
    console.log("Connected to the database");
    connection.release();
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
})();

const createTables = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS vault (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        service TEXT NOT NULL,
        username_or_email TEXT NOT NULL,
        password TEXT NOT NULL,
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log("Tables created successfully");
  } catch (err) {
    console.error("Error creating tables:", err.message);
  }
};
db.query(createTables)
  .then(() => console.log("Database tables created successfully"))

  .catch((err) =>
    console.error("Error creating database tables:", err.message)
  );

//   datebase demo input
db.query(
  "INSERT INTO vault (user_id, service, username_or_email, password, note) VALUES (?, ?, ?, ?, ?)",
  [
    1,
    "example.com",
    " gytftydyd",
    "password123",
    "This is a note for the example.com service",
  ]
);
export default db;
