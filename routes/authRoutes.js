import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import { verifyToken } from "../middleware/verifyToken.js";
import { decrypt } from "../utils/encryption.js";
import createAccessToken from "../auth/jwtToken.js";
import sendOTPEmail from "../utils/send_otp_to_mail.js";
import bcrypt from "bcrypt";
import authLimiter from "../middleware/rateLimiter.js";
import cookieParser from "cookie-parser";
dotenv.config();

const authRouter = express.Router();

authRouter.use(express.urlencoded({ extended: true }));
authRouter.use(cookieParser());

const users = [
  {
    username: process.env.USERNAME_ || "sam",
    email: process.env.EMAIL_TO || "user@gmail.com",
    password: process.env.PASSWORD_, // hashed password
  },
];

console.log("Users:", users); // for dev only — remove in production

// OTP sessions per login request
const otpSessions = new Map();

// vault file path
const vaultfile = "./data/vault.json";

authRouter.get("/", verifyToken, async (req, res) => {
  const user = req.user;
  console.log("User from token:", user); // for dev only — remove in production
  if (!user) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  let vault = JSON.parse(fs.readFileSync(vaultfile, "utf-8"));
  if (!vault || vault.length === 0) {
    return res.status(404).json({ message: "No vault entries found" });
  }

  try {
    const items = await Promise.all(
      vault.map(async (entry) => ({
        id: entry.id,
        createdAT: entry.createdAT,
        updatedAT: entry.updatedAT,
        service: await decrypt(entry.service),
        username: await decrypt(entry.username),
        password: await decrypt(entry.password),
        note: await decrypt(entry.note),
      }))
    );
    if (items.length === 0) {
      // if no items are found, render the index page with an empty array
      return res.render("index", { items: [] });
    }
    // Render the index page with decrypted items
    res.cookie("username", user.username, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // true in production
    });
    // why is it saying decryption error?
    // Render the index page with decrypted items
    res.render("index", { items });
  } catch (error) {
    res.status(500).json({ message: "Decryption error", error });
  }
});

// login route
authRouter.post("/auth/login", authLimiter, async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
  if (!user) {
    // render the login page with an error
    return res.render("login", { error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    // render the login page with an error
    return res.render("login", { error: "Invalid credentials" });
  }

  const otp = await sendOTPEmail(user.email);
  otpSessions.set(username, { otp, timestamp: Date.now() });
  console.log(`OTP for ${username}: ${otp}`); // for dev only — remove in production
  res.cookie("username", username, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // true in production
  });
  res.redirect("/auth/otp");
});

// OTP verification
authRouter.post("/auth/verify", authLimiter, async (req, res) => {
  const { otp } = req.body;
  const username = req.cookies.username;
  const session = otpSessions.get(username);

  if (!session) {
    // render the OTP page with an error
    return res.render("otp", {
      error: "Session expired or invalid. Please try again.",
    });
  }

  if (parseInt(otp) !== parseInt(session.otp)) {
    // render the OTP page with an error
    return res.render("otp", { error: "Invalid OTP. Please try again." });
  }

  try {
    const AccessToken = await createAccessToken({ username });
    otpSessions.delete(username);

    res.cookie("token", AccessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // true in production
    });
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

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
