import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export default async function createAccessToken(user) {
  return jwt.sign(
    { username: user.username },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "10m",
    }
  );
}
