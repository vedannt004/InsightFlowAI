export default function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-slate-700" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-violet-500 animate-spin" />
      </div>
      <p className="mt-4 text-sm text-slate-400 animate-pulse">{text}</p>
    </div>
  );
}
