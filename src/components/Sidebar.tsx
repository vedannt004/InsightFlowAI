"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { 
  LayoutDashboard, 
  Upload, 
  Sparkles, 
  TrendingUp, 
  Users, 
  UserCircle, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageSquare
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/upload", label: "Upload Data", icon: <Upload size={18} /> },
  { href: "/insights", label: "AI Insights", icon: <Sparkles size={18} /> },
  { href: "/forecast", label: "Forecast", icon: <TrendingUp size={18} /> },
  { href: "/segments", label: "Segments", icon: <Users size={18} /> },
  { href: "/chat", label: "AI Assistant", icon: <MessageSquare size={18} /> },
  { href: "/profile", label: "Profile", icon: <UserCircle size={18} /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-[#06060c] border-r border-white/5 text-white flex flex-col transition-all duration-300 z-50 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/5 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center text-lg font-bold shadow-[0_0_15px_rgba(139,92,246,0.5)] flex-shrink-0">
          I
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-base font-bold leading-tight tracking-wide bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              InsightFlow AI
            </h1>
            <p className="text-[10px] text-slate-400 tracking-widest uppercase mt-0.5">Intelligence Core</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#0a0a14] border border-white/10 flex items-center justify-center text-xs text-white hover:border-violet-500 hover:text-violet-400 transition-all z-50 shadow-lg"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Nav */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? "bg-violet-600/20 border border-violet-500/30 text-white shadow-[inset_3px_0_0_#8b5cf6]"
                  : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <span className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${active ? "text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" : "text-slate-400 group-hover:text-white"}`}>
                {item.icon}
              </span>
              {!collapsed && <span className="tracking-wide">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User section at bottom */}
      <div className="border-t border-white/5 shrink-0">
        {/* User info */}
        {session?.user && !collapsed && (
          <div className="px-4 pt-3 pb-1">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
                {session.user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{session.user.name}</p>
                <p className="text-[10px] text-cyan-400 truncate">{(session.user as any).business_name || session.user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions row */}
        <div className={`flex items-center gap-2 px-4 py-3 ${collapsed ? "justify-center flex-col" : ""}`}>
          {/* Sign Out button — always visible */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all ${collapsed ? "w-full justify-center" : "flex-1"}`}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>

          {/* Theme toggle */}
          {!collapsed && <ThemeToggle />}
        </div>
      </div>
    </aside>
  );
}
