"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useCurrency } from "@/contexts/CurrencyContext";
import DashboardLayout from "@/components/DashboardLayout";
import ChartCard from "@/components/ChartCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area,
} from "recharts";

export default function ForecastPage() {
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
    fetch("/api/predictions")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Sales Forecast</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered revenue predictions for the next 3 months
          </p>
        </div>

        {loading ? (
          <LoadingSpinner text="Generating forecasts..." />
        ) : data?.message ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center text-4xl mx-auto mb-6">
              📈
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Not Enough Data</h2>
            <p className="text-muted-foreground">{data.message}</p>
          </div>
        ) : (
          <>
            {/* Forecast Cards */}
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {data?.forecast?.map((f: any, i: number) => (
                <div
                  key={f.month}
                  className="rounded-xl bg-card border border-border p-5"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <p className="text-xs text-muted-foreground mb-1 font-medium">{f.month}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {format(f.predicted_sales || 0)}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex-1 h-1.5 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                        style={{ width: `${(f.confidence_score || 0) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {Math.round((f.confidence_score || 0) * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{f.model}</p>
                </div>
              ))}
            </div>

            {/* Forecast Chart */}
            <ChartCard title="Revenue Forecast" subtitle="Historical + predicted" className="mb-4">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart
                  data={[
                    ...(data?.historical || []).map((h: any) => ({
                      month: h.month,
                      actual: h.revenue,
                    })),
                    ...(data?.forecast || []).map((f: any) => ({
                      month: f.month,
                      predicted: f.predicted_sales,
                    })),
                  ]}
                >
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(value) => format(value, true)} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [format(value), "Revenue"]} />
                  <Legend />
                  <Area type="monotone" dataKey="actual" stroke="#8b5cf6" fill="url(#colorActual)" strokeWidth={2} name="Actual Revenue" />
                  <Area type="monotone" dataKey="predicted" stroke="#10b981" fill="url(#colorPredicted)" strokeWidth={2} strokeDasharray="5 5" name="Predicted Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Product Demand */}
            <ChartCard title="Product Demand Prediction" subtitle="Current vs predicted demand">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.productDemand?.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                  <XAxis dataKey="product" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Bar dataKey="currentDemand" fill="#8b5cf6" name="Current" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="predictedDemand" fill="#10b981" name="Predicted" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
