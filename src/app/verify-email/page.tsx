"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function VerifyEmailContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage("Your email has been verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Something went wrong. Please try again later.");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <Card className="w-full max-w-md border-white/10 bg-black/40 backdrop-blur-xl">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {status === "loading" && <Loader2 className="w-12 h-12 text-primary animate-spin" />}
          {status === "success" && <CheckCircle2 className="w-12 h-12 text-green-500" />}
          {status === "error" && <XCircle className="w-12 h-12 text-destructive" />}
        </div>
        <CardTitle className="text-2xl font-bold">
          {status === "loading" && "Verifying your email..."}
          {status === "success" && "Email Verified!"}
          {status === "error" && "Verification Failed"}
        </CardTitle>
        <CardDescription className="text-muted-foreground mt-2">
          {message}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pt-4">
        {status !== "loading" && (
          <Link 
            href="/login" 
            className={cn(buttonVariants({ variant: "default" }), "w-full")}
          >
            {status === "success" ? "Back to Login" : "Try Logging In"}
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black text-sm font-bold">IF</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">InsightFlow</span>
          </Link>
        </div>

        <Suspense fallback={
          <Card className="w-full max-w-md border-white/10 bg-black/40 backdrop-blur-xl">
            <CardHeader className="text-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
          </Card>
        }>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
