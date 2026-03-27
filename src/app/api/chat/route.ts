import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Sale from "@/models/Sale";
import ChatSession from "@/models/ChatSession";
import { generateInsights } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, sessionId } = await req.json();
    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const businessName = (session.user as any).business_name || "your business";
    const industry = (session.user as any).industry || "General";
    const userName = session.user.name || "there";

    await connectDB();

    // Load or create session
    let chatSession: any;
    if (sessionId) {
      chatSession = await ChatSession.findOne({ _id: sessionId, userId });
    }
    if (!chatSession) {
      chatSession = await ChatSession.create({
        userId,
        title: message.trim().slice(0, 50) + (message.trim().length > 50 ? "…" : ""),
        messages: [],
      });
    }

    // Fetch business snapshot
    const totalSales = await Sale.countDocuments({ user_id: userId });
    let businessSnapshot = "No sales data uploaded yet.";
    if (totalSales > 0) {
      const productPerf = await Sale.aggregate([
        { $match: { user_id: userId } },
        { $group: { _id: "$product_name", totalRevenue: { $sum: "$revenue" }, quantity: { $sum: "$quantity" } } },
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 },
      ]);
      const uniqueCustomers = await Sale.distinct("customer_id", { user_id: userId });
      const repeatCustomers = await Sale.aggregate([
        { $match: { user_id: userId } },
        { $group: { _id: "$customer_id", count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
      ]);
      const totalRevenue = productPerf.reduce((s, p) => s + p.totalRevenue, 0);
      const repeatRate = uniqueCustomers.length > 0
        ? Math.round((repeatCustomers.length / uniqueCustomers.length) * 100)
        : 0;
      businessSnapshot = JSON.stringify({
        totalSales,
        totalRevenue: Math.round(totalRevenue),
        uniqueCustomers: uniqueCustomers.length,
        repeatRate: `${repeatRate}%`,
        topProducts: productPerf.slice(0, 5).map((p) => ({ name: p._id, revenue: Math.round(p.totalRevenue) })),
      });
    }

    // Build history context from saved messages
    const recentHistory = (chatSession.messages as any[])
      .slice(-6)
      .map((m: any) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const systemPrompt = `You are an expert AI business advisor for InsightFlow AI, helping ${userName} manage and grow their ${industry} business called "${businessName}".

You have access to real-time business data:
${businessSnapshot}

Your role is to:
- Answer questions about their business performance, sales, products, and customers
- Suggest actionable improvements and strategies
- Help analyse market trends and opportunities
- Provide clear, friendly, and professional advice
- Reference specific numbers from their data when relevant
- Keep responses concise (2-4 paragraphs max unless more detail is requested)

${recentHistory ? `Previous conversation:\n${recentHistory}\n` : ""}

Now answer the user's message. Do NOT use markdown headers (##). You may use bullet points. Be conversational and direct.

User: ${message}`;

    const reply = await generateInsights(systemPrompt);

    // Save both messages to session
    chatSession.messages.push({ role: "user", content: message.trim() });
    chatSession.messages.push({ role: "assistant", content: reply });
    await chatSession.save();

    return NextResponse.json({
      reply,
      sessionId: chatSession._id.toString(),
      sessionTitle: chatSession.title,
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    if (error.message === "QUOTA_EXCEEDED") {
      return NextResponse.json({ error: "AI quota exceeded. Please try again later." }, { status: 429 });
    }
    return NextResponse.json({ error: error.message || "Failed to get AI response" }, { status: 500 });
  }
}
