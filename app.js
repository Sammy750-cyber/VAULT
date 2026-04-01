import express from "express";
import dotenv from "dotenv";
import router from "./routes/vault.js";
import authRouter from "./routes/authRoutes.js";
import path from "path";
import cookieParser from "cookie-parser"; // For parsing cookies
import { fileURLToPath } from "url";
import methodoverride from "method-override"; // For handling PUT and DELETE methods in forms
import errorHandler from "./middleware/error.middleware.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser()); // Use cookie-parser middleware to parse cookies
app.use(methodoverride("_method")); // Use method-override middleware to support PUT and DELETE methods in forms
app.use(errorHandler);
// Set the views directory
app.set(
  "views",
  path.join(path.dirname(fileURLToPath(import.meta.url)), "views"),
);


app.use("/vault", router);

app.use("/", authRouter);

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
