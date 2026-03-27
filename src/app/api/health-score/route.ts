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
      return NextResponse.json({ score: 0, breakdown: {}, grade: "N/A", message: "No data" });
    }

    // 1. Sales Growth Score (0-100)
    const monthlyRevenue = await Sale.aggregate([
      { $match: { user_id: userId } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          revenue: { $sum: "$revenue" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 3 },
    ]);

    let salesGrowthScore = 50; // default
    if (monthlyRevenue.length >= 2) {
      const current = monthlyRevenue[0].revenue;
      const previous = monthlyRevenue[1].revenue;
      const growthRate = previous > 0 ? ((current - previous) / previous) * 100 : 0;
      // Map growth rate to score: -50% → 0, 0% → 50, +50% → 100
      salesGrowthScore = Math.max(0, Math.min(100, 50 + growthRate));
    }

    // 2. Customer Retention Score (0-100)
    const uniqueCustomers = await Sale.distinct("customer_id", { user_id: userId });
    const repeatCustomers = await Sale.aggregate([
      { $match: { user_id: userId } },
      { $group: { _id: "$customer_id", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ]);

    const retentionRate = uniqueCustomers.length > 0
      ? (repeatCustomers.length / uniqueCustomers.length) * 100
      : 0;
    const customerRetentionScore = Math.min(100, retentionRate * 1.5); // Scale up

    // 3. Product Performance Score (0-100)
    const productPerf = await Sale.aggregate([
      { $match: { user_id: userId } },
      {
        $group: {
          _id: "$product_name",
          revenue: { $sum: "$revenue" },
          quantity: { $sum: "$quantity" },
        },
      },
    ]);

    const totalRevenue = productPerf.reduce((sum, p) => sum + p.revenue, 0);
    const avgProductRevenue = productPerf.length > 0 ? totalRevenue / productPerf.length : 0;
    const performingProducts = productPerf.filter((p) => p.revenue > avgProductRevenue * 0.5).length;
    const productPerformanceScore =
      productPerf.length > 0
        ? Math.min(100, (performingProducts / productPerf.length) * 100 + 20)
        : 0;

    // 4. Revenue Consistency Score (0-100)
    let consistencyScore = 50;
    if (monthlyRevenue.length >= 2) {
      const revenues = monthlyRevenue.map((m) => m.revenue);
      const mean = revenues.reduce((a, b) => a + b, 0) / revenues.length;
      const variance = revenues.reduce((sum, r) => sum + (r - mean) ** 2, 0) / revenues.length;
      const cv = mean > 0 ? Math.sqrt(variance) / mean : 1; // coefficient of variation
      consistencyScore = Math.max(0, Math.min(100, 100 - cv * 100));
    }

    // Weighted total
    const weights = {
      salesGrowth: 0.3,
      customerRetention: 0.25,
      productPerformance: 0.25,
      consistency: 0.2,
    };

    const totalScore = Math.round(
      salesGrowthScore * weights.salesGrowth +
        customerRetentionScore * weights.customerRetention +
        productPerformanceScore * weights.productPerformance +
        consistencyScore * weights.consistency
    );

    let grade = "F";
    if (totalScore >= 90) grade = "A+";
    else if (totalScore >= 80) grade = "A";
    else if (totalScore >= 70) grade = "B";
    else if (totalScore >= 60) grade = "C";
    else if (totalScore >= 50) grade = "D";

    const breakdown = {
      salesGrowth: { score: Math.round(salesGrowthScore), weight: "30%", label: "Sales Growth" },
      customerRetention: { score: Math.round(customerRetentionScore), weight: "25%", label: "Customer Retention" },
      productPerformance: { score: Math.round(productPerformanceScore), weight: "25%", label: "Product Performance" },
      consistency: { score: Math.round(consistencyScore), weight: "20%", label: "Revenue Consistency" }
    };
    
    // ── MARKET LEARNING: Fetch recent health-score insights from similar-industry businesses ──
    const similarHealthInsights = await Insight.find({
      industry,
      userId: { $ne: userId },
      insightType: "health-score",
    })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    const similarHealthCount = new Set(similarHealthInsights.map((d) => d.userId)).size;

    // Build market context string for the prompt
    const healthMarketContext =
      similarHealthInsights.length > 0
        ? `\n\nMARKET BENCHMARK (from ${similarHealthCount} similar ${industry} businesses): Average health scores in your industry — ${JSON.stringify(
            similarHealthInsights.map((d) => ({
              score: (d.dataContext as any)?.totalScore,
              grade: (d.dataContext as any)?.grade,
            }))
          )}. Use this to contextualize whether the user is above or below their industry peers.`
        : "";

    // Use Gemini for a dynamic personalized health score summary
    let aiSummary = "Your business is performing adequately but there's room for improvement.";
    try {
      const prompt = `
        You are an expert AI business analyst. The user's ${industry} business has a health score of ${totalScore}/100 and a grade of ${grade}.
        Here is the breakdown of their score metrics:
        ${JSON.stringify(breakdown)}
        ${healthMarketContext}
        
        Write a very concise (2-3 sentences max) encouraging and analytical paragraph summarizing their business health and highlighting the immediate most important area to focus on based strictly on the lowest scoring metric. 
        Do not use markdown formatting, just return plain text.
      `;
      aiSummary = await generateInsights(prompt);

      // ── SAVE HEALTH SCORE INSIGHT TO DB (non-blocking) ──
      Insight.create({
        userId,
        businessName,
        industry,
        insightType: "health-score",
        insights: [{ score: totalScore, grade, breakdown }],
        dataContext: { totalScore, grade, breakdown },
      }).catch((err: Error) =>
        console.error("Failed to save health-score insight to DB:", err.message)
      );
    } catch (err: any) {
      console.error("Health score AI summary failed", err.message);
      
      // Algorithmic fallback summary generation
      const sortedMetrics = Object.values(breakdown).sort((a, b) => a.score - b.score);
      const weakest = sortedMetrics[0];
      const strongest = sortedMetrics[sortedMetrics.length - 1];
      
      if (totalScore >= 80) {
        aiSummary = `Your business is demonstrating exceptional health, driven by strong ${strongest.label.toLowerCase()}. To push for perfect optimization, focus immediately on improving ${weakest.label.toLowerCase()}, which is currently your lowest performing metric.`;
      } else if (totalScore >= 50) {
        aiSummary = `Your business has a stable foundation with good ${strongest.label.toLowerCase()}, but requires strategic intervention. Your priority should be addressing ${weakest.label.toLowerCase()} to prevent long-term revenue stagnation.`;
      } else {
        aiSummary = `Your business health is currently at risk. While your ${strongest.label.toLowerCase()} offers a baseline, critical attention is needed on ${weakest.label.toLowerCase()} to stabilize operations and recover growth.`;
      }
    }

    return NextResponse.json({
      score: totalScore,
      grade,
      breakdown,
      insights: {
        totalCustomers: uniqueCustomers.length,
        repeatCustomers: repeatCustomers.length,
        totalProducts: productPerf.length,
        totalRevenue: Math.round(totalRevenue),
      },
      aiSummary
    });
  } catch (error: any) {
    console.error("Health score error:", error);
    return NextResponse.json({ error: error.message || "Failed to calculate health score" }, { status: 500 });
  }
}
