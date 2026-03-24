"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      if (result.error === "Please verify your email to login.") {
        toast.error("Please verify your email address to log in.");
      } else {
        toast.error("Invalid email or password");
      }
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side illustration - hidden on mobile */}
      <div className="hidden lg:flex w-[40%] bg-muted flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Subtle patterned background or gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background z-0"></div>
        
        {/* Abstract shapes / UI elements to resemble SaaS illustration */}
        <div className="z-10 w-full max-w-md space-y-8 animate-fade-in-up">
           <Link href="/" className="inline-flex items-center gap-2.5 mb-12">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground text-sm font-bold">IF</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">InsightFlow AI</span>
          </Link>
          
          <div className="bg-card w-full rounded-2xl shadow-xl overflow-hidden border border-border/50">
             <div className="h-12 bg-muted/50 border-b border-border/50 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
             </div>
             <div className="p-8 space-y-6">
                <div className="h-4 w-1/3 bg-muted rounded-full"></div>
                <div className="space-y-3">
                  <div className="h-3 w-full bg-muted/70 rounded-full"></div>
                  <div className="h-3 w-[90%] bg-muted/70 rounded-full"></div>
                  <div className="h-3 w-[80%] bg-muted/70 rounded-full"></div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="h-24 bg-primary/5 rounded-xl border border-primary/10"></div>
                  <div className="h-24 bg-primary/5 rounded-xl border border-primary/10"></div>
                </div>
             </div>
          </div>
          
          <div className="text-center px-6">
            <h2 className="text-2xl font-semibold mb-2 text-foreground">Next-Gen Analytics</h2>
            <p className="text-muted-foreground">Join thousands of businesses unlocking AI-driven insights with our powerful dashboard.</p>
          </div>
        </div>
      </div>

      {/* Right side form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 animate-fade-in">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
            <p className="text-muted-foreground mb-8">Sign in to your account to continue.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link 
                      href="/forgot-password" 
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12"
                    required
                  />
                </div>
              </div>

              <div className="mt-8 pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-12 text-md"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary font-medium hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
