"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cpu, MemoryStick, Thermometer, Clock, Server } from "lucide-react"
import { api } from "@/trpc/react"
import TemperatureChart from "@/components/charts/device/temperature-history-chart"
import VoltageChart from "@/components/charts/device/voltage-history-chart"
import CpuLoadChart from "@/components/charts/device/cpu-history-chart"
import InterfacesTable from "@/components/tables/interfaces-table"
import { useParams } from "next/navigation"

export default function MikroTikDashboard() {
  const deviceId = useParams<{ id: string }>()

  const { data, isLoading, error } = api.devices.getDeviceById.useQuery(deviceId)
  const deviceTelemetry = api.devices.getDeviceTelemetry.useQuery(deviceId)
  const device = data?.devices

  return (
      <div className="p-4 mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl ">{device?.name} - {device?.model}</h1>
          </div>
          <Badge variant={device?.status ? "default" : "destructive"} className="text-sm">
            {device?.status ? "Online" : "Offline"}
          </Badge>
        </div>

        {/* Device Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU Load</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{device?.cpuLoad}%</div>
              <p className="text-xs text-muted-foreground mt-2">
                {device?.cpuCount} cores @ {device?.cpuFrequency}MHz
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voltage</CardTitle>
              <MemoryStick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{device?.voltage}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temperature</CardTitle>
              <Thermometer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{device?.temperature}°C</div>
              <p className="text-xs text-muted-foreground mt-2">Voltage: {device?.voltage}V</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{device?.uptime}</div>
              <p className="text-xs text-muted-foreground mt-2">Version: {device?.version}</p>
            </CardContent>
          </Card>
        </div>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Model</p>
                <p className="text-lg">
                  {device?.model} ({device?.boardName})
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Serial Number</p>
                <p className="text-lg font-mono">{device?.serial}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Architecture</p>
                <p className="text-lg">{device?.cpu}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Storage</p>
                <p className="text-lg">
                 {device?.freeHddSpace } / {device?.totalHddSpace}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Platform</p>
                <p className="text-lg">{device?.platform}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Build Time</p>
                <p className="text-lg">{device?.buildTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <CpuLoadChart 
          data={deviceTelemetry?.data?.cpu_load}    
          isLoading={deviceTelemetry?.isLoading} 
          error={deviceTelemetry?.error} 
        />
        <VoltageChart 
          data={deviceTelemetry?.data?.voltage}    
          isLoading={deviceTelemetry?.isLoading} 
          error={deviceTelemetry?.error}
        />
        <TemperatureChart 
          data={deviceTelemetry?.data?.temperature} 
          isLoading={deviceTelemetry?.isLoading} 
          error={deviceTelemetry?.error} 
        />
        <InterfacesTable 
          interfacesData={data?.device_interfaces?.interfaces}
          isLoading={isLoading}
          error={error}
        />
      </div>
  )
}
