"use client"

import { ReactNode } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { MODAL_STYLES } from "@/lib/ui-classes"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface BaseModalProps {
  /** Whether the modal is open */
  isOpen: boolean

  /** Callback when modal should close */
  onClose: () => void

  /** Modal title */
  title: string | ReactNode

  /** Optional modal description */
  description?: string | ReactNode

  /** Modal content */
  children: ReactNode

  /** Optional footer content (buttons, actions) */
  footer?: ReactNode

  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'

  /** Custom class for DialogContent */
  className?: string

  /** Custom class for header */
  headerClassName?: string

  /** Custom class for title */
  titleClassName?: string

  /** Custom class for description */
  descriptionClassName?: string

  /** Whether to show close button in header */
  showCloseButton?: boolean

  /** Whether modal can be dismissed by clicking outside or pressing escape */
  dismissable?: boolean

  /** Whether to show scrollbar (for tall content) */
  scrollable?: boolean

  /** Icon to show next to title */
  titleIcon?: ReactNode
}

/**
 * BaseModal - Reusable modal wrapper component
 *
 * Provides consistent styling and behavior for all modals in the app.
 * Eliminates duplicate Dialog/DialogContent/DialogHeader code.
 *
 * @example
 * ```tsx
 * <BaseModal
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   title="Buy NFT"
 *   description="Complete your purchase"
 *   size="lg"
 *   titleIcon={<ShoppingCart className="h-6 w-6" />}
 *   footer={
 *     <div className="flex gap-2">
 *       <Button variant="outline" onClick={onClose}>Cancel</Button>
 *       <Button onClick={handleBuy}>Confirm Purchase</Button>
 *     </div>
 *   }
 * >
 *   <div>Modal content here...</div>
 * </BaseModal>
 * ```
 */
export function BaseModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
  headerClassName,
  titleClassName,
  descriptionClassName,
  showCloseButton = false,
  dismissable = true,
  scrollable = true,
  titleIcon,
}: BaseModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={dismissable ? onClose : undefined}
    >
      <DialogContent
        className={cn(
          // Base styles
          MODAL_STYLES.DIALOG,
          MODAL_STYLES.SIZE[size.toUpperCase() as keyof typeof MODAL_STYLES.SIZE],

          // Scrollable content
          scrollable && "max-h-[90vh] overflow-y-auto",

          // Backdrop blur effect
          "backdrop-blur-xl",

          // Custom className
          className
        )}
        // Prevent closing if not dismissable
        onPointerDownOutside={dismissable ? undefined : (e) => e.preventDefault()}
        onEscapeKeyDown={dismissable ? undefined : (e) => e.preventDefault()}
      >
        <DialogHeader className={cn(MODAL_STYLES.HEADER, headerClassName)}>
          <div className="flex items-center justify-between">
            <DialogTitle
              className={cn(
                MODAL_STYLES.TITLE,
                "flex items-center gap-2",
                titleClassName
              )}
            >
              {titleIcon && titleIcon}
              {title}
            </DialogTitle>

            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {description && (
            <DialogDescription
              className={cn(MODAL_STYLES.DESCRIPTION, descriptionClassName)}
            >
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Modal Body */}
        <div className="py-4">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <DialogFooter className={MODAL_STYLES.FOOTER}>
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

/**
 * BaseModalError - Error state modal (no wallet, item not available, etc.)
 *
 * @example
 * ```tsx
 * <BaseModalError
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   title="Connect Wallet"
 *   description="Please connect your wallet to purchase items."
 * />
 * ```
 */
export function BaseModalError({
  isOpen,
  onClose,
  title,
  description,
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
}) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <Button onClick={onClose} className="w-full">
          Close
        </Button>
      }
    >
      {/* Empty body for error modals */}
    </BaseModal>
  )
}
