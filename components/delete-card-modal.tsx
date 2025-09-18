"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface DeleteCardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirmDelete: () => void
}

export function DeleteCardModal({ open, onOpenChange, onConfirmDelete }: DeleteCardModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Delete Card
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-700">Are you sure you want to delete this card?</p>

          <p className="text-sm text-gray-600">This action cannot be undone.</p>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirmDelete}>
              Delete Card
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
