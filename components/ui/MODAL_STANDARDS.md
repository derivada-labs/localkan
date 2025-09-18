# Modal Standards

This document outlines the standardized approach for creating modals in the application.

## Base Modal Component

Use the `BaseModal` component from `@/components/ui/base-modal` as the foundation for all modals.

### Standard Sizes

```typescript
const MODAL_SIZES = {
  sm: "sm:max-w-sm",      // 384px - Simple confirmations
  md: "sm:max-w-md",      // 448px - Forms with few fields (default)
  lg: "sm:max-w-lg",      // 512px - Complex forms
  xl: "sm:max-w-xl",      // 576px - Rich content
  "2xl": "sm:max-w-2xl",  // 672px - Very complex forms
}
```

### Standard Types

```typescript
const MODAL_TYPES = {
  default: "Standard modal",
  destructive: "Delete/destructive actions (red theme)",
  success: "Success confirmations (green theme)",
  warning: "Warning messages (yellow theme)", 
  info: "Information displays (blue theme)",
}
```

## Usage Examples

### Basic Modal

```tsx
import { BaseModal, StandardFooter } from "@/components/ui/base-modal"

function MyModal({ open, onOpenChange }) {
  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title="My Modal"
      size="md"
      type="default"
      footer={
        <StandardFooter
          onCancel={() => onOpenChange(false)}
          onConfirm={handleConfirm}
          confirmText="Save"
        />
      }
    >
      <p>Modal content goes here</p>
    </BaseModal>
  )
}
```

### Form Modal

```tsx
import { FormModal } from "@/components/ui/base-modal"

function CreateItemModal({ open, onOpenChange }) {
  const [title, setTitle] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Handle form submission
    setIsSubmitting(false)
    onOpenChange(false)
  }

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Create Item"
      size="md"
      onSubmit={handleSubmit}
      onCancel={() => onOpenChange(false)}
      submitText="Create"
      isSubmitting={isSubmitting}
      isValid={title.trim().length > 0}
    >
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter title..."
        />
      </div>
    </FormModal>
  )
}
```

### Destructive Modal

```tsx
import { BaseModal, StandardFooter } from "@/components/ui/base-modal"

function DeleteModal({ open, onOpenChange, itemName, onConfirm }) {
  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Item"
      size="sm"
      type="destructive"
      footer={
        <StandardFooter
          onCancel={() => onOpenChange(false)}
          onConfirm={onConfirm}
          confirmText="Delete"
          confirmVariant="destructive"
        />
      }
    >
      <p>
        Are you sure you want to delete{" "}
        <span className="font-medium">{itemName}</span>?
      </p>
      <p className="text-sm text-muted-foreground">
        This action cannot be undone.
      </p>
    </BaseModal>
  )
}
```

## Animation Standards

- **No animations**: All modal animations have been removed for better performance and accessibility
- **Instant appearance**: Modals appear and disappear instantly without transitions
- **Focus on content**: Users can focus on the modal content without distracting animations

## Spacing Standards

- **Padding**: 24px (p-6) for all modal content
- **Gap**: 16px (space-y-4) between content sections
- **Footer**: 16px top padding (pt-4) with border-t separator

## Content Guidelines

### Titles
- Use clear, action-oriented titles
- Include appropriate icons for modal types
- Keep titles concise (1-3 words when possible)

### Content
- Use consistent spacing with `space-y-4`
- Group related fields together
- Provide clear labels and helpful placeholder text
- Include validation feedback

### Buttons
- Always provide a cancel option
- Use descriptive button text ("Save", "Delete", "Create" vs generic "OK")
- Disable submit buttons when form is invalid
- Show loading states during async operations

## Migration Guide

### From Old Modals

1. Replace direct `Dialog` usage with `BaseModal`
2. Remove custom animations and sizing
3. Use standard footer components
4. Apply consistent spacing patterns

### Example Migration

**Before:**
```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Create Board</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      {/* content */}
    </div>
    <div className="flex justify-end gap-3 pt-4">
      <Button variant="outline" onClick={() => onOpenChange(false)}>
        Cancel
      </Button>
      <Button onClick={handleSubmit}>
        Create
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

**After:**
```tsx
<BaseModal
  open={open}
  onOpenChange={onOpenChange}
  title="Create Board"
  size="md"
  footer={
    <StandardFooter
      onCancel={() => onOpenChange(false)}
      onConfirm={handleSubmit}
      confirmText="Create"
    />
  }
>
  {/* content */}
</BaseModal>
```

## Best Practices

1. **Consistency**: Always use the base modal components
2. **Accessibility**: Ensure proper focus management and keyboard navigation
3. **Performance**: Avoid heavy computations in modal render cycles
4. **UX**: Provide clear feedback for all user actions
5. **Validation**: Always validate forms before submission
6. **Error Handling**: Show clear error messages when operations fail