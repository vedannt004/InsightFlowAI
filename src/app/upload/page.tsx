"use client";
import { useState, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) validateAndSet(droppedFile);
  }, []);

  const validateAndSet = (f: File) => {
    setResult(null);
    const name = f.name.toLowerCase();
    if (!name.endsWith(".csv") && !name.endsWith(".xlsx") && !name.endsWith(".xls")) {
      toast.error("Only CSV and Excel (.xlsx, .xls) files are supported");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      toast.success("File uploaded successfully");
      setResult(data);
      setFile(null);
    } catch (err: any) {
      toast.error(err.message || "An error occurred during upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Upload Sales Data</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload CSV or Excel files with your sales data
          </p>
        </div>

        {/* Upload Area */}
        <div
          className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
            dragActive
              ? "border-violet-500 bg-violet-500/10"
              : "border-border bg-muted/30 hover:border-violet-500/50 hover:bg-muted/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center text-3xl mx-auto mb-4">
            📄
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {dragActive ? "Drop your file here" : "Drag & drop your file"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => {
              if (e.target.files?.[0]) validateAndSet(e.target.files[0]);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="px-3 py-1 rounded-full bg-muted border border-border">CSV</span>
            <span className="px-3 py-1 rounded-full bg-muted border border-border">XLSX</span>
            <span className="px-3 py-1 rounded-full bg-muted border border-border">XLS</span>
            <span className="px-3 py-1 rounded-full bg-muted border border-border">Max 10MB</span>
          </div>
        </div>

        {/* Selected File */}
        {file && (
          <div className="mt-4 p-4 rounded-xl border border-border bg-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center text-lg">
                📎
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-50"
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                "Upload & Process"
              )}
            </button>
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="mt-4 p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">✅</span>
              <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{result.message}</h3>
            </div>
            
            {/* Auto-mapping overview */}
            {result.mapping && (
              <div className="mb-6 bg-muted rounded-lg p-4 border border-border">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Auto-Mapped Columns Detected:</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {Object.entries(result.mapping).map(([key, val]: [string, any]) => (
                    <div key={key} className="flex items-center bg-background rounded-md px-2 py-1 border border-border">
                      <span className="text-muted-foreground w-16">{key}:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium ml-1">{val || 'Auto'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted border border-border">
                <p className="text-2xl font-bold text-foreground">{result.total_records}</p>
                <p className="text-xs text-muted-foreground">Total Rows</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted border border-border">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{result.cleaned_records}</p>
                <p className="text-xs text-muted-foreground">Processed</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted border border-border">
                <p className="text-2xl font-bold text-amber-500">{result.duplicates_removed}</p>
                <p className="text-xs text-muted-foreground">Dropped</p>
              </div>
            </div>
            <a
              href="/dashboard"
              className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-violet-500/30 transition-all"
            >
              View Analytics Dashboard →
            </a>
          </div>
        )}

        {/* Smart Auto-Detect Info */}
        <div className="mt-8 p-6 rounded-2xl border border-border bg-card">
          <div className="flex items-start gap-4">
            <span className="text-3xl">🤖</span>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Smart Auto-Detect Enabled</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-lg mb-3">
                You don't need a specific template! Just upload any sales or order export.
                Our AI heuristics algorithm will automatically detect columns like Dates, Revenue, Items, and Categories from your file.
              </p>
              <div className="flex items-center gap-3 text-xs">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Works with Shopify</span>
                <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">Works with Square</span>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">Works with Stripe</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <a
              href="/sample-data.csv"
              download
              className="inline-block text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              📥 Need an example file? Download sample dataset
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
