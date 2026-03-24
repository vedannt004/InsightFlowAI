import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: string;
  change?: number;
  subtitle?: string;
}

export default function KPICard({ title, value, icon, change, subtitle }: KPICardProps) {
  return (
    <Card className="rounded-xl transition-all duration-200 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-lg">
            {icon}
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
          <div className="flex flex-col gap-1 mt-2">
            {change !== undefined && (
              <div className="flex items-center">
                <Badge variant={change >= 0 ? "default" : "destructive"} className={`rounded-sm mr-2 px-1 py-0 ${change >= 0 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25" : ""}`}>
                  {change >= 0 ? "↑" : "↓"} {Math.abs(change)}%
                </Badge>
              </div>
            )}
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
