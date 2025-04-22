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
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { api } from "@/trpc/react"

interface DeleteKeyAlertProps {
  id: string,
  onCloseDropdown: () => void
}

export default function DeleteKeyAlert({ id,onCloseDropdown }: DeleteKeyAlertProps) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [Open, setOpen] = useState<boolean>(false)
  const utils = api.useUtils()
  const { mutate } = api.keys.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Key deleted successfully",
      })

    },
    onError: () => {
      toast({
        title: "Key delete error",
        variant: "destructive",
      })
    },
    onSettled: () => {
      utils.keys.getKeys.invalidate()
      setOpen(false)
      setIsDeleting(false)
    },
  })

  const handleDelete = async () => {
    onCloseDropdown()
    setIsDeleting(true)
    mutate({ id: id })
  }

  return (
    <AlertDialog open={Open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            setOpen(true)
            
          }}
          className="text-destructive focus:bg-destructive "
        >
          Delete
        </DropdownMenuItem>
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
