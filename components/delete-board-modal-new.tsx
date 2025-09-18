"use client"

import { BaseModal, StandardFooter } from "@/components/ui/base-modal"

interface DeleteBoardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  boardTitle: string
  onConfirmDelete: () => void
}

export function DeleteBoardModal({ open, onOpenChange, boardTitle, onConfirmDelete }: DeleteBoardModalProps) {
  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Board"
      size="sm"
      type="destructive"
      footer={
        <StandardFooter
          onCancel={() => onOpenChange(false)}
          onConfirm={onConfirmDelete}
          cancelText="Cancel"
          confirmText="Delete Board"
          confirmVariant="destructive"
        />
      }
    >
      <p className="text-foreground">
        Are you sure you want to delete{" "}
        <span className="font-medium bg-muted px-2 py-1 rounded">{boardTitle}</span>?
      </p>

      <p className="text-sm text-muted-foreground">
        This will also delete all cards in this board. This action cannot be undone.
      </p>
    </BaseModal>
  )
}