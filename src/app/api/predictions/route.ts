import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Sale from "@/models/Sale";
import Prediction from "@/models/Prediction";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectDB();

    // Get historical monthly data
    const monthlyData = await Sale.aggregate([
      { $match: { user_id: userId } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          revenue: { $sum: "$revenue" },
          orders: { $sum: 1 },
          avgQuantity: { $avg: "$quantity" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    if (monthlyData.length < 2) {
      return NextResponse.json({
        historical: [],
        forecast: [],
        productDemand: [],
        message: "Need at least 2 months of data for forecasting",
      });
    }

    // Simple linear regression forecast
    const revenues = monthlyData.map((d) => d.revenue);
    const n = revenues.length;
    const xMean = (n - 1) / 2;
    const yMean = revenues.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (revenues[i] - yMean);
      denominator += (i - xMean) * (i - xMean);
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = yMean - slope * xMean;

    // Forecast next 3 months
    const lastEntry = monthlyData[monthlyData.length - 1];
    let lastYear = lastEntry._id.year;
    let lastMonth = lastEntry._id.month;

    const forecast = [];
    for (let i = 1; i <= 3; i++) {
      lastMonth++;
      if (lastMonth > 12) {
        lastMonth = 1;
        lastYear++;
      }
      const predicted = Math.max(0, slope * (n - 1 + i) + intercept);

      // Confidence based on R² approximation
      const ssRes = revenues.reduce((sum, y, idx) => {
        const yHat = slope * idx + intercept;
        return sum + (y - yHat) ** 2;
      }, 0);
      const ssTot = revenues.reduce((sum, y) => sum + (y - yMean) ** 2, 0);
      const r2 = ssTot !== 0 ? 1 - ssRes / ssTot : 0;
      const confidence = Math.max(0.3, Math.min(0.95, r2 * (1 - i * 0.1)));

      forecast.push({
        month: `${lastYear}-${String(lastMonth).padStart(2, "0")}`,
        predicted_sales: Math.round(predicted * 100) / 100,
        confidence_score: Math.round(confidence * 100) / 100,
        model: "Linear Regression",
      });
    }

    // Product demand prediction
    const productTrends = await Sale.aggregate([
      { $match: { user_id: userId } },
      {
        $group: {
          _id: "$product_name",
          totalQuantity: { $sum: "$quantity" },
          totalRevenue: { $sum: "$revenue" },
          avgPrice: { $avg: "$price" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);

    const maxQty = Math.max(...productTrends.map((p) => p.totalQuantity), 1);
    const productDemand = productTrends.map((p) => ({
      product: p._id,
      currentDemand: p.totalQuantity,
      predictedDemand: Math.round(p.totalQuantity * (1 + slope / (yMean || 1) * 0.3)),
      demandScore: Math.round((p.totalQuantity / maxQty) * 100),
      trend: slope > 0 ? "increasing" : "decreasing",
    }));

    // Save predictions
    const predictionDocs = forecast.map((f) => ({
      user_id: userId,
      month: f.month,
      predicted_sales: f.predicted_sales,
      confidence_score: f.confidence_score,
      model_used: "linear_regression",
    }));

    await Prediction.deleteMany({ user_id: userId });
    await Prediction.insertMany(predictionDocs);

    return NextResponse.json({
      historical: monthlyData.map((d) => ({
        month: `${d._id.year}-${String(d._id.month).padStart(2, "0")}`,
        revenue: Math.round(d.revenue * 100) / 100,
        orders: d.orders,
      })),
      forecast,
      productDemand,
    });
  } catch (error: any) {
    console.error("Predictions error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate predictions" }, { status: 500 });
  }
}
