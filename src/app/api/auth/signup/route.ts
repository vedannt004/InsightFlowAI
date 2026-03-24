import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, business_name, industry, phone, address, state, pincode, country } = await req.json();

    if (!name || !email || !password || !business_name) {
      return NextResponse.json(
        { error: "Name, email, password, and business name are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const emailRegex = new RegExp(`^${email.trim()}$`, "i");
    const existingUser = await User.findOne({ email: emailRegex });

    if (existingUser) {
      if (existingUser.isVerified) {
        return NextResponse.json({ error: "User already exists" }, { status: 400 });
      }
      
      // If unverified, update OTP and resend
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      existingUser.verificationCode = verificationCode;
      existingUser.verificationTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
      await existingUser.save();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"InsightFlow AI" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Verify your InsightFlow AI account - New Code",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #0f172a; margin-top: 0;">New Verification Code</h2>
            <p style="color: #475569; line-height: 1.5;">Your new 6-digit verification code is:</p>
            <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
              <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0f172a;">${verificationCode}</span>
            </div>
            <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">This code will expire in 10 minutes.</p>
          </div>
        `,
      });

      return NextResponse.json(
        { message: "Verification code resent. Please check your email.", email },
        { status: 200 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      business_name,
      industry: industry || "General",
      phone,
      address,
      state,
      pincode,
      country,
      isVerified: false,
      verificationCode,
      verificationTokenExpires,
    });

    // Send verification email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"InsightFlow AI" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Verify your InsightFlow AI account",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #0f172a; margin-top: 0;">Welcome to InsightFlow AI!</h2>
          <p style="color: #475569; line-height: 1.5;">Please use the following 6-digit verification code to complete your registration:</p>
          <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0f172a;">${verificationCode}</span>
          </div>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">This code will expire in 10 minutes.</p>
        </div>
      `,
    });

    return NextResponse.json(
      {
        message: "Signup initiated. Please verify the OTP sent to your email.",
        email: email,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
