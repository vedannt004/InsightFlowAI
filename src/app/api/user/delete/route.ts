import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    await connectDB();
    
    const userId = (session.user as any).id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Note: In a real app, you would also delete user-related data (files, forecasts, etc.) here.

    return NextResponse.json({ message: "Account deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Delete account error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
