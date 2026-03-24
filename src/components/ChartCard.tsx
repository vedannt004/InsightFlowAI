import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export default function ChartCard({ title, subtitle, children, className = "" }: ChartCardProps) {
  return (
    <Card className={`rounded-xl transition-all duration-200 hover:shadow-sm ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-foreground">{title}</CardTitle>
        {subtitle && <CardDescription className="text-xs pt-1">{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="w-full">{children}</div>
      </CardContent>
    </Card>
  );
}
