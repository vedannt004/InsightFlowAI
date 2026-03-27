import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Sale from "@/models/Sale";
import { generateInsights } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, history } = await req.json();
    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const businessName = (session.user as any).business_name || "your business";
    const industry = (session.user as any).industry || "General";
    const userName = session.user.name || "there";

    await connectDB();

    // Fetch a quick business snapshot to give the AI real context
    const totalSales = await Sale.countDocuments({ user_id: userId });
    let businessSnapshot = "No sales data uploaded yet.";

    if (totalSales > 0) {
      const productPerf = await Sale.aggregate([
        { $match: { user_id: userId } },
        {
          $group: {
            _id: "$product_name",
            totalRevenue: { $sum: "$revenue" },
            quantity: { $sum: "$quantity" },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 },
      ]);

      const monthlyRevenue = await Sale.aggregate([
        { $match: { user_id: userId } },
        {
          $group: {
            _id: { year: { $year: "$date" }, month: { $month: "$date" } },
            revenue: { $sum: "$revenue" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 3 },
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
        recentMonthlyRevenue: monthlyRevenue,
      });
    }

    // Build conversation history context
    const historyText = Array.isArray(history) && history.length > 0
      ? history
          .slice(-6) // last 6 messages for context
          .map((h: { role: string; content: string }) => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`)
          .join("\n")
      : "";

    const systemPrompt = `You are an expert AI business advisor for InsightFlow AI, helping ${userName} manage and grow their ${industry} business called "${businessName}".

You have access to real-time business data:
${businessSnapshot}

Your role is to:
- Answer questions about their business performance, sales, products, and customers
- Suggest actionable improvements and strategies
- Help analyse market trends and opportunities
- Provide clear, friendly, and professional advice
- Reference specific numbers from their data when relevant
- Keep responses concise but insightful (2-4 paragraphs max unless detail is requested)

${historyText ? `Previous conversation:\n${historyText}\n` : ""}

Now answer the user's latest message. Do NOT use markdown headers (##), but you may use bullet points. Be conversational and direct.

User: ${message}`;

    const response = await generateInsights(systemPrompt);

    return NextResponse.json({ reply: response });
  } catch (error: any) {
    console.error("Chat error:", error);
    if (error.message === "QUOTA_EXCEEDED") {
      return NextResponse.json(
        { error: "AI quota exceeded. Please try again later." },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to get AI response" },
      { status: 500 }
    );
  }
}
