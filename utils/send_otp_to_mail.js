import nodemailer from "nodemailer";
import dotenv from "dotenv";
import generateOTP from "./generateOTP.js";
dotenv.config();



// Send OTP Email
export default async function sendOTPEmail(toEmail) {
  const otp = generateOTP();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Vault Security" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Verification Code</h2>
        <p>Your OTP code is:</p>
        <h1 style="color: #2e6c80;">${otp}</h1>
        <p>This code will expire in 5 minutes.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return otp; // Return the OTP so you can store it temporarily (e.g. in DB or cache)
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send OTP");
  }
}
