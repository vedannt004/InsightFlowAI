import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Sale from "@/models/Sale";

function kMeans(data: number[][], k: number, maxIter = 100): { clusters: number[]; centroids: number[][] } {
  const n = data.length;
  if (n <= k) {
    return { clusters: data.map((_, i) => i % k), centroids: data.slice(0, k) };
  }

  // Initialize centroids using k-means++ style
  const centroids: number[][] = [];
  centroids.push([...data[Math.floor(Math.random() * n)]]);
  for (let c = 1; c < k; c++) {
    const distances = data.map((point) => {
      const minDist = Math.min(
        ...centroids.map((cent) =>
          Math.sqrt(cent.reduce((sum, val, i) => sum + (val - point[i]) ** 2, 0))
        )
      );
      return minDist ** 2;
    });
    const totalDist = distances.reduce((a, b) => a + b, 0);
    let r = Math.random() * totalDist;
    for (let i = 0; i < n; i++) {
      r -= distances[i];
      if (r <= 0) {
        centroids.push([...data[i]]);
        break;
      }
    }
    if (centroids.length <= c) centroids.push([...data[Math.floor(Math.random() * n)]]);
  }

  let clusters = new Array(n).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    // Assign clusters
    const newClusters = data.map((point) => {
      let minDist = Infinity;
      let minIdx = 0;
      centroids.forEach((cent, idx) => {
        const dist = Math.sqrt(cent.reduce((sum, val, i) => sum + (val - point[i]) ** 2, 0));
        if (dist < minDist) {
          minDist = dist;
          minIdx = idx;
        }
      });
      return minIdx;
    });

    // Check convergence
    if (JSON.stringify(newClusters) === JSON.stringify(clusters)) break;
    clusters = newClusters;

    // Update centroids
    for (let c = 0; c < k; c++) {
      const clusterPoints = data.filter((_, i) => clusters[i] === c);
      if (clusterPoints.length > 0) {
        centroids[c] = centroids[c].map((_, dim) =>
          clusterPoints.reduce((sum, p) => sum + p[dim], 0) / clusterPoints.length
        );
      }
    }
  }

  return { clusters, centroids };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectDB();

    // Aggregate customer data
    const customerData = await Sale.aggregate([
      { $match: { user_id: userId } },
      {
        $group: {
          _id: "$customer_id",
          totalSpent: { $sum: "$revenue" },
          purchaseCount: { $sum: 1 },
          avgOrderValue: { $avg: "$revenue" },
          firstPurchase: { $min: "$date" },
          lastPurchase: { $max: "$date" },
          uniqueProducts: { $addToSet: "$product_name" },
        },
      },
    ]);

    if (customerData.length < 3) {
      return NextResponse.json({
        segments: [],
        summary: {},
        message: "Need at least 3 customers for segmentation",
      });
    }

    // Normalize features for clustering
    const features = customerData.map((c) => [
      c.purchaseCount,
      c.totalSpent,
      c.avgOrderValue,
    ]);

    // Normalize
    const maxes = features[0].map((_, i) => Math.max(...features.map((f) => f[i]), 1));
    const normalized = features.map((f) => f.map((v, i) => v / maxes[i]));

    // K-Means with k=3 (Loyal, Occasional, High Spenders)
    const { clusters } = kMeans(normalized, 3);

    // Calculate cluster averages to label them
    const clusterStats: Record<number, { totalSpent: number; count: number; purchases: number }> = {};
    clusters.forEach((c, i) => {
      if (!clusterStats[c]) clusterStats[c] = { totalSpent: 0, count: 0, purchases: 0 };
      clusterStats[c].totalSpent += customerData[i].totalSpent;
      clusterStats[c].count++;
      clusterStats[c].purchases += customerData[i].purchaseCount;
    });

    // Label clusters
    const clusterAvgs = Object.entries(clusterStats).map(([id, stat]) => ({
      id: Number(id),
      avgSpent: stat.totalSpent / stat.count,
      avgPurchases: stat.purchases / stat.count,
      count: stat.count,
    }));

    clusterAvgs.sort((a, b) => b.avgPurchases - a.avgPurchases);

    const labelMap: Record<number, string> = {};
    const colorMap: Record<number, string> = {};
    const descMap: Record<number, string> = {};

    // Highest frequency → Loyal
    labelMap[clusterAvgs[0].id] = "Loyal Customers";
    colorMap[clusterAvgs[0].id] = "#10b981";
    descMap[clusterAvgs[0].id] = "Frequent buyers who consistently return";

    if (clusterAvgs.length >= 3) {
      // Among remaining, highest spend → High Spenders
      const remaining = clusterAvgs.slice(1).sort((a, b) => b.avgSpent - a.avgSpent);
      labelMap[remaining[0].id] = "High Spenders";
      colorMap[remaining[0].id] = "#6366f1";
      descMap[remaining[0].id] = "Customers with high average order value";

      labelMap[remaining[1].id] = "Occasional Buyers";
      colorMap[remaining[1].id] = "#f59e0b";
      descMap[remaining[1].id] = "Infrequent buyers with growth potential";
    } else if (clusterAvgs.length === 2) {
      labelMap[clusterAvgs[1].id] = "Occasional Buyers";
      colorMap[clusterAvgs[1].id] = "#f59e0b";
      descMap[clusterAvgs[1].id] = "Infrequent buyers with growth potential";
    }

    // Build segment data
    const segments = clusterAvgs.map((c) => ({
      label: labelMap[c.id] || `Segment ${c.id}`,
      color: colorMap[c.id] || "#94a3b8",
      description: descMap[c.id] || "",
      customerCount: c.count,
      avgSpent: Math.round(c.avgSpent * 100) / 100,
      avgPurchases: Math.round(c.avgPurchases * 10) / 10,
      percentage: Math.round((c.count / customerData.length) * 100),
    }));

    // Customer-level detail
    const customers = customerData.map((c, i) => ({
      customerId: c._id,
      segment: labelMap[clusters[i]] || `Segment ${clusters[i]}`,
      color: colorMap[clusters[i]] || "#94a3b8",
      totalSpent: Math.round(c.totalSpent * 100) / 100,
      purchaseCount: c.purchaseCount,
      avgOrderValue: Math.round(c.avgOrderValue * 100) / 100,
      productCount: c.uniqueProducts.length,
    }));

    return NextResponse.json({
      segments,
      customers: customers.slice(0, 50),
      summary: {
        totalCustomers: customerData.length,
        segmentCount: segments.length,
      },
    });
  } catch (error: any) {
    console.error("Segments error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate segments" }, { status: 500 });
  }
}
