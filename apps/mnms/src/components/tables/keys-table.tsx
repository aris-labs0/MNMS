"use client"

import { useId, useMemo, useRef, useState } from "react"
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
  CircleXIcon,
  Columns3Icon,
  EllipsisIcon,
  InfinityIcon,
  ListFilterIcon,
  TimerIcon,
  TimerOffIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { api } from "@/trpc/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import CreateKeyModal from "../modals/keys/create-key-modal"
import DeleteKeyModal from "../modals/keys/delete-key-modal"
import UpdateKeyModal from "../modals/keys/update-key-modal"
import DeleteManyModal from "../modals/keys/delete-many-keys-modal"
import Spinner from "@/components/ui/spinner"
import ViewTokenModal from "../modals/keys/view-key-modal"

type Key = {
  id: string
  name: string
  max_devices: number | null
  expiration_time: Date | null
}

// Custom filter function for searching by name
const nameFilterFn: FilterFn<Key> = (row, columnId, filterValue) => {
  const name = row.getValue(columnId) as string
  const searchTerm = (filterValue ?? "").toLowerCase()
  return name.toLowerCase().includes(searchTerm)
}

// Filter function for expiration status - adaptado al nuevo modelo
const expirationFilterFn: FilterFn<Key> = (row, columnId, filterValue: string[]) => {
  if (!filterValue?.length) return true

  const expirationTime = row.original.expiration_time
  const now = new Date()

  if (!expirationTime) {
    return filterValue.includes("No Expiration")
  }

  const expirationDate = new Date(expirationTime)
  const isExpired = now > expirationDate

  if (isExpired) {
    return filterValue.includes("Expired")
  }

  return filterValue.includes("Active")
}

// Filter function for device limit status - adaptado al nuevo modelo
const deviceLimitFilterFn: FilterFn<Key> = (row, columnId, filterValue: string[]) => {
  if (!filterValue?.length) return true
  const isUnlimited = row.original.max_devices === null
  return filterValue.includes(isUnlimited ? "Unlimited" : "Limited")
}

const columns: ColumnDef<Key>[] = [
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
    header: "Name",
    accessorKey: "name",
    cell: ({ row }) => <div className="flex items-center gap-2 font-medium">{row.getValue("name")}</div>,
    size: 220,
    filterFn: nameFilterFn,
    enableHiding: false,
  },
  {
    header: "Device Limit",
    accessorKey: "device limit",
    cell: ({ row }) => {
      const isUnlimited = row.original.max_devices === null
      return (
        <div className="flex items-center gap-2">
          {isUnlimited ? (
            <>
              <InfinityIcon size={16} className="text-muted-foreground" />
            </>
          ) : (
            <>
              <span className="text-muted-foreground">{row.original.max_devices}</span>
            </>
          )}
        </div>
      )
    },
    size: 150,
    filterFn: deviceLimitFilterFn,
  },
  {
    header: "Expiration",
    accessorKey: "expiration",
    cell: ({ row }) => {
      const expirationTime = row.original.expiration_time
      const now = new Date()

      if (!expirationTime) {
        return (
          <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
            <TimerOffIcon size={14} className="mr-1" />
            No Expiration
          </Badge>
        )
      }

      const expirationDate = new Date(expirationTime)
      const isExpired = now > expirationDate

      if (isExpired) {
        return (
          <Badge variant="destructive">
            <CircleXIcon size={14} className="mr-1" />
            Expired
          </Badge>
        )
      }

      return (
        <Badge>
          <TimerIcon size={14} className="mr-1" />
          {expirationDate.toLocaleDateString()}
        </Badge>
      )
    },
    size: 180,
    filterFn: expirationFilterFn,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end items-center gap-2 w-full">
        <ViewTokenModal token={row.id} />
        <RowActions row={row} />
      </div>
    ),
    size: 60,
    enableHiding: false,
  },
]

