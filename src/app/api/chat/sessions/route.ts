import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import ChatSession from "@/models/ChatSession";

// GET /api/chat/sessions — list all sessions for the logged-in user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    await connectDB();

    const sessions = await ChatSession.find({ userId })
      .sort({ updatedAt: -1 })
      .select("_id title updatedAt createdAt")
      .limit(50)
      .lean();

    return NextResponse.json({ sessions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
