"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { RefreshCw, ArrowRight } from "lucide-react"
import { api } from "@/trpc/react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export default function PendingAssignmentCard() {
  const router = useRouter()
  const { data, isLoading, error, refetch, isRefetching } = api.dashboard.getPendingAdoptionDevices.useQuery()

  // Loading state
  if (isLoading || error) {
    return (
      <Card className="w-[350px]">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-44" />
          </div>
          <div className="flex items-center justify-center">
            <Skeleton className="h-8 w-10 rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="pt-4 border-t border-border/50 mt-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-3 rounded-sm" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }



  // Extract the pending count from the API response
  const pendingCount = data?.pendingAdoption ?? 0
  const hasHighCount = pendingCount > 10
  const isZeroState = pendingCount === 0

  // Success state
  return (
    <Card className="w-[350px]">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">Pending Adoptions</CardTitle>
          <p className="text-xs text-muted-foreground">
            {isZeroState ? "All devices assigned" : "Devices awaiting assignment"}
          </p>
        </div>
        <div className="text-right mt-4">
          <div
            className={cn(
              "text-2xl font-bold",
              isZeroState
                ? "text-green-600 dark:text-green-400"
                : hasHighCount
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-yellow-600 dark:text-yellow-400",
            )}
          >
            {pendingCount}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Action hint */}
        <div
          className="flex items-center justify-between pt-4 border-t border-border/50 mt-4 hover:cursor-pointer"
          onClick={() => {
            router.push("/discovery")
          }}
        >
          <span className="text-xs text-muted-foreground">Manage Adoptions</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground " />
        </div>
      </CardContent>
    </Card>
  )
}
