import pool from "../model/db.js";
import sendOTPEmail from "../utils/send_otp_to_mail.js";
import createAccessToken from "../auth/jwtToken.js";
import dotenv from "dotenv";
import { compare, hash } from "../utils/password.js";
dotenv.config();


// OTP sessions per login request
const otpSessions = new Map();
export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email, and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Check if email already exists
    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }
    const username = email.split("@")[0];
    const passwordHash = await hash(password);

    await pool.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, passwordHash],
    );

    res.status(201).json({ message: "Account created" });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const [user] = users;
    if (!user) {
      // render the login page with an error
      return res.render("login", { error: "Invalid credentials" });
    }

    const valid = await compare(password, user.password);
    if (!valid) {
      // render the login page with an error
      return res.render("login", { error: "Invalid credentials" });
    }

    const otp = await sendOTPEmail(user.email);
    console.log(otp);
    // handle error for otp

    otpSessions.set(user.id, { otp, timestamp: Date.now() });
    console.log("Otp sessions: ", otpSessions)
    // Set a cookie with the username for later verification
    // This is for the OTP verification step
    res.cookie("user_id", user.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // true in production
    });
    res.redirect("/auth/otp");
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res) => {
  const { otp } = req.body;
  const userId = req.cookies.user_id;
  const session = otpSessions.get(parseInt(userId));
//   console.log("id: ",userId);
//   console.log("sessions: ", session) for debugging
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
    const AccessToken = await createAccessToken({ id: userId });
    otpSessions.delete(userId);

    res.cookie("token", AccessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // true in production
    });
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
