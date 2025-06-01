"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type Row,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table"
import {
  ChevronDownIcon,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CircleAlertIcon,
  CircleXIcon,
  Columns3Icon,
  FilterIcon,
  ListFilterIcon,
  PlusIcon,
  TrashIcon,
  ThermometerIcon,
  ZapIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type {selectDevices} from "@mnms/db/types"
import { api } from "@/trpc/react"

type Device = selectDevices

// Custom filter function for multi-column searching
const multiColumnFilterFn: FilterFn<Device> = (row, columnId, filterValue) => {
  const searchableRowContent = `${row.original.name} ${row.original.serial} ${row.original.model}`.toLowerCase()
  const searchTerm = (filterValue ?? "").toLowerCase()
  return searchableRowContent.includes(searchTerm)
}

const statusFilterFn: FilterFn<Device> = (row, columnId, filterValue: string[]) => {
  if (!filterValue?.length) return true
  const status = row.getValue(columnId) as boolean
  const statusString = status ? "Online" : "Offline"
  return filterValue.includes(statusString)
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

const getMemoryUsagePercentage = (freeMemory: number, totalMemory: number) => {
  const usedMemory = totalMemory - freeMemory
  return Math.round((usedMemory / totalMemory) * 100)
}

const getStorageUsagePercentage = (freeStorage: number, totalStorage: number) => {
  const usedStorage = totalStorage - freeStorage
  return Math.round((usedStorage / totalStorage) * 100)
}

const formatFrequency = (frequency: number) => {
  if (frequency >= 1000) {
    return `${(frequency / 1000).toFixed(1)} GHz`
  }
  return `${frequency} MHz`
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const columns: ColumnDef<Device>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 28,
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: "Device Name",
    accessorKey: "name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    size: 200,
    filterFn: multiColumnFilterFn,
    enableHiding: false,
  },
  {
    header: "Serial",
    accessorKey: "serial",
    cell: ({ row }) => <div className="font-mono text-sm">{row.getValue("serial")}</div>,
    size: 140,
  },
  {
    header: "Model",
    accessorKey: "model",
    size: 150,
  },
  {
    header: "Platform",
    accessorKey: "platform",
    size: 100,
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.getValue("status") as boolean
      return (
        <Badge
          variant={status ? "default" : "secondary"}
          className={cn(!status && "bg-muted-foreground/60 text-primary-foreground")}
        >
          {status ? "Online" : "Offline"}
        </Badge>
      )
    },
    size: 100,
    filterFn: statusFilterFn,
  },
  {
    header: "CPU Load",
    accessorKey: "cpuLoad",
    cell: ({ row }) => {
      const cpuLoad = row.getValue("cpuLoad") as number
      return (
        <div className="flex items-center gap-2">
          <div className="w-12 bg-muted rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all",
                cpuLoad > 80 ? "bg-red-500" : cpuLoad > 60 ? "bg-yellow-500" : "bg-green-500",
              )}
              style={{ width: `${Math.min(cpuLoad, 100)}%` }}
            />
          </div>
          <span className="text-sm">{cpuLoad}%</span>
        </div>
      )
    },
    size: 120,
  },
  {
    header: "Memory Usage",
    accessorKey: "freeMemory",
    cell: ({ row }) => {
      const freeMemory = row.getValue("freeMemory") as number
      const totalMemory = row.original.totalMemory
      const usagePercentage = getMemoryUsagePercentage(freeMemory, totalMemory ?? 0)

      return (
        <div className="flex items-center gap-2">
          <div className="w-12 bg-muted rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all",
                usagePercentage > 80 ? "bg-red-500" : usagePercentage > 60 ? "bg-yellow-500" : "bg-green-500",
              )}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
          <span className="text-sm">{usagePercentage}%</span>
        </div>
      )
    },
    size: 140,
  },
  {
    header: "Uptime",
    accessorKey: "uptime",
    size: 120,
  },
  {
    header: "Version",
    accessorKey: "version",
    cell: ({ row }) => <div className="text-sm">{row.getValue("version")}</div>,
    size: 140,
  },
  // Additional columns that can be shown/hidden
  {
    header: "Voltage",
    accessorKey: "voltage",
    cell: ({ row }) => {
      const voltage = row.getValue("voltage") as string | null
      return voltage ? (
        <div className="flex items-center gap-1">
          <ZapIcon size={14} className="text-yellow-500" />
          <span className="text-sm">{voltage}V</span>
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">N/A</span>
      )
    },
    size: 100,
  },
  {
    header: "Temperature",
    accessorKey: "temperature",
    cell: ({ row }) => {
      const temperature = row.getValue("temperature") as string | null
      return temperature ? (
        <div className="flex items-center gap-1">
          <ThermometerIcon size={14} className="text-red-500" />
          <span className="text-sm">{temperature}°C</span>
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">N/A</span>
      )
    },
    size: 120,
  },
  {
    header: "Architecture",
    accessorKey: "architectureName",
    size: 120,
  },
  {
    header: "Board Name",
    accessorKey: "boardName",
    size: 150,
  },
  {
    header: "Build Time",
    accessorKey: "buildTime",
    cell: ({ row }) => <div className="text-sm">{row.getValue("buildTime")}</div>,
    size: 160,
  },
  {
    header: "CPU",
    accessorKey: "cpu",
    size: 150,
  },
  {
    header: "CPU Count",
    accessorKey: "cpuCount",
    cell: ({ row }) => <div className="text-center">{row.getValue("cpuCount")}</div>,
    size: 100,
  },
  {
    header: "CPU Frequency",
    accessorKey: "cpuFrequency",
    cell: ({ row }) => {
      const frequency = row.getValue("cpuFrequency") as number
      return <div className="text-sm">{formatFrequency(frequency)}</div>
    },
    size: 120,
  },
  {
    header: "Free Memory",
    accessorKey: "freeMemory",
    id: "freeMemoryBytes",
    cell: ({ row }) => {
      const freeMemory = row.getValue("freeMemory") as number
      return <div className="text-sm">{formatBytes(freeMemory)}</div>
    },
    size: 120,
  },
  {
    header: "Total Memory",
    accessorKey: "totalMemory",
    cell: ({ row }) => {
      const totalMemory = row.getValue("totalMemory") as number
      return <div className="text-sm">{formatBytes(totalMemory)}</div>
    },
    size: 120,
  },
  {
    header: "Total Storage",
    accessorKey: "totalHddSpace",
    cell: ({ row }) => {
      const totalStorage = row.getValue("totalHddSpace") as number
      return <div className="text-sm">{formatBytes(totalStorage)}</div>
    },
    size: 120,
  },
  {
    header: "Write Sectors (Reboot)",
    accessorKey: "writeSectSinceReboot",
    cell: ({ row }) => {
      const sectors = row.getValue("writeSectSinceReboot") as number
      return <div className="text-sm">{sectors.toLocaleString()}</div>
    },
    size: 160,
  },
  {
    header: "Write Sectors (Total)",
    accessorKey: "writeSectTotal",
    cell: ({ row }) => {
      const sectors = row.getValue("writeSectTotal") as number
      return <div className="text-sm">{sectors.toLocaleString()}</div>
    },
    size: 150,
  },
  {
    header: "Current Firmware",
    accessorKey: "currentFirmware",
    size: 140,
  },
  {
    header: "Factory Firmware",
    accessorKey: "factoryFirmware",
    size: 140,
  },
  {
    header: "Firmware Type",
    accessorKey: "firmwareType",
    size: 120,
  },
  {
    header: "RouterBoard",
    accessorKey: "routerboard",
    cell: ({ row }) => {
      const isRouterBoard = row.getValue("routerboard") as boolean
      return <Badge variant={isRouterBoard ? "default" : "secondary"}>{isRouterBoard ? "Yes" : "No"}</Badge>
    },
    size: 100,
  },

  {
    header: "Last Updated",
    accessorKey: "updatedAt",
    cell: ({ row }) => {
      const updatedAt = row.getValue("updatedAt") as string
      return <div className="text-sm">{formatDate(updatedAt)}</div>
    },
    size: 140,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <RowActions row={row} />,
    size: 60,
    enableHiding: false,
  },
]

