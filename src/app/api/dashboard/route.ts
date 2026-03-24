import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Sale from "@/models/Sale";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectDB();

    // Total revenue
    const totalRevenue = await Sale.aggregate([
      { $match: { user_id: userId } },
      { $group: { _id: null, total: { $sum: "$revenue" } } },
    ]);

    // Total orders
    const totalOrders = await Sale.countDocuments({ user_id: userId });

    // Unique customers
    const uniqueCustomers = await Sale.distinct("customer_id", { user_id: userId });

    // Average order value
    const avgOrderValue =
      totalOrders > 0 ? (totalRevenue[0]?.total || 0) / totalOrders : 0;

    // Sales trends (monthly)
    const salesTrends = await Sale.aggregate([
      { $match: { user_id: userId } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          revenue: { $sum: "$revenue" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    const formattedTrends = salesTrends.map((t) => ({
      month: `${t._id.year}-${String(t._id.month).padStart(2, "0")}`,
      revenue: Math.round(t.revenue * 100) / 100,
      orders: t.orders,
    }));

    // Top selling products
    const topProducts = await Sale.aggregate([
      { $match: { user_id: userId } },
      {
        $group: {
          _id: "$product_name",
          totalRevenue: { $sum: "$revenue" },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ]);

    // Revenue per category
    const revenueByCategory = await Sale.aggregate([
      { $match: { user_id: userId } },
      {
        $group: {
          _id: "$category",
          revenue: { $sum: "$revenue" },
          count: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // Customer purchase frequency
    const customerFrequency = await Sale.aggregate([
      { $match: { user_id: userId } },
      {
        $group: {
          _id: "$customer_id",
          purchaseCount: { $sum: 1 },
          totalSpent: { $sum: "$revenue" },
        },
      },
      { $sort: { purchaseCount: -1 } },
      { $limit: 20 },
    ]);

    // Recent sales
    const recentSales = await Sale.find({ user_id: userId })
      .sort({ date: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      kpis: {
        totalRevenue: Math.round((totalRevenue[0]?.total || 0) * 100) / 100,
        totalOrders,
        uniqueCustomers: uniqueCustomers.length,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      },
      salesTrends: formattedTrends,
      topProducts: topProducts.map((p) => ({
        name: p._id,
        revenue: Math.round(p.totalRevenue * 100) / 100,
        quantity: p.totalQuantity,
      })),
      revenueByCategory: revenueByCategory.map((c) => ({
        category: c._id,
        revenue: Math.round(c.revenue * 100) / 100,
        count: c.count,
      })),
      customerFrequency: customerFrequency.map((c) => ({
        customerId: c._id,
        purchases: c.purchaseCount,
        totalSpent: Math.round(c.totalSpent * 100) / 100,
      })),
      recentSales: recentSales.map((s: any) => ({
        date: s.date,
        product: s.product_name,
        category: s.category,
        quantity: s.quantity,
        revenue: s.revenue,
      })),
    });
  } catch (error: any) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch dashboard" }, { status: 500 });
  }
}
