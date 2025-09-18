"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Standard modal sizes
export const MODAL_SIZES = {
  sm: "sm:max-w-sm",      // 384px
  md: "sm:max-w-md",      // 448px  
  lg: "sm:max-w-lg",      // 512px
  xl: "sm:max-w-xl",      // 576px
  "2xl": "sm:max-w-2xl",  // 672px
} as const

export type ModalSize = keyof typeof MODAL_SIZES

// Standard modal types for consistent styling
export const MODAL_TYPES = {
  default: {
    titleIcon: null,
    titleClass: "text-foreground",
    contentClass: "",
  },
  destructive: {
    titleIcon: "⚠️",
    titleClass: "text-destructive",
    contentClass: "border-destructive/20",
  },
  success: {
    titleIcon: "✅",
    titleClass: "text-green-600",
    contentClass: "border-green-200",
  },
  warning: {
    titleIcon: "⚠️",
    titleClass: "text-yellow-600",
    contentClass: "border-yellow-200",
  },
  info: {
    titleIcon: "ℹ️",
    titleClass: "text-blue-600",
    contentClass: "border-blue-200",
  },
} as const

export type ModalType = keyof typeof MODAL_TYPES

interface BaseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  size?: ModalSize
  type?: ModalType
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
  showCloseButton?: boolean
}

export function BaseModal({
  open,
  onOpenChange,
  title,
  size = "md",
  type = "default",
  children,
  footer,
  className,
  showCloseButton = true,
}: BaseModalProps) {
  const modalConfig = MODAL_TYPES[type]
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          MODAL_SIZES[size],
          modalConfig.contentClass,
          className
        )}
        showCloseButton={showCloseButton}
      >
        <DialogHeader>
          <DialogTitle className={cn(
            "flex items-center gap-2",
            modalConfig.titleClass
          )}>
            {modalConfig.titleIcon && (
              <span className="text-lg">{modalConfig.titleIcon}</span>
            )}
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {children}
        </div>

        {footer && (
          <div className="flex justify-end gap-3 pt-4 border-t">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Standard footer components for common patterns
interface StandardFooterProps {
  onCancel: () => void
  onConfirm: () => void
  cancelText?: string
  confirmText?: string
  confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  isLoading?: boolean
  disabled?: boolean
}

export function StandardFooter({
  onCancel,
  onConfirm,
  cancelText = "Cancel",
  confirmText = "Confirm",
  confirmVariant = "default",
  isLoading = false,
  disabled = false,
}: StandardFooterProps) {
  return (
    <>
      <Button
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
      >
        {cancelText}
      </Button>
      <Button
        variant={confirmVariant}
        onClick={onConfirm}
        disabled={disabled || isLoading}
      >
        {isLoading ? "Loading..." : confirmText}
      </Button>
    </>
  )
}

// Form modal wrapper for forms with validation
interface FormModalProps extends Omit<BaseModalProps, 'footer'> {
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  submitText?: string
  cancelText?: string
  submitVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  isSubmitting?: boolean
  isValid?: boolean
}

export function FormModal({
  onSubmit,
  onCancel,
  submitText = "Submit",
  cancelText = "Cancel", 
  submitVariant = "default",
  isSubmitting = false,
  isValid = true,
  children,
  ...modalProps
}: FormModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(e)
  }

  const handleConfirm = () => {
    const syntheticEvent = new Event('submit') as any
    handleSubmit(syntheticEvent)
  }

  return (
    <BaseModal
      {...modalProps}
      footer={
        <StandardFooter
          onCancel={onCancel}
          onConfirm={handleConfirm}
          cancelText={cancelText}
          confirmText={submitText}
          confirmVariant={submitVariant}
          isLoading={isSubmitting}
          disabled={!isValid}
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {children}
      </form>
    </BaseModal>
  )
}