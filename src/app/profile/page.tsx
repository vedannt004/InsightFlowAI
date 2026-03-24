"use client";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const user = session?.user as any;

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Account deleted successfully");
        signOut({ callbackUrl: "/" });
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to delete account");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Your account and business information</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-8">
          {/* Avatar */}
          <div className="flex items-center gap-5 mb-8 pb-8 border-b border-border">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-blue-900/20 border border-white/5">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{user?.name || "User"}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                <div className="px-4 py-3 rounded-xl bg-secondary/30 border border-border text-foreground text-sm font-medium">
                  {user?.name || "—"}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <div className="px-4 py-3 rounded-xl bg-secondary/30 border border-border text-foreground text-sm font-medium">
                  {user?.email || "—"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                <div className="px-4 py-3 rounded-xl bg-secondary/30 border border-border text-foreground text-sm font-medium">
                  {user?.phone || "—"}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Business Sector</label>
                <div className="px-4 py-3 rounded-xl bg-secondary/30 border border-border text-foreground text-sm font-medium">
                  {user?.industry || "—"}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Business Name</label>
              <div className="px-4 py-3 rounded-xl bg-secondary/30 border border-border text-foreground text-sm font-medium">
                {user?.business_name || "—"}
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Mailing Address</label>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">Street Address</label>
                  <div className="px-4 py-3 rounded-xl bg-secondary/30 border border-border text-foreground text-sm">
                    {user?.address || "—"}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">State</label>
                    <div className="px-4 py-3 rounded-xl bg-secondary/30 border border-border text-foreground text-sm">
                      {user?.state || "—"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">Pincode</label>
                    <div className="px-4 py-3 rounded-xl bg-secondary/30 border border-border text-foreground text-sm">
                      {user?.pincode || "—"}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">Country</label>
                    <div className="px-4 py-3 rounded-xl bg-secondary/30 border border-border text-foreground text-sm">
                      {user?.country || "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-12 pt-8 border-t border-red-500/10 bg-red-500/5 -mx-8 -mb-8 p-8 rounded-b-xl">
            <h3 className="text-sm font-bold text-red-500 flex items-center gap-2 mb-3 uppercase tracking-wider">
              <AlertTriangle size={16} />
              Danger Zone
            </h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Once you delete your account, there is no going back. All your business data, forecasts, and uploaded files will be permanently erased from our servers.
            </p>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all uppercase text-[11px] font-bold tracking-widest px-6">
                  Delete My Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader className="items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
                    <Trash2 size={24} />
                  </div>
                  <DialogTitle className="text-xl font-bold">Delete your account?</DialogTitle>
                  <DialogDescription className="text-slate-400 pt-2 leading-relaxed">
                    This action is <span className="text-red-500 font-bold uppercase">permanent</span>. All your data will be permanently gone. Are you absolutely sure you want to proceed?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center gap-3 mt-4">
                  <DialogClose asChild>
                    <Button variant="outline" className="flex-1 rounded-xl">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button 
                    variant="destructive" 
                    className="flex-1 rounded-xl bg-red-600 hover:bg-red-700"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Confirm Delete"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
