// middlewares/verifyToken.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

export function verifyToken(req, res, next) {
  const token = req.cookies.token
  console.log("Token from cookies:", token); // for dev only — remove in production
  if (!token) return res.redirect("/auth/login");

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.redirect("/auth/login");
    req.user = user;
    next();
  });
}
