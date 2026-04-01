import pool from "../model/db.js";

const usersTable = `
CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
`;

const vaultTable = `
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
`;

const createTable = async (tableName, query) => {
    try {
        await pool.query(query);
        console.log(`Successfully Created ${tableName} Table`);
    } catch (err) {
        console.log(`Error creating ${tableName}: ${err}`);
    };
};

const createAllTables = async()=>{
    try {
        await createTable("Users", usersTable);
        await createTable("Vault", vaultTable);
        console.log("Successfully created all tables");
    } catch (err) {
        console.log("An error occured:", err)
    }
}

export default createAllTables;