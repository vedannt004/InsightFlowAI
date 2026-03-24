"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useCurrency } from "@/contexts/CurrencyContext";
import DashboardLayout from "@/components/DashboardLayout";
import ChartCard from "@/components/ChartCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  PieChart, Pie, Cell, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ZAxis,
} from "recharts";

export default function SegmentsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { resolvedTheme } = useTheme();
  const { format } = useCurrency();

  const isDark = resolvedTheme === "dark";
  const tooltipStyle = {
    background: isDark ? "#0d0d1a" : "#ffffff",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
    borderRadius: 12,
    color: isDark ? "#f1f5f9" : "#0f172a",
    fontSize: 12,
  };

  useEffect(() => {
    fetch("/api/segments")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Customer Segmentation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            K-Means AI clustering of your customer base
          </p>
        </div>

        {loading ? (
          <LoadingSpinner text="Segmenting customers..." />
        ) : data?.message ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center text-4xl mx-auto mb-6">
              👥
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Not Enough Data</h2>
            <p className="text-muted-foreground">{data.message}</p>
          </div>
        ) : (
          <>
            {/* Segment Cards */}
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {data?.segments?.map((seg: any, i: number) => (
                <div
                  key={seg.label}
                  className="rounded-xl bg-card border border-border p-5"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: seg.color }}
                    />
                    <h3 className="text-sm font-semibold text-foreground">{seg.label}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{seg.description}</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-foreground">{seg.customerCount}</p>
                      <p className="text-[10px] text-muted-foreground">Customers</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{format(seg.avgSpent || 0)}</p>
                      <p className="text-[10px] text-muted-foreground">Avg Spent</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{seg.avgPurchases}</p>
                      <p className="text-[10px] text-muted-foreground">Avg Orders</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Share</span>
                      <span className="text-foreground font-medium">{seg.percentage}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${seg.percentage}%`, backgroundColor: seg.color }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-4 mb-4">
              <ChartCard title="Segment Distribution" subtitle="Customer share">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data?.segments?.map((s: any) => ({
                        name: s.label,
                        value: s.customerCount,
                      }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      innerRadius={70}
                      paddingAngle={3}
                    >
                      {data?.segments?.map((s: any, i: number) => (
                        <Cell key={i} fill={s.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      itemStyle={{ color: isDark ? "#e2e8f0" : "#0f172a" }}
                      labelStyle={{ color: isDark ? "#a78bfa" : "#6d28d9", fontWeight: 600 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Customer Scatter" subtitle="Purchases vs Spending">
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                    <XAxis
                      dataKey="purchaseCount"
                      name="Purchases"
                      stroke="#64748b"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      dataKey="totalSpent"
                      name="Total Spent"
                      stroke="#64748b"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) => format(value, true)}
                    />
                    <ZAxis dataKey="avgOrderValue" range={[50, 300]} name="Avg Order" />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      itemStyle={{ color: isDark ? "#e2e8f0" : "#0f172a" }}
                      labelStyle={{ color: isDark ? "#a78bfa" : "#6d28d9", fontWeight: 600 }}
                      cursor={{ strokeDasharray: "3 3" }}
                      formatter={(value: any, name: string) => [name === 'Total Spent' || name === 'Avg Order' ? format(value) : value, name]}
                    />
                    <Legend />
                    {data?.segments?.map((seg: any) => (
                      <Scatter
                        key={seg.label}
                        name={seg.label}
                        data={data?.customers?.filter(
                          (c: any) => c.segment === seg.label
                        )}
                        fill={seg.color}
                      />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Customer Table */}
            <ChartCard title="Customer Details" subtitle="Individual customer segments">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm text-left">
                  <thead className="sticky top-0 bg-card border-b border-border">
                    <tr>
                      <th className="py-2 px-3 text-xs font-medium text-muted-foreground">Customer ID</th>
                      <th className="py-2 px-3 text-xs font-medium text-muted-foreground">Segment</th>
                      <th className="py-2 px-3 text-xs font-medium text-muted-foreground">Total Spent</th>
                      <th className="py-2 px-3 text-xs font-medium text-muted-foreground">Purchases</th>
                      <th className="py-2 px-3 text-xs font-medium text-muted-foreground">Avg Order</th>
                      <th className="py-2 px-3 text-xs font-medium text-muted-foreground">Products</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.customers?.map((c: any, i: number) => (
                      <tr key={i} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3 text-foreground text-xs font-medium">{c.customerId}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                            style={{
                              backgroundColor: `${c.color}20`,
                              color: c.color,
                            }}
                          >
                            {c.segment}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 text-xs font-mono">
                          {format(c.totalSpent || 0)}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground text-xs">{c.purchaseCount}</td>
                        <td className="py-2.5 px-3 text-muted-foreground text-xs">{format(c.avgOrderValue || 0)}</td>
                        <td className="py-2.5 px-3 text-muted-foreground text-xs">{c.productCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
