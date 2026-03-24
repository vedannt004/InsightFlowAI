import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    const user = await User.findOne({ email: "test@example.com" });
    if (!user) return NextResponse.json({ error: "User not found" });

    const isValid = await bcrypt.compare("Password123!", user.password);
    return NextResponse.json({ 
      userFound: true, 
      passwordHash: user.password,
      isValid 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
