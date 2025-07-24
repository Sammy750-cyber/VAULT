import express from "express";
import {
  save_credentials,
  update_credentials,
  delete_credentials,
} from "../controllers/vaultController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import authLimiter from "../middleware/rateLimiter.js"; // Importing the rate limiter middleware
import cookieParser from "cookie-parser"; // For parsing cookies
// Importing the vaultController and verifyToken middleware
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(cookieParser()); // Use cookie-parser middleware to parse cookies

router.post("/vault/add", verifyToken, save_credentials);
router.put("/vault/:id", verifyToken, update_credentials);
router.delete("/vault/:id", verifyToken, delete_credentials);

export default router;