export default function Component() {
  const id = useId()

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
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

  const { data, isLoading, error } = api.keys.getKeys.useQuery()

  const table = useReactTable({
    data: data || [],
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
    getRowId: (row) => row.id,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
  })

  // Get unique expiration values
  const uniqueExpirationValues = useMemo(() => {
    return ["Active", "Expired", "No Expiration"]
  }, [])

  // Get unique device limit values
  const uniqueDeviceLimitValues = useMemo(() => {
    return ["Unlimited", "Limited"]
  }, [])

  // Get selected expiration filters
  const selectedExpirationFilters = useMemo(() => {
    const filterValue = table.getColumn("expiration")?.getFilterValue() as string[]
    return filterValue ?? []
  }, [table.getColumn("expiration")?.getFilterValue()])

  // Get selected device limit filters
  const selectedDeviceLimitFilters = useMemo(() => {
    const filterValue = table.getColumn("device limit")?.getFilterValue() as string[]
    return filterValue ?? []
  }, [table.getColumn("device limit")?.getFilterValue()])

  const handleExpirationFilterChange = (checked: boolean, value: string) => {
    const filterValue = table.getColumn("expiration")?.getFilterValue() as string[]
    const newFilterValue = filterValue ? [...filterValue] : []

    if (checked) {
      newFilterValue.push(value)
    } else {
      const index = newFilterValue.indexOf(value)
      if (index > -1) {
        newFilterValue.splice(index, 1)
      }
    }

    table.getColumn("expiration")?.setFilterValue(newFilterValue.length ? newFilterValue : undefined)
  }

  const handleDeviceLimitFilterChange = (checked: boolean, value: string) => {
    const filterValue = table.getColumn("device limit")?.getFilterValue() as string[]
    const newFilterValue = filterValue ? [...filterValue] : []

    if (checked) {
      newFilterValue.push(value)
    } else {
      const index = newFilterValue.indexOf(value)
      if (index > -1) {
        newFilterValue.splice(index, 1)
      }
    }

    table.getColumn("device limit")?.setFilterValue(newFilterValue.length ? newFilterValue : undefined)
  }

  if (isLoading) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return <div className="flex justify-center p-8 text-destructive">Error </div>
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Filter by name */}
          <div className="relative">
            <Input
              id={`${id}-input`}
              ref={inputRef}
              className={cn("peer min-w-60 ps-9", Boolean(table.getColumn("name")?.getFilterValue()) && "pe-9")}
              value={(table.getColumn("name")?.getFilterValue() ?? "") as string}
              onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
              placeholder="Filter by key name..."
              type="text"
              aria-label="Filter by key name"
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
          {/* Filter by expiration */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <TimerIcon className="-ms-1 opacity-60" size={16} aria-hidden="true" />
                Expiration
                {selectedExpirationFilters.length > 0 && (
                  <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                    {selectedExpirationFilters.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto min-w-36 p-3" align="start">
              <div className="space-y-3">
                <div className="text-muted-foreground text-xs font-medium">Expiration Filters</div>
                <div className="space-y-3">
                  {uniqueExpirationValues.map((value, i) => (
                    <div key={value} className="flex items-center gap-2">
                      <Checkbox
                        id={`${id}-expiration-${i}`}
                        checked={selectedExpirationFilters.includes(value)}
                        onCheckedChange={(checked: boolean) => handleExpirationFilterChange(checked, value)}
                      />
                      <Label htmlFor={`${id}-expiration-${i}`} className="flex grow justify-between gap-2 font-normal">
                        {value}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {/* Filter by device limit */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <InfinityIcon className="-ms-1 opacity-60" size={16} aria-hidden="true" />
                Device Limit
                {selectedDeviceLimitFilters.length > 0 && (
                  <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                    {selectedDeviceLimitFilters.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto min-w-36 p-3" align="start">
              <div className="space-y-3">
                <div className="text-muted-foreground text-xs font-medium">Device Limit Filters</div>
                <div className="space-y-3">
                  {uniqueDeviceLimitValues.map((value, i) => (
                    <div key={value} className="flex items-center gap-2">
                      <Checkbox
                        id={`${id}-device-limit-${i}`}
                        checked={selectedDeviceLimitFilters.includes(value)}
                        onCheckedChange={(checked: boolean) => handleDeviceLimitFilterChange(checked, value)}
                      />
                      <Label
                        htmlFor={`${id}-device-limit-${i}`}
                        className="flex grow justify-between gap-2 font-normal"
                      >
                        {value}
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
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      onSelect={(event) => event.preventDefault()}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-3">
          {/* Delete button */}
          {table.getSelectedRowModel().rows.length > 0 && <DeleteManyModal rows={table.getSelectedRowModel().rows} />}
          {/* Add key button */}
          <CreateKeyModal />
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
                  No keys found.
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

function RowActions({ row }: { row: Row<Key> }) {
  const [openDropdownMenu, setOpenDropdownMenu] = useState(false)

  return (
    <DropdownMenu open={openDropdownMenu} onOpenChange={setOpenDropdownMenu}>
      <DropdownMenuTrigger asChild>
        <div className="flex justify-end">
          <Button size="icon" variant="ghost" className="shadow-none" aria-label="Edit key">
            <EllipsisIcon size={16} aria-hidden="true" />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <UpdateKeyModal
            id={row.id}
            onCloseDropdown={() => {
              setOpenDropdownMenu(false)
            }}
          />
          <DeleteKeyModal
            id={row.id}
            onCloseDropdown={() => {
              setOpenDropdownMenu(false)
            }}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
