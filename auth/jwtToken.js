import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export default async function createAccessToken(user) {
  return jwt.sign(
    { id: user.id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "1h",
    }
  );
}
