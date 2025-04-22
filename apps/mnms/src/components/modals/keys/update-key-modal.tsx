"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { DatePicker } from "@/components/ui/date-picker"
import { api } from "@/trpc/react"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

interface UpdateKeyDialogProps {
  id: string,
  onCloseDropdown: () => void
}

export default function UpdateKeyDialog({ id,onCloseDropdown }: UpdateKeyDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Form state - initialize with default values
  const [name, setName] = useState("")
  const [expire, setExpire] = useState(false)
  const [expirationTime, setExpirationTime] = useState<Date | undefined>(undefined)
  const [deviceUnlimited, setDeviceUnlimited] = useState(false)
  const [maxDevices, setMaxDevices] = useState(1)

  // Get the query client
  const utils = api.useUtils()

  // Define the fetch function
  const fetchKeyData = async () => {
    if (!open || !id) return

    setIsLoading(true)
    try {
      const data = await utils.keys.getById.fetch({ id })
      if (data) {
        setName(data.name || "")
        setExpire(data.expire || false)
        setExpirationTime(data.expiration_time || undefined)
        setDeviceUnlimited(data.device_unlimited || false)
        setMaxDevices(data.max_devices || 1)
      }
    } catch (error) {
      console.error("Error fetching key data:", error)
      toast({
        title: "Error",
        description: "Failed to load key data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch data when dialog opens
  useEffect(() => {
    if (open) {
      fetchKeyData()
    }
  }, [open, id])

  const { mutate } = api.keys.update.useMutation({
    onSettled: () => {
      setIsSubmitting(false)
      setOpen(false)
      // Invalidate the query to refresh the data
      utils.keys.getKeys.invalidate()
    },
    onSuccess: () => {
      toast({
        title: "Key updated successfully",
        description: `Key "${name}" has been updated.`,
      })
    },
    onError: () => {
      toast({
        title: "Failed to update key",
        description: "An error occurred while updating the key.",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    onCloseDropdown()
    setIsSubmitting(true)
    mutate({
      id,
      name,
      expire,
      expiration_time: expirationTime,
      device_unlimited: deviceUnlimited,
      max_devices: maxDevices,
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    // Reset form if closing
    if (!newOpen) {
      setName("")
      setExpire(false)
      setExpirationTime(undefined)
      setDeviceUnlimited(false)
      setMaxDevices(1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
      <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            setOpen(true)
          }}
        >
          Edit
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col gap-2">
          <DialogHeader>
            <DialogTitle className="text-left">Update Key</DialogTitle>
            <DialogDescription className="text-left">
              Modify this access key's permissions and limitations.
            </DialogDescription>
          </DialogHeader>
        </div>

        {isLoading ? (
          <div className="space-y-5">
            <div className="space-y-4">
              {/* Key Name Skeleton */}
              <div className="*:not-first:mt-2">
                <div className="h-5 w-20 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
              </div>

              {/* Key Expiration Skeleton */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="h-5 w-28 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-48 bg-muted rounded animate-pulse mt-1"></div>
                </div>
                <div className="h-6 w-12 bg-muted rounded-full animate-pulse"></div>
              </div>

              {/* Unlimited Devices Skeleton */}
              <div className="flex items-center justify-between mt-4">
                <div className="space-y-0.5">
                  <div className="h-5 w-32 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-56 bg-muted rounded animate-pulse mt-1"></div>
                </div>
                <div className="h-6 w-12 bg-muted rounded-full animate-pulse"></div>
              </div>

              {/* Max Devices Skeleton */}
              <div className="*:not-first:mt-2 mt-4">
                <div className="h-5 w-32 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
              </div>
            </div>

            {/* Button Skeleton */}
            <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="*:not-first:mt-2">
                <Label htmlFor={`name-${id}`}>Key Name</Label>
                <Input id={`name-${id}`} type="text" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor={`expire-${id}`}>Key Expiration</Label>
                  <p className="text-sm text-muted-foreground">Set if the key should expire</p>
                </div>
                <Switch id={`expire-${id}`} checked={expire} onCheckedChange={setExpire} />
              </div>

              {expire && (
                <div className="mt-2">
                  <Label htmlFor={`expiration-time-${id}`}>Expiration Date</Label>
                  <DatePicker date={expirationTime} setDate={setExpirationTime} className="w-full" />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor={`device-unlimited-${id}`}>Unlimited Devices</Label>
                  <p className="text-sm text-muted-foreground">Allow unlimited device connections</p>
                </div>
                <Switch id={`device-unlimited-${id}`} checked={deviceUnlimited} onCheckedChange={setDeviceUnlimited} />
              </div>

              {!deviceUnlimited && (
                <div className="*:not-first:mt-2">
                  <Label htmlFor={`max-devices-${id}`}>Maximum Devices</Label>
                  <Input
                    id={`max-devices-${id}`}
                    type="number"
                    min="1"
                    value={maxDevices}
                    onChange={(e) => setMaxDevices(Number.parseInt(e.target.value))}
                    required
                  />
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Key"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
