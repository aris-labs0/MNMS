"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { api } from "@/trpc/react"

export default function DeviceStatusCard() {
  const { data, isLoading, error } = api.dashboard.getDevicesStats.useQuery()

  const stats = [
    { label: "Online", count: data?.online, color: "bg-primary" },
    { label: "Offline", count: data?.offline, color: "bg-red-500 dark:bg-red-700" },
  ]

  // Calculate percentages for the progress bar
  const calculatePercentage = (count: number) => {
    if (!data?.total || data.total === 0) return 0
    return Math.round((count / (data?.total || 1)) * 100)
  }
  if (isLoading || error) {
    return (
      <Card className="w-[350px]">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="space-y-1">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="text-right mt-4">
            <Skeleton className="h-8 w-12" />
          </div>
        </CardHeader>
        <CardContent>
          {/* Skeleton progress bar */}
          <Skeleton className="w-full h-2 mb-4 rounded-full" />

          {/* Skeleton legend */}
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map((index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-3 h-3 rounded-sm" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-5 w-6" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }
  // Success state
  return (
    <Card className="w-[350px]">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">Device Status</CardTitle>
          <p className="text-xs text-muted-foreground">Total devices connected</p>
        </div>
        <div className="text-right mt-4">
          <div className="text-2xl font-bold">{data?.total || 0}</div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Custom segmented progress bar */}
        <div className="flex w-full h-2 mb-4 overflow-hidden rounded-full bg-muted">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={stat.color}
              style={{ width: `${calculatePercentage(stat.count || 0)}%` }}
            />
          ))}
        </div>

        {/* Legend with device counts */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-sm ${stat.color}`} />
                <span className="text-sm font-medium">{stat.label}</span>
              </div>
              <span className="text-base font-semibold">{stat.count || 0}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
