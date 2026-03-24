"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle2, Home, User, Briefcase, Lock, ArrowRight, ArrowLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    state: "",
    pincode: "",
    country: "",
    business_name: "",
    industry: "Retail",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const router = useRouter();

  const industries = [
    "Retail",
    "E-commerce",
    "Food & Beverage",
    "Healthcare",
    "Technology",
    "Manufacturing",
    "Services",
    "Education",
    "Other",
  ];

  const handleNext = () => {
    if (step === 1) {
      if (!form.email || !form.password || !form.confirmPassword) {
        toast.error("Please fill in all fields.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!form.firstName || !form.lastName) {
        toast.error("Please enter your full name.");
        return;
      }
      setStep(3);
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showOtpInput) return; // Prevent normal submit if we are in OTP step

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          name: `${form.firstName} ${form.lastName}`.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      setShowOtpInput(true);
      toast.success("Verification code sent to your email!");
    } catch (err: any) {
      toast.error(err.message || "An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      toast.success("Email verified successfully!");
      setSuccess(true);
      setShowOtpInput(false);
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const currentStepData = [
    { title: "Account Details", subtitle: "Setup Account", icon: Home, num: 1 },
    { title: "Personal Info", subtitle: "Add Details", icon: User, num: 2 },
    { title: "Business Profile", subtitle: "Setup Business", icon: Briefcase, num: 3 },
  ];

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
        <div className="w-full max-w-2xl mx-auto">
          {success ? (
            <div className="text-center py-8 space-y-6 max-w-md mx-auto">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight">Account Verified!</h3>
                <p className="text-muted-foreground">
                  Your email has been successfully verified. You can now sign in to your InsightFlow AI account.
                </p>
              </div>
              <Link 
                href="/login" 
                className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full")}
              >
                Go to Sign In
              </Link>
            </div>
          ) : showOtpInput ? (
            <div className="space-y-8 max-w-md mx-auto py-8">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Check your email</h3>
                <p className="text-muted-foreground text-sm">
                  We've sent a 6-digit verification code to <br/>
                  <span className="text-foreground font-medium">{form.email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                    className="text-center text-3xl tracking-[0.5em] font-bold h-16 rounded-xl"
                    required
                  />
                </div>
                <Button type="submit" disabled={otpLoading} size="lg" className="w-full h-12 text-md">
                  {otpLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    "Verify Email"
                  )}
                </Button>
                <div className="text-center pt-2">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the code?{" "}
                    <button 
                      type="button"
                      onClick={handleSubmit} 
                      className="text-primary hover:underline font-medium"
                    >
                      Resend
                    </button>
                  </p>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* Stepper Header */}
              <div className="mb-12 border-b border-border/60 pb-8">
                <div className="flex items-center justify-between gap-4 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
                  {currentStepData.map((s, i) => {
                    const isActive = step === s.num;
                    const isCompleted = step > s.num;
                    const Icon = s.icon;
                    
                    return (
                      <div key={s.num} className="flex items-center gap-3 shrink-0">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm",
                          isActive ? "bg-primary text-primary-foreground" : 
                          isCompleted ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="hidden sm:block">
                          <p className={cn(
                            "text-sm font-bold",
                            (isActive || isCompleted) ? "text-foreground" : "text-muted-foreground"
                          )}>{s.title}</p>
                          <p className="text-xs text-muted-foreground">{s.subtitle}</p>
                        </div>
                        {i < currentStepData.length - 1 && (
                          <ChevronRight className="w-5 h-5 text-muted-foreground/50 ml-4 hidden md:block" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Content */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">
                  {step === 1 ? "Account Details" : step === 2 ? "Personal Information" : "Business Profile"}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {step === 1 ? "Enter your email and create a password." : 
                   step === 2 ? "Tell us a bit about yourself." : 
                   "Setup your business workspace."}
                </p>

                <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()} className="space-y-6">
                  {step === 1 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="you@company.com"
                          className="h-12"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          placeholder="Create a password (min 6 characters)"
                          minLength={6}
                          className="h-12"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={form.confirmPassword}
                          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                          placeholder="Confirm your password"
                          minLength={6}
                          className="h-12"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            type="text"
                            value={form.firstName}
                            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                            placeholder="John"
                            className="h-12"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            type="text"
                            value={form.lastName}
                            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                            placeholder="Doe"
                            className="h-12"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          type="text"
                          value={form.address}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                          placeholder="123 Main St"
                          className="h-12"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            type="text"
                            value={form.state}
                            onChange={(e) => setForm({ ...form, state: e.target.value })}
                            placeholder="NY"
                            className="h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pincode">Pincode</Label>
                          <Input
                            id="pincode"
                            type="text"
                            value={form.pincode}
                            onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                            placeholder="10001"
                            className="h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            type="text"
                            value={form.country}
                            onChange={(e) => setForm({ ...form, country: e.target.value })}
                            placeholder="USA"
                            className="h-12"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="space-y-2">
                        <Label htmlFor="business_name">Business Name</Label>
                        <Input
                          id="business_name"
                          type="text"
                          value={form.business_name}
                          onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                          placeholder="Acme Corp"
                          className="h-12"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Select
                          value={form.industry}
                          onValueChange={(value) => setForm({ ...form, industry: value || "" })}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select Industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {industries.map((ind) => (
                              <SelectItem key={ind} value={ind}>
                                {ind}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="mt-10 flex items-center gap-4 pt-4 border-t border-border/50">
                    {step > 1 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handlePrev}
                        className="h-12 px-6"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                    )}
                    
                    {step < 3 ? (
                      <Button 
                        type="button" 
                        onClick={handleNext}
                        className={cn("h-12 px-8", step === 1 ? "w-full" : "ml-auto")}
                      >
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="ml-auto h-12 px-8"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            Creating account...
                          </span>
                        ) : (
                          <>
                            Submit
                            <CheckCircle2 className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </div>
              
              <div className="text-center mt-8">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary font-medium hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
