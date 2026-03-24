"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import DashboardLayout from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import ChartCard from "@/components/ChartCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import CurrencySelector from "@/components/CurrencySelector";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["#8b5cf6", "#6366f1", "#a78bfa", "#818cf8", "#c4b5fd", "#10b981", "#f59e0b", "#ef4444"];

const formatLabel = (str: string, maxLength = 25) => {
  if (!str) return 'Unknown';
  let label = String(str);
  if (label.includes('|')) {
    const parts = label.split('|');
    label = parts[parts.length - 1];
  }
  return label.length > maxLength ? label.substring(0, maxLength) + '...' : label;
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [healthScore, setHealthScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { resolvedTheme } = useTheme();
  const { format } = useCurrency();

  const isDark = resolvedTheme === "dark";
  const tooltipStyle = {
    background: isDark ? "#0d0d1a" : "#ffffff",
    border: `1px solid ${isDark ? "rgba(139,92,246,0.3)" : "rgba(0,0,0,0.1)"}`,
    borderRadius: 12,
    color: isDark ? "#f1f5f9" : "#0f172a",
    fontSize: 12,
    boxShadow: isDark ? "0 0 20px rgba(0,0,0,0.5)" : "0 4px 12px rgba(0,0,0,0.1)",
    backdropFilter: "blur(10px)",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, healthRes] = await Promise.all([
          fetch("/api/dashboard"),
          fetch("/api/health-score"),
        ]);
        const dashData = await dashRes.json();
        const healthData = await healthRes.json();
        
        // Format labels to prevent UI overflow from long CSV strings
        if (dashData.revenueByCategory) {
          const formattedCategories = dashData.revenueByCategory.map((item: any) => ({
            ...item,
            originalCategory: item.category,
            category: formatLabel(item.category, 20)
          }));
          
          dashData.revenueByCategoryAll = formattedCategories;
          
          if (formattedCategories.length > 8) {
            const topCats = formattedCategories.slice(0, 8);
            const otherCats = formattedCategories.slice(8);
            const otherRevenue = otherCats.reduce((sum: number, cat: any) => sum + cat.revenue, 0);
            const otherCount = otherCats.reduce((sum: number, cat: any) => sum + cat.count, 0);
            dashData.revenueByCategoryGrouped = [
              ...topCats,
              { category: 'Other', revenue: Math.round(otherRevenue * 100) / 100, count: otherCount }
            ];
          } else {
            dashData.revenueByCategoryGrouped = formattedCategories;
          }
        }
        
        if (dashData.topProducts) {
          dashData.topProducts = dashData.topProducts.map((item: any) => ({
            ...item,
            originalName: item.name,
            name: formatLabel(item.name, 25)
          }));
        }

        if (dashData.recentSales) {
          dashData.recentSales = dashData.recentSales.map((item: any) => ({
            ...item,
            originalCategory: item.category,
            category: formatLabel(item.category, 20),
            originalProduct: item.product,
            product: formatLabel(item.product, 30)
          }));
        }
        
        setData(dashData);
        setHealthScore(healthData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Your business analytics at a glance</p>
          </div>
          <div className="flex items-center gap-4">
            {healthScore && healthScore.score > 0 && (
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl glass border border-white/5 w-[210px]">
                <div className="relative w-14 h-14 shrink-0">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="5" className="text-muted/40" />
                    <circle
                      cx="28" cy="28" r="24" fill="none"
                      stroke={healthScore.score >= 70 ? "#10b981" : healthScore.score >= 50 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="5" strokeLinecap="round"
                      strokeDasharray={`${(healthScore.score / 100) * 150.8} 150.8`}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
                    {healthScore.score}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Business Health</p>
                  <p className="text-lg font-bold text-foreground truncate">Grade {healthScore.grade}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-6 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Skeleton className="h-[120px] w-full rounded-xl" />
              <Skeleton className="h-[120px] w-full rounded-xl" />
              <Skeleton className="h-[120px] w-full rounded-xl" />
              <Skeleton className="h-[120px] w-full rounded-xl" />
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <Skeleton className="h-[400px] w-full rounded-xl" />
              <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
          </div>
        ) : !data || data.kpis?.totalOrders === 0 ? (
          <div className="text-center py-24 rounded-3xl border border-border bg-card">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-5xl mx-auto mb-8">
              📤
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">No Data Yet</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">Upload your raw sales ledger to initialize the AI analytics engine and generate insights.</p>
            <a
              href="/upload"
              className="inline-block px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-white font-bold hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all hover:scale-105"
            >
              Initialize Upload Sequence
            </a>
          </div>
        ) : (
          <div className="space-y-10">

            {/* Action Bar */}
            <div className="flex items-center justify-between">
              {/* Quick-jump pill nav */}
              <div className="inline-flex items-center gap-1 bg-muted/40 border border-border rounded-lg p-1 text-sm">
                <a href="#section-overview" className="px-3 py-1.5 rounded-md font-medium text-foreground hover:bg-background hover:shadow-sm transition-all">Overview</a>
                <a href="#section-sectors" className="px-3 py-1.5 rounded-md font-medium text-muted-foreground hover:bg-background hover:shadow-sm transition-all">Sectors</a>
                <a href="#section-ledger" className="px-3 py-1.5 rounded-md font-medium text-muted-foreground hover:bg-background hover:shadow-sm transition-all">Raw Ledger</a>
              </div>
              
              <CurrencySelector />
            </div>

            {/* ── Section 1: Overview ── */}
            <section id="section-overview" className="scroll-mt-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-2">Overview</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="Total Revenue"
                value={format(data.kpis.totalRevenue || 0)}
                icon="💰"
                subtitle="All time"
              />
              <KPICard
                title="Total Orders"
                value={(data.kpis.totalOrders || 0).toLocaleString()}
                icon="📦"
                subtitle="All time"
              />
              <KPICard
                title="Unique Customers"
                value={(data.kpis.uniqueCustomers || 0).toLocaleString()}
                icon="👥"
              />
              <KPICard
                title="Avg Order Value"
                value={format(data.kpis.avgOrderValue || 0)}
                icon="📊"
              />
            </div>

            {/* Charts Row 1 */}
            <div className="grid lg:grid-cols-2 gap-6">
              <ChartCard title="Revenue Trajectory" subtitle="A.I. Model Projection Trend">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.salesTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="month" stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(value) => format(value, true)} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      itemStyle={{ color: isDark ? "#fff" : "#0f172a", fontWeight: "bold" }}
                      labelStyle={{ color: "#06b6d4", marginBottom: 4 }}
                      formatter={(value: any) => [format(value), "Revenue"]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorRevenue)" filter="url(#glow)" activeDot={{ r: 6, fill: "#06b6d4", strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="High-Velocity Products" subtitle="Revenue Matrix">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.topProducts?.slice(0, 6)} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBar" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 10 }} width={100} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.02)" }}
                      contentStyle={tooltipStyle}
                      itemStyle={{ color: isDark ? "#fff" : "#0f172a", fontWeight: "bold" }}
                      formatter={(value: any) => [format(value), "Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="url(#colorBar)" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
            </section>

            {/* ── Section 2: Sectors ── */}
            <section id="section-sectors" className="scroll-mt-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-2">Sectors &amp; Customers</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
              <ChartCard title="Sector Distribution" subtitle="Category Revenue Density">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <defs>
                      <filter id="shadow">
                        <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#000" floodOpacity="0.5"/>
                      </filter>
                    </defs>
                    <Pie
                      data={data.revenueByCategoryGrouped}
                      dataKey="revenue"
                      nameKey="category"
                      cx="50%"
                      cy="45%"
                      outerRadius={110}
                      innerRadius={75}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {data.revenueByCategoryGrouped?.map((entry: any, i: number) => {
                         const hue = 260 + (i * 35);
                         return <Cell key={i} fill={`hsl(${hue}, 85%, 60%)`} filter="url(#shadow)" />;
                      })}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      itemStyle={{ color: isDark ? "#fff" : "#0f172a", fontWeight: "bold" }}
                      formatter={(value: any) => [format(value), "Revenue"]}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 11, color: "#94a3b8" }}
                      iconType="circle"
                      iconSize={8}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Engagement Topology" subtitle="Top Target Nodes (Customers)">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.customerFrequency?.slice(0, 10)} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFreq" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d946ef" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="customerId" stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 9 }} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.02)" }}
                      contentStyle={tooltipStyle}
                      itemStyle={{ color: isDark ? "#fff" : "#0f172a", fontWeight: "bold" }}
                    />
                    <Bar dataKey="purchases" fill="url(#colorFreq)" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
            </section>

            {/* ── Section 3: Raw Ledger ── */}
            <section id="section-ledger" className="scroll-mt-8 space-y-6 pb-8">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-2">Raw Ledger</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
              {/* Category Analysis Table */}
              <ChartCard title="Sector Granularity" subtitle="All revenue by node">
                <div className="overflow-x-auto max-h-[350px] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card z-10">
                      <TableRow className="border-b-white/5 hover:bg-transparent">
                        <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Category Node</TableHead>
                        <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Transactions</TableHead>
                        <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Yield</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.revenueByCategoryAll?.map((cat: any, i: number) => (
                        <TableRow key={i} className="hover:bg-muted/30 border-b-border transition-colors group">
                          <TableCell className="font-medium text-xs text-foreground break-words max-w-[200px] border-l-2 border-transparent group-hover:border-[#06b6d4] transition-all" title={cat.originalCategory}>
                            {cat.category}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs font-mono text-right">
                            {cat.count}
                          </TableCell>
                          <TableCell className="text-violet-400 dark:text-violet-400 font-bold text-xs font-mono text-right">
                            {format(cat.revenue || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ChartCard>

              {/* Recent Sales */}
              <ChartCard title="Ledger Feed" subtitle="Latest authenticated transactions">
                <div className="overflow-x-auto max-h-[350px] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card z-10">
                      <TableRow className="border-b-border hover:bg-transparent">
                        <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Timestamp</TableHead>
                        <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Entity</TableHead>
                        <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Vol</TableHead>
                        <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Yield</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.recentSales?.map((sale: any, i: number) => (
                        <TableRow key={i} className="hover:bg-muted/30 border-b-border transition-colors group">
                          <TableCell className="text-muted-foreground text-[11px] font-mono whitespace-nowrap border-l-2 border-transparent group-hover:border-fuchsia-500 transition-all">
                            {new Date(sale.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </TableCell>
                          <TableCell className="text-foreground font-medium text-xs break-words max-w-[150px]" title={sale.originalProduct}>
                            {sale.product}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs font-mono text-right">
                            {sale.quantity}
                          </TableCell>
                          <TableCell className="text-cyan-500 dark:text-cyan-400 font-bold text-xs font-mono text-right">
                            {format(sale.revenue || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ChartCard>
            </div>
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
