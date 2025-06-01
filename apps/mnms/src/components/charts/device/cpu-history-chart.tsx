"use client"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

import { api } from "@/trpc/react"

const chartConfig = {
  value: {
    label: "CPU Load",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

const formatTime = (value: string | number) => {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

type params = {
  data :{ time: string; value: number }[] | undefined,
  isLoading:boolean,
  error:any
}

export default function Component({ data, isLoading, error }:params) {


  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>CPU Load</CardTitle>
        </div>
        <div className="w-[160px] rounded-lg sm:ml-auto"></div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading || error ? (
          <div className="flex h-[250px] w-full flex-col items-center justify-center gap-4">
            <div className="flex w-full flex-col gap-2">
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <div className="flex justify-center gap-2 pt-2">
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
            </div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <AreaChart data={data} margin={{ right: 12 }}>
              <defs>
                <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} />

              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={formatTime}
              />

              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value}%`}
                orientation="right"
              />

              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent labelFormatter={formatTime} indicator="dot" />}
              />

              <Area
                dataKey="value"
                type="natural"
                fillOpacity={0.4}
                fill="url(#fillValue)"
                stroke="var(--color-value)"
              />

              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
