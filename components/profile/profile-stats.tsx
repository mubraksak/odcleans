import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ProfileStatsProps {
  stats: Array<{
    label: string
    value: string | number
    description?: string
    trend?: "up" | "down" | "neutral"
  }>
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.trend && (
                <div className={`text-sm ${
                  stat.trend === "up" ? "text-green-600" :
                  stat.trend === "down" ? "text-red-600" :
                  "text-gray-600"
                }`}>
                  {stat.trend === "up" ? "↗" : stat.trend === "down" ? "↘" : "→"}
                </div>
              )}
            </div>
            {stat.description && (
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}