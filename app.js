import express from "express";
import dotenv from "dotenv";
import vaultRouter from "./routes/vault.js";
import authRouter from "./routes/authRoutes.js";
import path from "path";
import cookieParser from "cookie-parser"; // For parsing cookies
import { fileURLToPath } from "url";
import methodoverride from "method-override"; // For handling PUT and DELETE methods in forms

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser()); // Use cookie-parser middleware to parse cookies
app.use(methodoverride("_method")); // Use method-override middleware to support PUT and DELETE methods in forms

// Set the views directory
app.set(
  "views",
  path.join(path.dirname(fileURLToPath(import.meta.url)), "views")
);

// Vault routes
// This will handle all vault related routes
// It includes saving, updating, and deleting credentials
app.use("/",vaultRouter);

// Authentication routes
// This will handle all authentication related routes
app.use("/", authRouter);

// Serve static files from the "public" directory
app.use(express.static("public"));

// GET /
app.post("/enc", (req, res) => {
  const data = req.body;
  console.log(data);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

export default app;
