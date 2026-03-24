"use client";
import Sidebar from "./Sidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 animate-pulse">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-t-2 border-[#8b5cf6] animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-r-2 border-[#06b6d4] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <span className="text-2xl animate-glow-pulse drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]">I</span>
          </div>
          <p className="text-gradient-primary text-sm font-medium tracking-widest uppercase">Initializing Core...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-transparent">
      <Sidebar />
      <main className="ml-64 p-6 transition-all duration-500 ease-in-out">
        {children}
      </main>
    </div>
  );
}
