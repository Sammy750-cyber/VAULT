import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import { verifyToken } from "../middleware/verifyToken.js";
import { decrypt } from "../utils/encryption.js";
import authLimiter from "../middleware/rateLimiter.js";
import cookieParser from "cookie-parser";
import { login, register, verifyOTP } from "../controllers/auth.controller.js";
import pool from "../model/db.js";
dotenv.config();

const authRouter = express.Router();

authRouter.use(express.urlencoded({ extended: true }));
authRouter.use(cookieParser());

// vault file path
const vaultfile = "./data/vault.json";

authRouter.get("/", verifyToken, async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      // return res.status(403).json({ message: "Unauthorized" });
      return res.redirect("/auth/login");
    }

    const userId = user.id;
    const [user_info] = await pool.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    const [user_main] = user_info;
    const name = user_main.username;
    let [vault_data] = await pool.query(
      "SELECT * FROM vault WHERE user_id = ?",
      [user.id],
    );

    if (!vault_data || vault_data.length === 0) {
      // if no vault entries are found, render the index page with an empty array

      return res.render("index", {
        items: [],
        message: `Welcome back, ${name.charAt(0).toUpperCase() + name.slice(1)}`,
      });
    }
    // console.log("vault data:", vault_data) for debugging
    try {
      const items = await Promise.all(
        vault_data.map(async (entry) => ({
          id: entry.id,
          createdAT: entry.createdAT,
          updatedAT: entry.updatedAT,
          service: await decrypt(entry.service),
          username: await decrypt(entry.username_or_email),
          password: await decrypt(entry.password),
          note: await decrypt(entry.note),
        })),
      );
      if (items.length === 0) {
        // if no items are found, render the index page with an empty array
        return res.render("index", { items: [] });
      }
      // Render the index page with decrypted items
      res.cookie("user_id", user.id, {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // true in production
      });
      // why is it saying decryption error? - Cookie clashing
      // Render the index page with decrypted items
      res.render("index", {
        items,
        message: `Welcome back, ${name.charAt(0).toUpperCase() + name.slice(1)}`,
      });
    } catch (error) {
      res.status(500).json({ message: "Decryption error", error });
    }
  } catch (error) {
    next(error);
  }
});

authRouter.post("/auth/register", authLimiter, register);

// login route
authRouter.post("/auth/login", authLimiter, login);

// OTP verification
authRouter.post("/auth/verify", authLimiter, verifyOTP);

// GET REQUESTS

// GET /login
authRouter.get("/auth/login", (req, res) => {
  res.render("login", { error: null });
});

// GET /auth/otp
authRouter.get("/auth/otp", (req, res) => {
  res.render("otp", { error: null });
});

// GET /logout
authRouter.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/auth/login");
});

export default authRouter;
