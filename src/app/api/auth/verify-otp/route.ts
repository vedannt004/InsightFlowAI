import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({
      email: new RegExp(`^${email.trim()}$`, "i"),
      verificationCode: otp,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (error: any) {
    console.error("OTP Verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
