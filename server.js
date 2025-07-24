import app from "./app.js"
import dotenv from "dotenv"
dotenv.config()

app.listen(process.env.PORT, () => {
  console.log(`Server is now live on http://localhost:${process.env.PORT}`);
});