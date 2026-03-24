import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";
import nodemailer from "nodemailer";
import fs from "fs";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    fs.appendFileSync("forgot-password-debug.log", `Request for: ${email}\n`);

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email });

    if (!user) {
      fs.appendFileSync("forgot-password-debug.log", `User not found for: ${email}\n`);
      // For security reasons, don't reveal if user exists or not
      return NextResponse.json({ message: "If an account exists with that email, a reset link has been sent." });
    }

    fs.appendFileSync("forgot-password-debug.log", `User found: ${user._id}\n`);

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    
    try {
      await user.save();
      fs.appendFileSync("forgot-password-debug.log", `User saved successfully. Token: ${resetToken}\n`);
    } catch (saveError: any) {
      fs.appendFileSync("forgot-password-debug.log", `Error saving user: ${saveError.message}\n`);
      throw saveError;
    }

    // Send email via Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: `"InsightFlow AI" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Reset your InsightFlow AI password",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0f172a;">Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #0f172a; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; margin-top: 16px;">Reset Password</a>
          <p style="margin-top: 24px; color: #64748b; font-size: 14px;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    fs.appendFileSync("forgot-password-debug.log", `Reset email sent successfully to: ${email}\n`);

    return NextResponse.json({ message: "Reset link sent successfully" });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
