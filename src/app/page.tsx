"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import VariableProximity from "@/components/VariableProximity";
import { MagicCard } from "@/components/MagicCard";
import { CountUp } from "@/components/CountUp";


export default function HomePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("Dashboards");
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    { 
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>, 
      title: "Tailored Dashboards", 
      desc: "Create personalized data views that matter most to your business. Our drag-and-drop interface allows you to build custom analytics flows that track every KPI in real-time." 
    },
    { 
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, 
      title: "AI Forecasting", 
      desc: "Stay ahead of market trends with predictive modeling. Break down complex revenue projections into concrete, manageable phases powered by our proprietary machine learning algorithms." 
    },
    { 
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>, 
      title: "Segmentation", 
      desc: "Understand your audience like never before. Automatically categorize your customer base into meaningful, actionable cohorts to drive hyper-targeted marketing and product decisions." 
    },
    { 
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, 
      title: "Automated Reports", 
      desc: "Stop wasting hours on manual data entry. Generate professional, boardroom-ready business summaries instantly, scheduled to your inbox daily, weekly, or whenever you need them." 
    },
    { 
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, 
      title: "Collaboration", 
      desc: "Break down data silos effortlessly. Collaborate seamlessly across teams and departments with shared workspaces, real-time annotations, and enterprise-grade access controls." 
    },
    { 
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>, 
      title: "Progress Insights", 
      desc: "Measure what matters with AI-driven clarity. Track scope, velocity, and project progress with precision, identifying bottlenecks before they impact your bottom line." 
    },
  ];

  const nextFeature = () => {
    setActiveFeature((prev) => (prev + 1) % features.length);
  };

  // Intersection Observer for scroll-triggered reveals
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 flex flex-nowrap items-center justify-between px-6 md:px-12 lg:px-16 py-2.5 bg-background/80 backdrop-blur-md border-b border-border animate-fade-in-down">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <span className="text-background text-sm font-bold">IF</span>
          </div>
          <span className="text-[17px] font-semibold tracking-tight">InsightFlow</span>
        </Link>
        <div className="flex items-center ml-auto">
          <nav className="flex items-center gap-2 md:gap-3">
            {session ? (
              <Link href="/dashboard" className={cn(buttonVariants({ size: "sm" }), "rounded-full")}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }), "text-foreground/80 hover:text-foreground text-[14px] px-3 md:px-4 h-9 font-medium transition-transform active:scale-95")}>
                  Log in
                </Link>
                <Link href="/signup" className={cn(buttonVariants({ size: "default" }), "rounded-full text-[14px] px-4 md:px-5 h-9 font-medium shadow-sm transition-all hover:scale-105 active:scale-95")}>
                  Get started
                </Link>
              </>
            )}
          </nav>
          
          <div className="h-6 w-px bg-border dark:bg-foreground/20 ml-4 md:ml-6" />
          
          <div className="ml-4 md:ml-6 flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════
          SECTION 1 — Centered Hero (ref: image 2)
      {/* ══════════════════════════════════════
          SECTION 1 — Centered Hero (ref: image 2)
         ══════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Top segment with background grid */}
        <div className="relative px-6 md:px-12 lg:px-16 pt-12 md:pt-16 pb-16">
          {/* Background Grid */}
          <div 
            className="absolute inset-0 grid-pattern pointer-events-none" 
            style={{ 
              maskImage: "linear-gradient(to bottom, white 30%, transparent 100%)", 
              WebkitMaskImage: "linear-gradient(to bottom, white 30%, transparent 100%)" 
            }}
          />
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            {/* Tag link */}
          <Link href="#features" className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-foreground/20 dark:border-foreground/30 bg-background/50 px-5 md:px-6 py-2 md:py-2.5 text-sm md:text-base font-medium text-foreground transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.25)] dark:shadow-[0_0_40px_rgba(255,255,255,0.35)] hover:border-foreground/40 hover:shadow-[0_0_40px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_0_50px_rgba(255,255,255,0.45)] mb-12 md:mb-16 animate-blur-in">
            <span className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-foreground/[0.2] dark:via-foreground/[0.3] to-transparent animate-[shimmer_2s_infinite]" />
            <span className="relative flex items-center gap-2">
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground"></span>
              </span>
              Introducing InsightFlow AI
              <svg className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </span>
          </Link>

          {/* Huge heading with Variable Proximity and Gradient */}
          <h1 className="animate-blur-in stagger-2 text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold tracking-tight leading-[1.08] mb-12 drop-shadow-sm">
            <VariableProximity 
              label={[
                "Transform your business with",
                "smarter insights, and fast",
                "analytics"
              ]}
              className="bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground to-foreground/50 pb-2"
              fromWeight={700}
              toWeight={200}
              radius={250}
            />
          </h1>

          <p className="animate-blur-in stagger-4 text-lg text-muted-foreground max-w-2xl mx-auto mb-14 leading-relaxed">
            Drive scalable growth with a single platform that automates
            dashboards, forecasting, segmentation, and AI recommendations.
          </p>

          {/* Email input + CTA in a pill */}
          <div className="animate-blur-in stagger-5 inline-flex items-center gap-0 border border-border rounded-full p-1 pl-5 bg-background shadow-sm hover:shadow-md transition-shadow duration-300">
            <span className="text-sm text-muted-foreground whitespace-nowrap mr-4">
              What&apos;s your work email?
            </span>
            <Link href="/signup" className={cn(buttonVariants({ size: "sm" }), "rounded-full text-sm font-semibold px-5")}>
              Get started →
            </Link>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 lg:px-16 pb-16 md:pb-20 pt-8 md:pt-12">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Tab bar */}
          <div className="animate-fade-in stagger-6 flex flex-wrap items-center justify-center gap-6 mb-12">
            {[
              { icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13h2v8H3zM9 8h2v13H9zM15 11h2v10h-2zM21 4h2v17h-2z" /></svg>, label: "Dashboards" },
              { icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, label: "Forecasting" },
              { icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7" /></svg>, label: "Segmentation" },
              { icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, label: "Reports" },
              { icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3" /></svg>, label: "AI Insights" },
            ].map((tab) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                className={cn(
                  "inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-full border transition-all duration-300",
                  activeTab === tab.label
                    ? "bg-foreground text-background border-foreground shadow-sm scale-105"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:shadow-sm hover:scale-105"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Preview card */}
          <div className="animate-scale-in stagger-7">
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-500 p-0">
              <CardContent className="p-0">
                <div className="bg-secondary/30 dark:bg-secondary/10 h-[320px] sm:h-[400px] md:h-[480px] w-full relative flex items-center justify-center overflow-hidden">
                  <div className="absolute -inset-10 dot-pattern pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.03] to-transparent pointer-events-none" />
                  
                  {activeTab === "Dashboards" && <DashboardPreview />}
                  {activeTab === "Forecasting" && <ForecastingPreview />}
                  {activeTab === "Segmentation" && <SegmentationPreview />}
                  {activeTab === "Reports" && <ReportsPreview />}
                  {activeTab === "AI Insights" && <AIInsightsPreview />}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </section>

      {/* ── Trusted-by marquee strip ── */}
      <section className="border-y border-border py-6 overflow-hidden">
        <div className="relative">
          <div className="flex items-center gap-12 animate-marquee whitespace-nowrap">
            {[...Array(2)].map((_, rep) => (
              <div key={rep} className="flex items-center gap-12 shrink-0">
                {["VISA", "PayPal", "Stripe", "Shopify", "Square", "QuickBooks", "Xero", "FreshBooks"].map((brand) => (
                  <span key={`${brand}-${rep}`} className="text-sm font-semibold text-muted-foreground/50 uppercase tracking-widest select-none">
                    {brand}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 2 — "We make it effortless" (ref: image 3)
         ══════════════════════════════════════ */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-20 md:py-28 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left */}
          <div className="reveal-left" style={{ transitionDelay: "0.1s" }}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] mb-6">
              We make it
              <br />
              effortless for
              <br />
              you.
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-sm">
              Say goodbye to manual data crunching and free up your time to focus on your business or simply enjoy the extra freedom.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <Link href="/signup" className={cn(buttonVariants({ size: "default" }), "rounded-full px-6 font-semibold hover:scale-[1.02] transition-transform")}>
                Try for Free
              </Link>
              <Link href="#contact" className={cn(buttonVariants({ variant: "outline", size: "default" }), "rounded-full px-6 font-semibold hover:scale-[1.02] transition-transform")}>
                Contact us
              </Link>
            </div>

            {/* Avatar row + play button */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-9 h-9 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground hover:scale-110 transition-transform cursor-pointer">
                      {["A","B","C"][i]}
                    </div>
                  ))}
                  <div className="w-9 h-9 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground hover:scale-110 transition-transform cursor-pointer">+</div>
                </div>
                <div>
                  <p className="text-lg font-bold leading-tight">10K+</p>
                  <p className="text-xs text-muted-foreground">Users across<br/>the globe</p>
                </div>
              </div>

              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center relative group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
                  <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Watch promo<br/>video</span>
              </div>
            </div>
          </div>

          {/* Right: Bento Grid */}
          <div className="grid grid-cols-2 gap-3 reveal-right" style={{ transitionDelay: "0.2s" }}>
            {/* 99% stat card */}
            <MagicCard className="col-span-1 row-span-2">
              <CardContent className="p-6 min-h-[180px] flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="text-4xl font-extrabold tracking-tight">
                    <CountUp end={99} suffix="%" />
                  </span>
                  <div className="flex items-end gap-0.5 mt-1">
                    {[12,18,8,20,14].map((h,i) => (
                      <div key={i} className="w-1 rounded-full bg-foreground animate-bar-grow" style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4 leading-snug">Accurate AI-powered revenue predictions with confidence scoring</p>
              </CardContent>
            </MagicCard>

            {/* Bento Hero Card */}
            <MagicCard className="h-full relative animate-fade-in group aspect-video">
              <img 
                src="/images/bento-hero.png" 
                alt="Data Visualization" 
                className="absolute inset-0 w-full h-full object-cover object-[50%_40%] transition-transform duration-500 group-hover:scale-105"
              />
            </MagicCard>

            {/* Waveform card */}
            <MagicCard>
              <CardContent className="p-5 min-h-[85px] flex items-center justify-center">
                <div className="flex items-center gap-[3px]">
                  {[20,35,15,40,25,45,20,30,35,25,40,15,30,45,20].map((h,i) => (
                    <div key={i} className="w-[3px] rounded-full bg-foreground animate-bar-grow" style={{ height: `${h}px`, animationDelay: `${i * 0.06}s` }} />
                  ))}
                </div>
              </CardContent>
            </MagicCard>

            {/* Wide bottom card */}
            <MagicCard className="col-span-2">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex gap-1 items-end">
                  {[40,60,30,70,50,80,45,65,35,75,55,85].map((h,i) => (
                    <div key={i} className="w-1.5 rounded-full bg-foreground animate-bar-grow" style={{ height: `${h * 0.4}px`, animationDelay: `${i * 0.05}s` }} />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Real-time</span> AI recommendations
                </div>
              </CardContent>
            </MagicCard>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 3 — Feature List (ref: image 1)
         ══════════════════════════════════════ */}
      <section id="features" className="bg-secondary/40 dark:bg-secondary/20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-20 md:py-28 grid md:grid-cols-12 gap-12 md:gap-32 items-stretch">
          {/* Left: Gray illustration */}
          <div className="md:col-span-5 reveal-scale h-full flex flex-col justify-center" style={{ transitionDelay: "0.1s" }}>
            <div className="bg-secondary dark:bg-secondary/50 rounded-2xl aspect-[4/5] md:aspect-square relative overflow-hidden group shadow-2xl max-h-[500px]">
              <img 
                src="/images/bw-showcase.jpg" 
                alt="AI Platform Visualization"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent opacity-60" />
            </div>
          </div>

          {/* Right */}
          <div className="md:col-span-7 reveal-right md:pl-8" style={{ transitionDelay: "0.2s" }}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08] mb-4">
              InsightFlow components
              <br />
              for your next project
            </h2>
            <p className="text-muted-foreground mb-10 text-base leading-relaxed max-w-md">
              InsightFlow is the fit-for-purpose tool for analyzing and understanding your business data.
            </p>

            <div className="flex items-center">
              <MagicCard className="w-full max-w-sm animate-fade-in shadow-xl" key={activeFeature}>
                <CardContent className="p-7 flex flex-col min-h-[320px]">
                  <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center shrink-0 text-foreground mb-6 bg-secondary/50">
                    {features[activeFeature].icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{features[activeFeature].title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-8 flex-grow">
                    {features[activeFeature].desc}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {features.map((_, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-300", 
                            i === activeFeature ? "w-6 bg-foreground" : "w-1.5 bg-border"
                          )} 
                        />
                      ))}
                    </div>
                    
                    <button 
                      onClick={nextFeature}
                      className="inline-flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all text-foreground"
                    >
                      Next Feature
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </button>
                  </div>
                </CardContent>
              </MagicCard>
            </div>


          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 4 — "Your workspace anywhere" (ref: image 4)
         ══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="reveal-left" style={{ transitionDelay: "0.1s" }}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08] mb-6">
              Your workspace
              <br />
              anywhere.
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-sm">
              Set up your environment with everything you need and share it effortlessly. Stay productive throughout your workflow, no matter where you are.
            </p>
            <Link href="/signup" className={cn(buttonVariants({ size: "sm" }), "rounded-full px-5 font-semibold hover:scale-[1.02] transition-transform")}>
              Get Started →
            </Link>
          </div>

          {/* Right: Animated bar chart */}
          <MagicCard className="relative reveal-right border-none bg-transparent shadow-none overflow-visible" style={{ transitionDelay: "0.2s" }}>
            <div className="absolute inset-x-8 inset-y-4 border border-dashed border-border/60 rounded-lg pointer-events-none" />
            
            {/* Scattered × marks */}
            <span className="absolute top-0 left-1/4 text-xs font-bold text-foreground/40 animate-float stagger-1">×</span>
            <span className="absolute top-2 right-1/4 text-xs font-bold text-foreground/40 animate-float stagger-3">×</span>
            <span className="absolute bottom-6 left-1/3 text-xs font-bold text-foreground/40 animate-float stagger-5">×</span>
            <span className="absolute bottom-2 right-[15%] text-xs font-bold text-foreground/40 animate-float stagger-2">×</span>
            <span className="absolute top-1/3 right-4 text-xs font-bold text-foreground/40 animate-float stagger-4">×</span>
            
            {/* New × marks */}
            <span className="absolute top-8 left-8 text-[10px] font-bold text-foreground/30 animate-float stagger-2">×</span>
            <span className="absolute top-1/2 left-4 text-[11px] font-bold text-foreground/25 animate-float-slow stagger-4">×</span>
            <span className="absolute bottom-12 right-12 text-[9px] font-bold text-foreground/35 animate-float stagger-1">×</span>
            <span className="absolute top-4 left-1/2 text-xs font-bold text-foreground/30 animate-float-slow stagger-5">×</span>
            <span className="absolute bottom-1/4 right-[5%] text-[10px] font-bold text-foreground/20 animate-float stagger-3">×</span>
            <span className="absolute top-[15%] right-[30%] text-xs font-bold text-foreground/40 animate-float stagger-5">×</span>
            
            {/* Even more × marks */}
            <span className="absolute top-4 right-1/3 text-[8px] font-bold text-foreground/20 animate-float stagger-2">×</span>
            <span className="absolute top-1/3 left-[10%] text-[14px] font-bold text-foreground/15 animate-float-slow stagger-1">×</span>
            <span className="absolute bottom-4 left-1/4 text-[12px] font-bold text-foreground/25 animate-float stagger-4">×</span>
            <span className="absolute top-2/3 right-1/4 text-[10px] font-bold text-foreground/30 animate-float-slow stagger-3">×</span>
            <span className="absolute top-10 left-[40%] text-[9px] font-bold text-foreground/20 animate-float stagger-5">×</span>
            <span className="absolute bottom-10 right-[40%] text-[11px] font-bold text-foreground/15 animate-float-slow stagger-2">×</span>
            <span className="absolute top-1/2 right-[10%] text-[13px] font-bold text-foreground/25 animate-float stagger-4">×</span>
            <span className="absolute bottom-1/3 left-6 text-[8px] font-bold text-foreground/35 animate-float-slow stagger-1">×</span>
            <span className="absolute top-2 left-2/3 text-[10px] font-bold text-foreground/20 animate-float stagger-5">×</span>
            <span className="absolute bottom-2 left-1/2 text-[12px] font-bold text-foreground/30 animate-float-slow stagger-3">×</span>

            {/* Bar chart with staggered grow animation */}
            <div className="flex items-end justify-center gap-[3px] h-48 md:h-64 relative z-10 py-8">
              {[30,50,20,65,40,70,25,80,35,60,45,75,30,55,40,70,50,85,35,65,20,50,45,60,30,55,40].map((h, i) => (
                <div
                  key={i}
                  className="w-2 md:w-2.5 rounded-sm bg-foreground animate-bar-grow"
                  style={{ height: `${h}%`, animationDelay: `${i * 0.04}s` }}
                />
              ))}
            </div>

            {/* Cursor */}
            <div className="absolute bottom-4 right-12 animate-float-slow">
              <svg className="w-8 h-8 text-foreground" fill="currentColor" viewBox="0 0 24 24"><path d="M5.5 3.21V20.79l5.71-5.71h7.29L5.5 3.21z" /></svg>
            </div>
          </MagicCard>
        </div>
      </section>


      {/* ══════════════════════════════════════
          SECTION 6 — Contact / Get in touch (ref: image 3)
         ══════════════════════════════════════ */}
      <section id="contact" className="border-y border-border bg-secondary/40 dark:bg-secondary/20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-20 md:py-28 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Left */}
          <div className="reveal-left" style={{ transitionDelay: "0.1s" }}>
            <p className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Contact us</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08] mb-6">
              Always Track &amp;
              <br />
              Analyze Your Business
              <br />
              Statistics To Succeed.
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-sm">
              A better way to manage your sales, team, clients &amp; marketing — on a single platform. Powerful, affordable, and easy.
            </p>

            {/* Email + button row (ref: image 3) */}
            <div className="flex gap-2 mb-8 max-w-sm">
              <div className="flex-1 px-4 h-12 rounded-lg border border-border bg-background text-sm text-muted-foreground flex items-center">
                Enter your email
              </div>
              <Link href="/signup" className={cn(buttonVariants({ size: "default" }), "rounded-lg h-12 px-6 font-semibold shrink-0 flex items-center")}>
                Get started
              </Link>
            </div>
          </div>

          {/* Right: decorative illustration area */}
          <div className="reveal-right relative flex items-center justify-center" style={{ transitionDelay: "0.2s" }}>
            <div className="relative rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.25)] border border-white/10 transition-all duration-500 hover:shadow-[0_0_70px_rgba(59,130,246,0.4)] group">
              <img 
                src="/contact-illustration.png" 
                alt="Insight Analytics"
                className="w-full h-auto block transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER — Detailed columnar (ref: Outli image 1)
         ══════════════════════════════════════ */}
      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-5 group">
                <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-background text-sm font-bold">IF</span>
                </div>
                <span className="text-lg font-semibold tracking-tight">InsightFlow</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                AI-powered business intelligence for small businesses.
              </p>
              {/* Social icons */}
              <div className="flex gap-3">
                {[
                  <svg key="tw" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
                  <svg key="gh" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" /></svg>,
                  <svg key="li" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>,
                ].map((icon, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors cursor-pointer">
                    {icon}
                  </div>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {[
              { title: "Product", links: ["Dashboard", "Forecasting", "Segmentation", "Health Score", "Pricing"] },
              { title: "Resources", links: ["Documentation", "API Reference", "Blog", "Changelog", "Status"] },
              { title: "Company", links: ["About", "Careers", "Contact", "Partners", "Press"] },
              { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR", "Security"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-sm mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 InsightFlow AI. All rights reserved.
            </p>
            <div className="flex gap-6">
              {["Privacy", "Terms", "Cookies"].map((item) => (
                <Link key={item} href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Animated Preview Components
// ─────────────────────────────────────────────────────────────

function DashboardPreview() {
  return (
    <div className="w-full h-full p-4 md:p-6 flex gap-4 md:gap-6 animate-fade-in-up font-sans">
      <div className="hidden sm:flex flex-col w-48 border border-foreground/10 rounded-xl bg-background/90 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-md p-4 space-y-2">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Analytics Menu</div>
        {[ 
           { icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", label: "Overview", active: true },
           { icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z", label: "Sales & MRR", active: false },
           { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", label: "Customers", active: false },
        ].map(item => (
           <div key={item.label} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors", item.active ? "bg-blue-500/15 text-blue-600 dark:text-blue-400" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground")}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={item.icon}/></svg>
              <span className="text-sm font-medium">{item.label}</span>
           </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-center bg-background/80 p-3 rounded-xl border border-foreground/5 shadow-sm">
          <h2 className="text-base font-bold">Q3 Performance</h2>
          <div className="text-xs bg-foreground/5 px-2 py-1 rounded border border-foreground/10 text-muted-foreground">Sep 1 - Sep 30</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
           <div className="border border-foreground/10 rounded-xl bg-background/90 shadow-md backdrop-blur-md p-4 transition-transform hover:-translate-y-1">
             <p className="text-xs text-muted-foreground font-medium mb-1">Total Revenue</p>
             <h4 className="text-lg md:text-xl font-extrabold text-foreground">$124,563.00</h4>
             <div className="flex items-center justify-between mt-3">
               <span className="text-[10px] md:text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">+14.5%</span>
               <div className="flex items-end gap-[2px] h-6">
                 {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                   <div key={i} className="w-1.5 md:w-2 bg-emerald-500 rounded-sm animate-bar-grow origin-bottom" style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }} />
                 ))}
               </div>
             </div>
           </div>
           
           <div className="border border-foreground/10 rounded-xl bg-background/90 shadow-md backdrop-blur-md p-4 transition-transform hover:-translate-y-1">
             <p className="text-xs text-muted-foreground font-medium mb-1">New Customers</p>
             <h4 className="text-lg md:text-xl font-extrabold text-foreground">1,250</h4>
             <div className="flex items-center justify-between mt-3">
               <span className="text-[10px] md:text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded-full">+5.2%</span>
               <div className="flex items-end gap-[2px] h-6">
                 {[30, 40, 50, 45, 60, 80, 75].map((h, i) => (
                   <div key={i} className="w-1.5 md:w-2 bg-blue-500 rounded-sm animate-bar-grow origin-bottom" style={{ height: `${h}%`, animationDelay: `${i * 0.1 + 0.2}s` }} />
                 ))}
               </div>
             </div>
           </div>
           
           <div className="hidden md:block border border-foreground/10 rounded-xl bg-background/90 shadow-md backdrop-blur-md p-4 transition-transform hover:-translate-y-1">
             <p className="text-xs text-muted-foreground font-medium mb-1">Active Churn</p>
             <h4 className="text-lg md:text-xl font-extrabold text-foreground">1.2%</h4>
             <div className="flex items-center justify-between mt-3">
               <span className="text-[10px] md:text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-full">-0.4%</span>
               <div className="flex items-end gap-[2px] h-6">
                 {[100, 80, 90, 70, 50, 40, 20].map((h, i) => (
                   <div key={i} className="w-2 bg-rose-500 rounded-sm animate-bar-grow origin-bottom" style={{ height: `${h}%`, animationDelay: `${i * 0.1 + 0.4}s` }} />
                 ))}
               </div>
             </div>
           </div>
        </div>

        <div className="flex-1 border border-foreground/10 rounded-xl bg-background/90 shadow-md backdrop-blur-md p-4 flex flex-col justify-end">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-sm font-bold">Revenue Trajectory</h3>
             <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/15 rounded px-2 py-1">Last 12 Months</span>
           </div>
           <div className="flex-1 flex items-end gap-1.5 md:gap-3 justify-between pt-2 border-b border-foreground/10 pb-1 relative">
              <div className="absolute -left-2 top-0 h-full flex flex-col justify-between text-[9px] text-muted-foreground font-medium py-1">
                <span>$100k</span><span>$50k</span><span>0</span>
              </div>
              <div className="w-5" /> 
              {[30, 40, 25, 60, 45, 80, 55, 95, 70, 85, 60, 100].map((h, i) => (
                <div key={i} className="w-full max-w-[24px] bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-sm relative group cursor-pointer hover:brightness-125 animate-bar-grow origin-bottom shadow-[0_0_10px_rgba(99,102,241,0.2)]" style={{ height: `${h}%`, animationDelay: `${i * 0.04 + 0.2}s` }}>
                   <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded shadow-xl pointer-events-none z-10 whitespace-nowrap">
                     ${(h * 1.2).toFixed(1)}k
                   </div>
                </div>
              ))}
           </div>
           <div className="flex justify-between mt-1 pl-8 text-[9px] text-muted-foreground/60 font-bold uppercase tracking-widest hidden md:flex">
             <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
           </div>
        </div>
      </div>
    </div>
  )
}

function ForecastingPreview() {
  return (
    <div className="w-full h-full p-4 md:p-8 flex flex-col justify-center animate-fade-in relative font-sans">
      <div className="bg-background/95 backdrop-blur-md border border-foreground/10 shadow-2xl rounded-2xl p-6 relative w-full h-[320px] flex flex-col mx-auto max-w-3xl">
        <div className="flex justify-between items-start mb-6 border-b border-foreground/5 pb-4">
           <div>
             <h3 className="text-base md:text-lg font-bold flex items-center gap-2 text-foreground">
               <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
               Automated Revenue Forecast
             </h3>
             <p className="text-[11px] md:text-xs text-muted-foreground mt-1">Projected Q4 performance based on active trajectory and AI models.</p>
           </div>
           <div className="bg-violet-500/10 text-violet-600 dark:text-violet-400 px-3 py-1 rounded-full text-xs font-bold border border-violet-500/20 shadow-sm flex items-center gap-1.5">
             <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-ping" />
             98% Confidence
           </div>
        </div>

        <div className="relative flex-1 border-b border-l border-foreground/10 flex items-end ml-8 mb-4">
          {/* Y axis */}
          <div className="absolute -left-10 h-full flex flex-col justify-between text-[10px] text-muted-foreground font-medium pb-2">
            <span>2.0M</span><span>1.5M</span><span>1.0M</span>
          </div>

          {/* Glow */}
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-violet-500/20 to-transparent blur-3xl animate-pulse" />
          
          <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
            <defs>
               <linearGradient id="forecastGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
               </linearGradient>
            </defs>
            {/* Historical Data Line (Solid Blue) */}
            <path d="M 0,90 Q 20,80 40,50 T 60,40" fill="none" stroke="#3b82f6" strokeWidth="3" className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            
            {/* AI Forecast Line (Dashed Violet) */}
            <path d="M 60,40 T 80,20 T 100,5" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeDasharray="4 4" className="animate-[dash-draw_2s_ease-out_forwards] drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" strokeDashoffset="100" />
            
            {/* Confidence Band Polygon */}
            <path d="M 60,40 T 80,10 T 100,-5 L 100,15 T 80,30 T 60,40 Z" fill="url(#forecastGlow)" className="animate-fade-in" style={{ animationDelay: "1s", animationFillMode: "both" }} />

            {/* End Point Dot */}
            <circle cx="100" cy="5" r="4" fill="#background" stroke="#8b5cf6" strokeWidth="3" className="animate-ping" style={{ animationDelay: "1.5s", transformOrigin: "100px 5px" }} />
            <circle cx="100" cy="5" r="4" fill="var(--background)" stroke="#8b5cf6" strokeWidth="3" className="animate-fade-in shadow-[0_0_15px_#8b5cf6]" style={{ animationDelay: "1.5s", animationFillMode: "both" }} />
          </svg>

          {/* Forecast Tag */}
          <div className="absolute right-0 -top-[35px] animate-fade-in-up" style={{ animationDelay: "1.8s", animationFillMode: "both" }}>
             <div className="bg-violet-600 text-white shadow-[0_4px_20px_rgba(139,92,246,0.4)] px-3 py-1.5 rounded-lg text-[11px] font-extrabold relative whitespace-nowrap tracking-wide">
               $1.85M Projected
               <div className="absolute -bottom-1 right-2.5 w-2 h-2 bg-violet-600 rotate-45" />
             </div>
          </div>
        </div>
        
        <div className="flex justify-between ml-8 text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
             <span>Jul</span><span>Aug</span><span className="text-blue-500 bg-blue-500/10 px-2 rounded">Sep (Now)</span><span className="text-violet-500">Oct</span><span className="text-violet-500">Nov</span><span className="text-violet-500">Dec</span>
        </div>
      </div>
    </div>
  )
}

function SegmentationPreview() {
  return (
    <div className="w-full h-full p-4 flex flex-col animate-fade-in relative font-sans">
       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/[0.03] to-transparent pointer-events-none" />
       
       <h3 className="absolute top-4 left-6 text-sm font-bold border border-foreground/10 bg-background/80 px-3 py-1.5 rounded-lg shadow-sm backdrop-blur">
         Customer Segmentation Matrix
       </h3>

       {/* Core Node */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-background border border-foreground/10 rounded-3xl z-10 flex flex-col items-center justify-center shadow-2xl backdrop-blur-md">
         <div className="absolute inset-0 rounded-3xl border-2 border-indigo-500 animate-ping opacity-20" />
         <svg className="w-8 h-8 text-indigo-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
         <span className="text-[10px] font-extrabold text-foreground tracking-widest uppercase">IF Model</span>
       </div>

       {/* Cluster 1: Enterprise */}
       <div className="absolute top-[15%] left-[20%] animate-float">
         <div className="relative group cursor-pointer">
           <div className="w-28 h-28 bg-blue-500/10 rounded-full flex flex-col items-center justify-center backdrop-blur-md border-[1.5px] border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-transform group-hover:scale-110">
             <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wider">Enterprise</div>
             <div className="text-[18px] font-bold text-blue-600 dark:text-blue-400 mb-1">42%</div>
             <div className="flex gap-1 flex-wrap w-8 justify-center">
               {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />)}
             </div>
           </div>
         </div>
       </div>

       {/* Cluster 2: Mid-Market */}
       <div className="absolute top-[10%] right-[20%] animate-float-slow">
         <div className="relative group cursor-pointer delay-150">
           <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex flex-col items-center justify-center backdrop-blur-md border-[1.5px] border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-transform group-hover:scale-110">
             <div className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider">Mid-Market</div>
             <div className="flex gap-1 flex-wrap w-6 justify-center mt-1">
               {[1,2,3,4].map(i => <div key={i} className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />)}
             </div>
           </div>
         </div>
       </div>

       {/* Cluster 3: SMB */}
       <div className="absolute bottom-[20%] right-[30%] animate-float stagger-2">
         <div className="relative group cursor-pointer">
           <div className="w-32 h-32 bg-orange-500/10 rounded-full flex flex-col items-center justify-center backdrop-blur-md border-[1.5px] border-orange-500/40 shadow-[0_0_30px_rgba(249,115,22,0.15)] transition-transform group-hover:scale-110">
             <div className="text-[10px] font-bold text-orange-600 dark:text-orange-400 mb-1 uppercase tracking-wider">SMB / Retail</div>
             <div className="text-[16px] font-bold text-orange-600 dark:text-orange-400 mb-1">High Churn Risk</div>
             <div className="flex gap-1 flex-wrap w-14 justify-center mt-1">
               {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => <div key={i} className="w-1.5 h-1.5 bg-orange-500 rounded-full" />)}
             </div>
           </div>
         </div>
       </div>

       {/* Tooltip Simulation */}
       <div className="absolute bottom-6 left-6 max-w-[200px] bg-background border border-foreground/10 rounded-xl p-4 shadow-2xl backdrop-blur animate-fade-in-up delay-700">
         <div className="flex items-center gap-2 mb-2">
           <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
           <span className="text-[10px] font-bold text-muted-foreground uppercase">Insight</span>
         </div>
         <p className="text-xs font-semibold leading-tight">Enterprise segment grew by <span className="text-blue-500">12%</span> this quarter. Focus marketing spend here.</p>
       </div>
    </div>
  )
}

function ReportsPreview() {
  return (
    <div className="w-full h-full p-4 md:p-6 flex items-stretch gap-4 md:gap-6 animate-scale-in font-sans">
      <div className="hidden sm:flex flex-col w-56 border border-foreground/10 rounded-xl bg-background/90 shadow-sm backdrop-blur-md p-4 space-y-3">
        <div className="text-[10px] font-bold text-muted-foreground uppercase pb-3 border-b border-foreground/5 tracking-wider">Generated Reports</div>
        {[
           { name: "Q3 Financials.pdf", time: "2 mins ago", color: "text-rose-500", bg: "bg-rose-500/15 border-rose-500/20" },
           { name: "Churn Analysis.csv", time: "Yesterday", color: "text-emerald-500", bg: "bg-emerald-500/15 border-emerald-500/20" },
           { name: "Board Summary.docx", time: "Last Week", color: "text-blue-500", bg: "bg-blue-500/15 border-blue-500/20" },
        ].map((file, i) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-foreground/5 cursor-pointer transition-colors animate-fade-in-left border border-transparent hover:border-foreground/10" style={{ animationDelay: `${i*0.1}s` }}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${file.bg}`}>
              <svg className={`w-5 h-5 ${file.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div className="flex flex-col overflow-hidden">
               <span className="text-xs font-bold truncate text-foreground">{file.name}</span>
               <span className="text-[9px] text-muted-foreground font-medium">{file.time}</span>
            </div>
          </div>
        ))}
        <div className="mt-auto pt-4 border-t border-foreground/5">
           <button className="w-full py-2 bg-foreground text-background text-xs font-bold rounded-lg shadow-md hover:scale-105 transition-transform">
             + New Report
           </button>
        </div>
      </div>

      <div className="flex-1 h-full border border-foreground/10 rounded-xl bg-background shadow-2xl p-5 md:p-8 flex flex-col relative overflow-hidden animate-fade-in-right" style={{ animationDelay: "0.2s" }}>
        <div className="flex items-center justify-between pb-5 border-b border-foreground/10">
          <div>
            <h2 className="text-xl font-extrabold text-foreground mb-1">Executive Summary</h2>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border max-w-fit border-foreground/10 px-2 py-0.5 rounded">Q3 Review - Auto Generated</div>
          </div>
          <div className="hidden sm:flex gap-4 items-center">
             <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">Share</div>
             <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-foreground text-background shadow-md">Export PDF</div>
          </div>
        </div>
        
        <div className="flex flex-1 pt-6 gap-8">
           <div className="flex-1 space-y-5">
             <div className="w-full h-10 bg-gradient-to-r from-foreground/10 to-foreground/5 rounded-lg animate-pulse" />
             <div className="w-5/6 h-5 bg-foreground/5 rounded animate-pulse delay-75" />
             <div className="w-4/5 h-5 bg-foreground/5 rounded animate-pulse delay-100" />
             
             <div className="grid grid-cols-2 gap-4 mt-8">
               <div className="px-4 py-3 border border-emerald-500/20 bg-emerald-500/5 rounded-xl shadow-sm">
                 <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider mb-2">Net Growth</div>
                 <div className="text-3xl font-extrabold text-emerald-500 flex items-end gap-1">
                   +24% <span className="text-xs font-medium text-emerald-600/50 mb-1">MoM</span>
                 </div>
               </div>
               <div className="px-4 py-3 border border-indigo-500/20 bg-indigo-500/5 rounded-xl shadow-sm">
                 <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-extrabold uppercase tracking-wider mb-2">Efficiency</div>
                 <div className="text-3xl font-extrabold text-indigo-500 flex items-end gap-1">
                   92 <span className="text-xs font-medium text-indigo-600/50 mb-1">Score</span>
                 </div>
               </div>
             </div>
           </div>
           <div className="w-40 flex flex-col items-center justify-center shrink-0 border-l border-foreground/5 pl-8 hidden lg:flex">
             <div className="relative w-36 h-36 drop-shadow-xl">
               <svg className="w-full h-full transform -rotate-90">
                 {/* Background */}
                 <circle cx="50%" cy="50%" r="40%" fill="none" stroke="currentColor" strokeWidth="20%" className="text-foreground/5" />
                 {/* Blue segment */}
                 <circle cx="50%" cy="50%" r="40%" fill="none" stroke="#3b82f6" strokeWidth="20%" strokeDasharray="250" strokeDashoffset="120" className="animate-[dash-draw_1s_ease-out_forwards]" />
                 {/* Emerald segment */}
                 <circle cx="50%" cy="50%" r="40%" fill="none" stroke="#10b981" strokeWidth="20%" strokeDasharray="250" strokeDashoffset="200" className="animate-[dash-draw_1.5s_ease-out_forwards] -rotate-45 origin-center" />
                 {/* Rose segment */}
                 <circle cx="50%" cy="50%" r="40%" fill="none" stroke="#f43f5e" strokeWidth="20%" strokeDasharray="250" strokeDashoffset="230" className="animate-[dash-draw_2s_ease-out_forwards] rotate-90 origin-center" />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Overall</span>
                 <span className="text-3xl font-extrabold">A+</span>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}

function AIInsightsPreview() {
  return (
    <div className="w-full h-full p-4 md:p-6 flex gap-4 md:gap-6 animate-fade-in relative font-sans">
       <div className="hidden sm:flex flex-col w-48 space-y-4 animate-fade-in-right bg-background/80 backdrop-blur border border-foreground/10 p-4 rounded-xl shadow-sm">
         <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Data Sources</div>
         <div className="space-y-3">
            {[ 
              { name: "Stripe", color: "bg-indigo-500" },
              { name: "Salesforce", color: "bg-blue-500" },
              { name: "Shopify", color: "bg-emerald-500" },
              { name: "Google Analytics", color: "bg-amber-500" }
            ].map((source) => (
               <div key={source.name} className="flex items-center gap-3 p-2 rounded-lg bg-background border border-foreground/10 text-xs font-semibold shadow-sm transition-transform hover:scale-105 cursor-default">
                 <span className="relative flex h-2.5 w-2.5">
                   <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${source.color} opacity-75`}></span>
                   <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${source.color}`}></span>
                 </span>
                 {source.name}
               </div>
            ))}
         </div>
       </div>

       <div className="flex-1 flex flex-col h-full bg-background border border-foreground/10 shadow-2xl rounded-xl overflow-hidden animate-fade-in-up">
         <div className="px-5 py-4 border-b border-foreground/10 flex items-center justify-between bg-blue-500/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                <span className="text-white text-[10px] font-extrabold">IF</span>
              </div>
              <div>
                <h3 className="text-sm font-extrabold leading-none mb-1">InsightFlow AI</h3>
                <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Online & Analyzing</p>
              </div>
            </div>
         </div>

         <div className="p-5 space-y-5 flex-1 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/[0.02] to-transparent">
           <div className="flex gap-3 flex-row-reverse">
             <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
               <svg className="w-4 h-4 text-foreground/70" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
             </div>
             <div className="bg-secondary/80 border border-foreground/5 p-3 rounded-2xl rounded-tr-sm shadow-sm max-w-[80%] text-sm font-medium">
               Why did our conversion rate drop last week?
             </div>
           </div>

           <div className="flex gap-3 animate-fade-in-up" style={{ animationDelay: "0.6s", animationFillMode: "both" }}>
             <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(37,99,235,0.4)] animate-pulse">
               <span className="text-white text-[10px] font-extrabold">IF</span>
             </div>
             <div className="bg-blue-600/10 border border-blue-500/20 p-5 rounded-2xl rounded-tl-sm shadow-md max-w-[90%]">
               <p className="text-sm leading-relaxed mb-4 font-medium">
                 I analyzed your <strong className="text-blue-600 dark:text-blue-400 underline decoration-blue-500/30 underline-offset-4">Google Analytics</strong> and <strong className="text-blue-600 dark:text-blue-400 underline decoration-blue-500/30 underline-offset-4">Shopify</strong> data. 
                 The drop correlates perfectly with a <strong className="text-rose-500 bg-rose-500/10 px-1 rounded">40% increase</strong> in mobile page load times on the checkout route right after the latest catalog update.
               </p>
               
               <div className="bg-background rounded-xl p-4 border border-foreground/10 shadow-inner flex flex-col w-full max-w-sm">
                 <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Latency Spike Analysis (Mobile)</div>
                 <div className="flex items-end justify-between gap-1.5 h-20 w-full mb-1">
                   {[2, 3, 2, 4, 3, 8, 9].map((val, i) => (
                      <div key={i} className={`w-full rounded-t-sm animate-bar-grow origin-bottom ${val > 5 ? 'bg-gradient-to-t from-rose-500 to-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-gradient-to-t from-emerald-500 to-emerald-400'}`} style={{ height: `${val * 10}%`, animationDelay: `${i * 0.1 + 1.2}s` }} />
                   ))}
                 </div>
                 <div className="flex justify-between text-[9px] font-bold text-muted-foreground mt-2 border-t border-foreground/10 pt-2">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span className="text-rose-500">Fri</span><span className="text-rose-500">Sat</span><span className="text-rose-500">Sun</span>
                 </div>
               </div>
               
               <button className="mt-4 bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                 Auto-Optimize Images
               </button>
             </div>
           </div>
         </div>
       </div>

    </div>
  )
}

