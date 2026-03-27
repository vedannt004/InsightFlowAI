"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function InsightsPage() {
  const [data, setData] = useState<any>(null);
  const [healthScore, setHealthScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [marketContext, setMarketContext] = useState<any>(null);
  const { format } = useCurrency();

  useEffect(() => {
    Promise.all([
      fetch("/api/recommendations").then((r) => r.json()),
      fetch("/api/health-score").then((r) => r.json()),
    ])
      .then(([rec, hs]) => {
        setData(rec);
        setHealthScore(hs);
        if (rec?.marketContext) setMarketContext(rec.marketContext);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">AI Insights & Recommendations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Actionable recommendations powered by AI analysis of your data
          </p>
        </div>

        {loading ? (
          <LoadingSpinner text="Analyzing your data..." />
        ) : (
          <>
            {/* Market Intelligence Banner */}
            {marketContext && marketContext.similarBusinesses > 0 && (
              <div className="mb-6 flex items-center gap-3 px-5 py-3.5 rounded-xl border border-violet-500/30 bg-violet-500/5">
                <div className="w-9 h-9 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-base">🌐</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    Market Intelligence Active
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    AI trained on insights from{" "}
                    <span className="text-violet-400 font-bold">{marketContext.similarBusinesses}</span>{" "}
                    similar <span className="text-violet-400 font-medium">{marketContext.industry}</span> business{marketContext.similarBusinesses !== 1 ? "es" : ""}
                    {marketContext.insightsLearned > 0 && (
                      <> &mdash; analysed <span className="text-violet-400 font-bold">{marketContext.insightsLearned}</span> market data points</>
                    )}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-violet-500/20 text-violet-400 border border-violet-500/30 whitespace-nowrap">
                  Live Learning
                </span>
              </div>
            )}

            {/* Business Health Score */}
            {healthScore && healthScore.score > 0 && (
              <div className="mb-8 p-8 rounded-2xl border border-border bg-card">
                <h2 className="text-lg font-bold text-foreground mb-6 uppercase tracking-wide">Core System Health</h2>
                
                <div className="grid md:grid-cols-5 gap-6 items-center">
                  {/* Score Circle */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32">
                      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 112 112">
                        <circle cx="56" cy="56" r="48" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
                        <circle
                          cx="56" cy="56" r="48" fill="none"
                          stroke={healthScore.score >= 70 ? "#06b6d4" : healthScore.score >= 50 ? "#8b5cf6" : "#ef4444"}
                          strokeWidth="8" strokeLinecap="round"
                          strokeDasharray={`${(healthScore.score / 100) * 301.6} 301.6`}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-foreground tracking-tighter">{healthScore.score}</span>
                        <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mt-1">Class {healthScore.grade}</span>
                      </div>
                    </div>
                  </div>

                  {/* Breakdown */}
                  {Object.entries(healthScore.breakdown || {}).map(([key, val]: [string, any], i: number) => (
                    <div key={key} className="text-center p-4 rounded-xl bg-muted/30 border border-border hover:border-violet-500/30 transition-all duration-200">
                      <div className="relative w-16 h-16 mx-auto mb-3">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/40" />
                          <circle
                            cx="32" cy="32" r="26" fill="none"
                            stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round"
                            strokeDasharray={`${(val.score / 100) * 163.4} 163.4`}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
                          {val.score}
                        </span>
                      </div>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-tight">{val.weight.replace('%', '')}% {key}</p>
                    </div>
                  ))}
                </div>
                
                {/* AI Summary */}
                {healthScore.aiSummary && (
                  <div className="mt-8 p-5 rounded-xl border border-violet-500/30 bg-violet-500/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-violet-500"></div>
                    <div className="flex gap-3 mb-3 items-center">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                        <span className="text-sm">⚡</span>
                      </div>
                      <p className="font-bold text-foreground uppercase tracking-wider text-sm">System Diagnostics Summary</p>
                    </div>
                    <p className="pl-11 text-muted-foreground text-sm leading-relaxed">{healthScore.aiSummary}</p>
                  </div>
                )}
              </div>
            )}

            {/* Summary */}
            {data?.summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="text-center p-4 rounded-xl border border-border bg-card">
                  <p className="text-xl font-bold text-foreground">{data.summary.totalProducts}</p>
                  <p className="text-xs text-muted-foreground">Products</p>
                </div>
                <div className="text-center p-4 rounded-xl border border-border bg-card">
                  <p className="text-xl font-bold text-foreground">{data.summary.totalCategories}</p>
                  <p className="text-xs text-muted-foreground">Categories</p>
                </div>
                <div className="text-center p-4 rounded-xl border border-border bg-card">
                  <p className="text-xl font-bold text-foreground">{data.summary.totalCustomers}</p>
                  <p className="text-xs text-muted-foreground">Customers</p>
                </div>
                <div className="text-center p-4 rounded-xl border border-border bg-card">
                  <p className="text-xl font-bold text-foreground">{data.summary.repeatRate}%</p>
                  <p className="text-xs text-muted-foreground">Repeat Rate</p>
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="space-y-4">
              {data?.recommendations?.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-4xl mb-4">💡</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Recommendations Yet</h3>
                  <p className="text-muted-foreground text-sm">Upload more data to get AI-powered insights</p>
                </div>
              )}
              {data?.recommendations?.map((rec: any, i: number) => {
                const isCritical = rec.priority === 'critical';
                const borderClass = isCritical ? 'border-red-500/40' : 'border-border';
                
                return (
                <div
                  key={i}
                  className={`rounded-xl border ${borderClass} bg-card p-6 mb-4 transition-all duration-200 hover:shadow-sm ${isCritical ? 'bg-red-500/5' : ''}`}
                >
                  <div className="flex items-start gap-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border ${isCritical ? 'bg-red-500/20 border-red-500/30' : 'bg-muted border-border'}`}>
                      {rec.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-base font-bold text-foreground">{rec.title}</h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border ${
                            isCritical ? "bg-red-500/10 text-red-500 border-red-400/20" : 
                            rec.priority === 'high' ? "bg-amber-500/10 text-amber-500 border-amber-400/20" :
                            rec.priority === 'medium' ? "bg-blue-500/10 text-blue-500 border-blue-400/20" :
                            "bg-emerald-500/10 text-emerald-600 border-emerald-400/20"
                          }`}
                        >
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{rec.description}</p>
                      
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-medium mb-3">
                        🎯 Expected Impact: {rec.impact}
                      </div>

                      {rec.products && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {rec.products.map((p: any) => (
                            <span
                              key={p.name}
                              className="px-3 py-1.5 rounded-lg bg-muted border border-border text-xs text-muted-foreground font-medium"
                            >
                              {p.name} <span className="mx-1 opacity-40">/</span> <span className="text-emerald-600 dark:text-emerald-400 font-mono">{format(p.revenue || 0)}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {rec.metric && (
                        <div className="mt-4 flex items-center gap-3 text-xs bg-muted p-3 rounded-xl border border-border w-fit">
                          <span className="text-muted-foreground font-mono">
                            Prev: {format(rec.metric.previous || 0)}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-foreground font-medium font-mono">
                            Target: {format(rec.metric.current || 0)}
                          </span>
                          <span
                            className={`font-bold px-2 py-0.5 rounded ${rec.metric.change >= 0 ? "text-emerald-600 bg-emerald-400/10" : "text-red-500 bg-red-400/10"}`}
                          >
                            {rec.metric.change >= 0 ? "+" : ""}{rec.metric.change}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
