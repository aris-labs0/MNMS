"use client"

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
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/trpc/react"
import type{ Row,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"

import {TrashIcon,
} from "lucide-react"
type Key = {
    id: string
    name: string
    max_devices: number | null
    expiration_time: Date | null
  }

  interface DeleteKeyAlertProps {
    rows: Row<Key>[],
  }
export default function DeleteKeyAlert({ rows }: DeleteKeyAlertProps) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [Open, setOpen] = useState<boolean>(false)
  const utils = api.useUtils()
  const { mutate } = api.keys.deleteMany.useMutation({
    onSuccess: () => {
      toast({
        title: "Keys deleted successfully",
      })
      utils.keys.getKeys.invalidate()
    },
    onError: () => {
      toast({
        title: "Keys delete error",
        variant: "destructive",
      })
    },
    onSettled: () => {
      setOpen(false)
      setIsDeleting(false)
    },
  })

  const handleDelete = async () => {
    setIsDeleting(true)
    mutate({ ids:  rows.map(row => row.id) })
  }

  return (
    <AlertDialog open={Open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
      <Button className="ml-auto" variant="destructive">
            <TrashIcon className="-ms-1 opacity-60" size={16} aria-hidden="true" />
                  Delete
            <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
            {rows.length}
        
            </span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this key?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the key
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}












