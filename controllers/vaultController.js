import { encrypt } from "../utils/encryption.js";
import pool from "../model/db.js";

export async function save_credentials(req, res, next) {
  try {
    const user = req.user;
    const credentials = req.body;
    // console.log(credentials); for debugging
    if (!user) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (
      !credentials?.username ||
      !credentials?.password ||
      !credentials?.note ||
      !credentials?.service
    ) {
      // if any of the required fields are missing
      return res.status(400).json({ message: "All fields are required" });
    }
    try {
      credentials.username = await encrypt(credentials.username);
      credentials.password = await encrypt(credentials.password);
      credentials.note = await encrypt(credentials.note);
      credentials.service = await encrypt(credentials.service);

      await pool.query(
        "INSERT INTO vault (user_id, service, username_or_email, password, note) VALUES (?, ?, ?, ?, ?)",
        [
          user.id,
          credentials.service,
          credentials.username,
          credentials.password,
          credentials.note,
        ],
      );

      // render the index page with the updated vault
      res.redirect("/");
    } catch (error) {
      res.status(500).json({ message: "Server error this", error });
    }
  } catch (error) {
    next(error);
  }
}

export async function update_credentials(req, res) {
  const { id } = req.params;
  const updates = req.body;
  // console.log(updates);

  try {
    if (updates.username) updates.username = await encrypt(updates.username);
    if (updates.password) updates.password = await encrypt(updates.password);
    if (updates.note) updates.note = await encrypt(updates.note);
    if (updates.service) updates.service = await encrypt(updates.service);

    await pool.query(
      "UPDATE vault SET username_or_email = ?, password = ?, note = ?, service = ? WHERE id = ?",
      [updates.username, updates.password, updates.note, updates.service, id],
    );

    // render index page with messages
    res.redirect("/");
  } catch (error) {
    // console.log(error); for debugging
    res.status(500).json({ message: "Server error" });
  }
}

export async function delete_credentials(req, res) {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM vault WHERE id = ?", [id]);
    // render index page with messages
    res.redirect("/");
  } catch (error) {
    // console.log(error); for debugging
    res.status(500).json({ message: "Server error" });
  }
}

// Additonal features - this is just prototype
