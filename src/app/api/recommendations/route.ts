import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Sale from "@/models/Sale";
import Insight from "@/models/Insight";
import { generateInsights } from "@/lib/gemini";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const businessName = (session.user as any).business_name || "Unknown Business";
    const industry = (session.user as any).industry || "General";

    await connectDB();

    const totalSales = await Sale.countDocuments({ user_id: userId });
    if (totalSales === 0) {
      return NextResponse.json({ recommendations: [], message: "No sales data available" });
    }

    // Get product performance data
    const productPerf = await Sale.aggregate([
      { $match: { user_id: userId } },
      {
        $group: {
          _id: "$product_name",
          totalRevenue: { $sum: "$revenue" },
          totalQuantity: { $sum: "$quantity" },
          avgPrice: { $avg: "$price" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // Get hourly distribution
    const hourlyDist = await Sale.aggregate([
      { $match: { user_id: userId } },
      {
        $group: {
          _id: { $hour: "$date" },
          count: { $sum: 1 },
          revenue: { $sum: "$revenue" },
        },
      },
      { $sort: { count: 1 } },
    ]);

    // Get monthly trends for growth
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
      { $limit: 2 },
    ]);

    // Category performance
    const categoryPerf = await Sale.aggregate([
      { $match: { user_id: userId } },
      {
        $group: {
          _id: "$category",
          revenue: { $sum: "$revenue" },
          quantity: { $sum: "$quantity" },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    const totalRevenue = productPerf.reduce((sum, p) => sum + p.totalRevenue, 0);

    // Get customer engagement data
    const uniqueCustomers = await Sale.distinct("customer_id", { user_id: userId });
    const repeatCustomers = await Sale.aggregate([
      { $match: { user_id: userId } },
      { $group: { _id: "$customer_id", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ]);

    const repeatRate = uniqueCustomers.length > 0
      ? (repeatCustomers.length / uniqueCustomers.length) * 100
      : 0;

    // ── MARKET LEARNING: Fetch recent insights from similar-industry businesses ──
    const similarInsights = await Insight.find({
      industry,
      userId: { $ne: userId },          // exclude self
      insightType: "recommendations",
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Extract pattern summaries from similar businesses for context
    const marketTrends = similarInsights.flatMap((doc) =>
      (doc.insights as any[]).map((rec: any) => ({
        title: rec.title,
        description: rec.description,
        type: rec.type,
        priority: rec.priority,
      }))
    );

    const similarBusinessCount = new Set(similarInsights.map((d) => d.userId)).size;

    let recommendations: any[] = [];

    try {
      // Prepare context for Gemini
      const dataContext = {
        totalSales,
        totalRevenue: Math.round(totalRevenue),
        uniqueCustomers: uniqueCustomers.length,
        repeatRate: Math.round(repeatRate) + "%",
        topProducts: productPerf.slice(0, 5),
        bottomProducts: productPerf.slice(-5),
        categoryPerformance: categoryPerf.slice(0, 5),
        busiestHours: hourlyDist.slice(-3).reverse().map((h) => `${h._id}:00`),
        slowestHours: hourlyDist.slice(0, 3).map((h) => `${h._id}:00`),
        recentMonthlyTrends: monthlyRevenue,
      };

      // Build a market trends section for the prompt if we have similar business data
      const marketContext =
        marketTrends.length > 0
          ? `\n\nMARKET INTELLIGENCE (learned from ${similarBusinessCount} similar ${industry} businesses):\n${JSON.stringify(marketTrends.slice(0, 15), null, 2)}\n\nUse these market trends to inform your recommendations but always prioritize the user's specific data above.`
          : "";

      const prompt = `
        You are an expert AI business analyst for a ${industry} business. 
        Analyze the following sales dataset summary:
        ${JSON.stringify(dataContext)}
        ${marketContext}

        Generate exactly 4 highly actionable, data-driven business recommendations.
        Format your response EXACTLY as a JSON array of objects without any markdown formatting.
        Each object must have these EXACT keys:
        - "type": (string) one of ["promotion", "inventory", "timing", "growth", "diversification", "retention"]
        - "priority": (string) one of ["critical", "high", "medium", "info"]
        - "icon": (string) a single relevant emoji
        - "title": (string) a short, catchy title for the recommendation
        - "description": (string) 1-2 sentences explaining what to do and why it matters based directly on the provided data numbers.
        - "impact": (string) The expected impact or reason for this change.
        
        Example JSON output:
        [
          {
            "type": "retention",
            "priority": "high",
            "icon": "🚀",
            "title": "Boost Customer Loyalty",
            "description": "Your repeat customer rate is only 20%. Launch a VIP points program.",
            "impact": "Increases repeat buying"
          }
        ]
        
        Return ONLY valid JSON.
      `;

      const aiResponseText = await generateInsights(prompt);

      // Clean up markdown code blocks if the AI happens to output them
      const cleanedJsonText = aiResponseText.replace(/```json/gi, "").replace(/```/gi, "").trim();

      recommendations = JSON.parse(cleanedJsonText);

      // ── SAVE INSIGHT TO DB (non-blocking) ──
      const insightDoc = {
        userId,
        businessName,
        industry,
        insightType: "recommendations" as const,
        insights: recommendations,
        dataContext: {
          totalSales,
          totalRevenue: Math.round(totalRevenue),
          uniqueCustomers: uniqueCustomers.length,
          repeatRate: Math.round(repeatRate),
        },
      };
      Insight.create(insightDoc).catch((err: Error) =>
        console.error("Failed to save insight to DB:", err.message)
      );

    } catch (aiError: any) {
      console.error("Gemini failed, falling back to algorithmic recommendations", aiError);

      const isQuotaError = aiError.message === "QUOTA_EXCEEDED";
      const avgRevenue = totalRevenue / Math.max(productPerf.length, 1);

      // Intelligent Algorithmic Fallback Engine
      const fallbackRecs: any[] = [];

      // 1. Slow Sellers
      const slowSellers = productPerf.filter((p) => p.totalRevenue < avgRevenue * 0.4);
      if (slowSellers.length > 0) {
        fallbackRecs.push({
          type: "promotion", priority: "high", icon: "📢",
          title: "Promote Slow-Moving Inventory",
          description: `Identify ${slowSellers.length} products performing 60% below average. Bundle ${slowSellers[0]._id} with top sellers to clear stock.`,
          impact: "Recovers dead capital and increases AOV by ~12%",
        });
      }

      // 2. High Demand
      const topSellers = productPerf.filter((p) => p.totalRevenue > avgRevenue * 2);
      if (topSellers.length > 0) {
        fallbackRecs.push({
          type: "inventory", priority: "critical", icon: "📦",
          title: "Prevent Stockouts on Top Performers",
          description: `${topSellers[0]._id} is generating 200%+ of average revenue. Secure supply chain for top ${topSellers.length} items immediately.`,
          impact: "Prevents an estimated 15-20% loss in potential monthly revenue",
        });
      }

      // 3. Traffic Timing
      if (hourlyDist.length > 0) {
        const lowestHour = hourlyDist[0]._id;
        fallbackRecs.push({
          type: "timing", priority: "medium", icon: "⏰",
          title: "Optimize Low-Traffic Hours",
          description: `Sales velocity drops significantly around ${lowestHour}:00. Deploy time-sensitive flash sales or email blasts during this window.`,
          impact: "Can lift off-peak conversions by up to 25%",
        });
      }

      // 4. Retention
      if (repeatRate < 25) {
        fallbackRecs.push({
          type: "retention", priority: "high", icon: "🔄",
          title: "Critical: Improve Customer Retention",
          description: `Only ${Math.round(repeatRate)}% of customers return. Launch an automated re-engagement email sequence offering a 10% discount on second purchases.`,
          impact: "Boosting retention by 5% can increase profits by 25%+",
        });
      } else if (repeatRate > 40) {
        fallbackRecs.push({
          type: "growth", priority: "info", icon: "🚀",
          title: "Capitalize on High Loyalty",
          description: `Excellent repeat rate of ${Math.round(repeatRate)}%. Implement a VIP referral program to turn these loyal customers into brand advocates.`,
          impact: "Drives high-converting organic acquisition",
        });
      }

      // 5. Always add at least one notification if we rely on fallback
      if (fallbackRecs.length === 0) {
        fallbackRecs.push({
          type: "growth", priority: "info", icon: "📈",
          title: "Steady Baseline Performance",
          description: "Your metrics are stable across the board. Continue current marketing efforts and begin experimenting with new acquisition channels.",
          impact: "Maintains current growth trajectory",
        });
      }

      if (isQuotaError && fallbackRecs.length > 0) {
        fallbackRecs[0].description += " (Generated via local algorithmic fallback due to AI quota limits).";
      }

      recommendations = fallbackRecs;
    }

    return NextResponse.json({
      recommendations: recommendations.sort((a, b) => {
        const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, info: 3 };
        return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
      }),
      summary: {
        totalProducts: productPerf.length,
        totalCategories: categoryPerf.length,
        totalCustomers: uniqueCustomers.length,
        repeatRate: Math.round(repeatRate),
      },
      marketContext: {
        similarBusinesses: similarBusinessCount,
        industry,
        insightsLearned: marketTrends.length,
      },
    });
  } catch (error: any) {
    console.error("Recommendations error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate recommendations" }, { status: 500 });
  }
}
