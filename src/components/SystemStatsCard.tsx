import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SystemStatsCardProps {
  title: string;
  value: number;
  previousValue?: number;
  icon: React.ReactNode;
  description?: string;
}

export default function SystemStatsCard({ 
  title, 
  value, 
  previousValue, 
  icon, 
  description 
}: SystemStatsCardProps) {
  const getTrend = () => {
    if (previousValue === undefined) return null;
    
    const change = value - previousValue;
    const percentChange = previousValue === 0 ? 0 : (change / previousValue) * 100;
    
    if (change > 0) {
      return {
        icon: <TrendingUp className="h-3 w-3" />,
        color: "text-green-600",
        text: `+${percentChange.toFixed(1)}%`
      };
    } else if (change < 0) {
      return {
        icon: <TrendingDown className="h-3 w-3" />,
        color: "text-red-600",
        text: `${percentChange.toFixed(1)}%`
      };
    } else {
      return {
        icon: <Minus className="h-3 w-3" />,
        color: "text-gray-600",
        text: "0%"
      };
    }
  };

  const trend = getTrend();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${trend.color} mt-1`}>
            {trend.icon}
            <span>{trend.text}</span>
            <span className="text-muted-foreground">from last period</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}