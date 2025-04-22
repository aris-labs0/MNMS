"use client"
import type React from "react"
import { useId, useState } from "react"
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
import { api } from "@/trpc/react";

export default function createKeyModal() {
  const { toast } = useToast()
  const id = useId()
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [expire, setExpire] = useState(false)
  const [expirationTime, setExpirationTime] = useState<Date | undefined>(undefined)
  const [deviceUnlimited, setDeviceUnlimited] = useState(false)
  const [maxDevices, setMaxDevices] = useState<number>(1)
  const utils = api.useUtils()

  const resetForm = () => {
    setName("")
    setExpire(false)
    setExpirationTime(undefined)
    setDeviceUnlimited(false)
    setMaxDevices(1)
  }

  const mutation = api.keys.create.useMutation({
    onSettled:()=>{
      utils.keys.getKeys.invalidate()
      setOpen(false)
      setIsLoading(false)
      resetForm()
    },
    onSuccess:()=>{
      toast({
        title: "Key created successfully",
        description: `Key "${name}" has been created.`,
      })
    },
    onError:()=>{
      toast({
        title: "Failed to create key",
        description: "An error occurred while creating the key.",
        variant: "destructive",
      })
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    mutation.mutate({
      name: name,
      expire: expire,
      expiration_time: expirationTime ,
      device_unlimited: deviceUnlimited,
      max_devices: maxDevices
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Create New Key</Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col gap-2">
          <DialogHeader>
            <DialogTitle className="text-left">Create New Key</DialogTitle>
            <DialogDescription className="text-left">
              Create a new access key with custom permissions and limitations.
            </DialogDescription>
          </DialogHeader>
        </div>

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

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Key"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

