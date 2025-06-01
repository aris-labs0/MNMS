"use client"

import StatusHistoryChart from "@/components/charts/dashboard/status-history-chart"
import DevicesWidget from "@/components/widgets/dashboard/devices-widget"
import PendingWidget from "@/components/widgets/dashboard/pending-adoption-widget"
export default function page(){

    return (
    <div className="p-4 mx-auto space-y-4">
        <div className="flex col-4">
            <DevicesWidget></DevicesWidget>
        </div>
        <StatusHistoryChart></StatusHistoryChart>
    </div>
)
}