export default function DeviceTable() {
  const id = useId()
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    architectureName: false,
    boardName: false,
    buildTime: false,
    cpu: false,
    cpuCount: false,
    cpuFrequency: false,
    freeMemoryBytes: false,
    totalMemory: false,
    storageUsage: false,
    freeStorageBytes: false,
    totalHddSpace: false,
    writeSectSinceReboot: false,
    writeSectTotal: false,
    currentFirmware: false,
    factoryFirmware: false,
    firmwareType: false,
    routerboard: false,
    updatedAt: false,
  })
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const inputRef = useRef<HTMLInputElement>(null)

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "name",
      desc: false,
    },
  ])

  const { data, isLoading, error } = api.devices.getAllDevices.useQuery()
  const [devices, setDevices] = useState<Device[]>([])
  console.log(data)
  useEffect(() => {
    if (data) {
      setDevices(data)
    }
  }, [data])

  const handleDeleteRows = () => {
    const selectedRows = table.getSelectedRowModel().rows
    const updatedData = devices.filter((device) => !selectedRows.some((row) => row.original.id === device.id))
    setDevices(updatedData)
    table.resetRowSelection()
  }

  const table = useReactTable({
    data: devices,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
  })

  // Get unique status values
  const uniqueStatusValues = useMemo(() => {
    return ["Online", "Offline"]
  }, [])

  // Get counts for each status
  const statusCounts = useMemo(() => {
    const counts = new Map()
    const onlineCount = devices.filter((device) => device.status).length
    const offlineCount = devices.filter((device) => !device.status).length
    counts.set("Online", onlineCount)
    counts.set("Offline", offlineCount)
    return counts
  }, [devices])

  const selectedStatuses = useMemo(() => {
    const filterValue = table.getColumn("status")?.getFilterValue() as string[]
    return filterValue ?? []
  }, [table.getColumn("status")?.getFilterValue()])

  const handleStatusChange = (checked: boolean, value: string) => {
    const filterValue = table.getColumn("status")?.getFilterValue() as string[]
    const newFilterValue = filterValue ? [...filterValue] : []

    if (checked) {
      newFilterValue.push(value)
    } else {
      const index = newFilterValue.indexOf(value)
      if (index > -1) {
        newFilterValue.splice(index, 1)
      }
    }

    table.getColumn("status")?.setFilterValue(newFilterValue.length ? newFilterValue : undefined)
  }

  const handleShowAllColumns = () => {
    const allColumns = table.getAllColumns().filter((column) => column.getCanHide())
    const newVisibility: VisibilityState = {}
    allColumns.forEach((column) => {
      newVisibility[column.id] = true
    })
    setColumnVisibility(newVisibility)
  }

  const handleHideAllColumns = () => {
    const allColumns = table.getAllColumns().filter((column) => column.getCanHide())
    const newVisibility: VisibilityState = {}
    allColumns.forEach((column) => {
      newVisibility[column.id] = false
    })
    setColumnVisibility(newVisibility)
  }

  const handleResetColumns = () => {
    setColumnVisibility({
      voltage: false,
      temperature: false,
      architectureName: false,
      boardName: false,
      buildTime: false,
      cpu: false,
      cpuCount: false,
      cpuFrequency: false,
      freeMemoryBytes: false,
      totalMemory: false,
      storageUsage: false,
      freeStorageBytes: false,
      totalHddSpace: false,
      writeSectSinceReboot: false,
      writeSectTotal: false,
      currentFirmware: false,
      factoryFirmware: false,
      firmwareType: false,
      routerboard: false,
      updatedAt: false,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading devices...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Error loading devices: {error.message}</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Filter by name, serial, or model */}
          <div className="relative">
            <Input
              id={`${id}-input`}
              ref={inputRef}
              className={cn("peer min-w-60 ps-9", Boolean(table.getColumn("name")?.getFilterValue()) && "pe-9")}
              value={(table.getColumn("name")?.getFilterValue() ?? "") as string}
              onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
              placeholder="Filter by name, serial, or model..."
              type="text"
              aria-label="Filter by name, serial, or model"
            />
            <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
              <ListFilterIcon size={16} aria-hidden="true" />
            </div>
            {Boolean(table.getColumn("name")?.getFilterValue()) && (
              <button
                className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Clear filter"
                onClick={() => {
                  table.getColumn("name")?.setFilterValue("")
                  if (inputRef.current) {
                    inputRef.current.focus()
                  }
                }}
              >
                <CircleXIcon size={16} aria-hidden="true" />
              </button>
            )}
          </div>
          {/* Filter by status */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <FilterIcon className="-ms-1 opacity-60" size={16} aria-hidden="true" />
                Status
                {selectedStatuses.length > 0 && (
                  <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                    {selectedStatuses.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto min-w-36 p-3" align="start">
              <div className="space-y-3">
                <div className="text-muted-foreground text-xs font-medium">Filters</div>
                <div className="space-y-3">
                  {uniqueStatusValues.map((value, i) => (
                    <div key={value} className="flex items-center gap-2">
                      <Checkbox
                        id={`${id}-${i}`}
                        checked={selectedStatuses.includes(value)}
                        onCheckedChange={(checked: boolean) => handleStatusChange(checked, value)}
                      />
                      <Label htmlFor={`${id}-${i}`} className="flex grow justify-between gap-2 font-normal">
                        {value} <span className="text-muted-foreground ms-2 text-xs">{statusCounts.get(value)}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {/* Toggle columns visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Columns3Icon className="-ms-1 opacity-60" size={16} aria-hidden="true" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleShowAllColumns}>Show all columns</DropdownMenuItem>
                <DropdownMenuItem onClick={handleHideAllColumns}>Hide all columns</DropdownMenuItem>
                <DropdownMenuItem onClick={handleResetColumns}>Reset to default</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <div className="max-h-64 overflow-y-auto">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    const columnName = column.id
                    const displayName = columnName
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())
                      .replace(/Id$/, "ID")

                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                        onSelect={(event) => event.preventDefault()}
                      >
                        {displayName}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-3">
          {/* Delete button */}
          {table.getSelectedRowModel().rows.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="ml-auto" variant="outline">
                  <TrashIcon className="-ms-1 opacity-60" size={16} aria-hidden="true" />
                  Delete
                  <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                    {table.getSelectedRowModel().rows.length}
                  </span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-full border"
                    aria-hidden="true"
                  >
                    <CircleAlertIcon className="opacity-80" size={16} />
                  </div>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete{" "}
                      {table.getSelectedRowModel().rows.length} selected{" "}
                      {table.getSelectedRowModel().rows.length === 1 ? "device" : "devices"}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteRows}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {/* Add device button */}
          <Button className="ml-auto" variant="outline">
            <PlusIcon className="-ms-1 opacity-60" size={16} aria-hidden="true" />
            Add device
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-background overflow-hidden rounded-md border">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} style={{ width: `${header.getSize()}px` }} className="h-11">
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div
                          className={cn(
                            header.column.getCanSort() &&
                              "flex h-full cursor-pointer items-center justify-between gap-2 select-none",
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={(e) => {
                            // Enhanced keyboard handling for sorting
                            if (header.column.getCanSort() && (e.key === "Enter" || e.key === " ")) {
                              e.preventDefault()
                              header.column.getToggleSortingHandler()?.(e)
                            }
                          }}
                          tabIndex={header.column.getCanSort() ? 0 : undefined}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <ChevronUpIcon className="shrink-0 opacity-60" size={16} aria-hidden="true" />,
                            desc: <ChevronDownIcon className="shrink-0 opacity-60" size={16} aria-hidden="true" />,
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="last:py-0">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No devices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-8">
        {/* Results per page */}
        <div className="flex items-center gap-3">
          <Label htmlFor={id} className="max-sm:sr-only">
            Rows per page
          </Label>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger id={id} className="w-fit whitespace-nowrap">
              <SelectValue placeholder="Select number of results" />
            </SelectTrigger>
            <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
              {[5, 10, 25, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Page number information */}
        <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
          <p className="text-muted-foreground text-sm whitespace-nowrap" aria-live="polite">
            <span className="text-foreground">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
              {Math.min(
                Math.max(
                  table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
                    table.getState().pagination.pageSize,
                  0,
                ),
                table.getRowCount(),
              )}
            </span>{" "}
            of <span className="text-foreground">{table.getRowCount().toString()}</span>
          </p>
        </div>

        {/* Pagination buttons */}
        <div>
          <Pagination>
            <PaginationContent>
              {/* First page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.firstPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to first page"
                >
                  <ChevronFirstIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
              {/* Previous page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to previous page"
                >
                  <ChevronLeftIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
              {/* Next page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to next page"
                >
                  <ChevronRightIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
              {/* Last page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.lastPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to last page"
                >
                  <ChevronLastIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

    </div>
  )
}

function RowActions({ row }: { row: Row<Device> }) {
  return (<div></div>)
  
}
