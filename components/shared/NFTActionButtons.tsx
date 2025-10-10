"use client"

import { Button } from "@/components/ui/button"
import { PortfolioNFT } from "@/types/profile"
import { NFTAction } from "@/types/nft"
import {
  getVisibleActions,
  getPrimaryAction,
  getActionLabel,
  type ActionButtonConfig,
} from "@/lib/nft-actions"
import { cn } from "@/lib/utils"

export interface NFTActionButtonsProps {
  /** The NFT to render actions for */
  nft: PortfolioNFT

  /** Whether the current user owns this NFT */
  isOwner: boolean

  /** Callback when an action is clicked */
  onActionClick?: (action: NFTAction, nft: PortfolioNFT) => void

  /** Maximum number of actions to show */
  maxActions?: number

  /** Whether to show all actions or just primary */
  showAllActions?: boolean

  /** Size variant for buttons */
  size?: 'sm' | 'md' | 'lg'

  /** Layout direction */
  layout?: 'vertical' | 'horizontal'

  /** Custom className for container */
  className?: string
}

/**
 * NFTActionButtons - Renders action buttons for NFT cards
 *
 * Uses lib/nft-actions.ts configuration to determine which buttons to show
 * based on NFT state (listing type, ownership, etc.)
 *
 * @example
 * ```tsx
 * // Show primary action only (most common use case on cards)
 * <NFTActionButtons
 *   nft={nft}
 *   isOwner={false}
 *   onActionClick={(action, nft) => handleAction(action, nft)}
 * />
 *
 * // Show all available actions (in modals/detail views)
 * <NFTActionButtons
 *   nft={nft}
 *   isOwner={true}
 *   showAllActions
 *   layout="vertical"
 *   onActionClick={(action, nft) => handleAction(action, nft)}
 * />
 * ```
 */
export function NFTActionButtons({
  nft,
  isOwner,
  onActionClick,
  maxActions = 1,
  showAllActions = false,
  size = 'md',
  layout = 'vertical',
  className,
}: NFTActionButtonsProps) {
  // Get actions to display
  const actions = showAllActions
    ? getVisibleActions(nft, isOwner).slice(0, maxActions)
    : [getPrimaryAction(nft, isOwner)]

  if (actions.length === 0) {
    return null
  }

  const buttonSizeClass = {
    sm: 'text-xs py-1.5',
    md: 'text-sm py-2',
    lg: 'text-base py-3',
  }[size]

  return (
    <div
      className={cn(
        "flex gap-2",
        layout === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        className
      )}
    >
      {actions.map((config) => (
        <ActionButton
          key={config.action}
          config={config}
          nft={nft}
          onClick={() => onActionClick?.(config.action, nft)}
          size={size}
          buttonSizeClass={buttonSizeClass}
        />
      ))}
    </div>
  )
}

/**
 * ActionButton - Individual action button component
 */
function ActionButton({
  config,
  nft,
  onClick,
  size,
  buttonSizeClass,
}: {
  config: ActionButtonConfig
  nft: PortfolioNFT
  onClick: () => void
  size: 'sm' | 'md' | 'lg'
  buttonSizeClass: string
}) {
  const Icon = config.icon
  const label = getActionLabel(config, nft)

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }[size]

  return (
    <Button
      className={cn("w-full", config.className, buttonSizeClass)}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <Icon className={cn(iconSize, "mr-2")} />
      {label}
    </Button>
  )
}

/**
 * NFTActionOverlay - Action buttons in hover overlay (for NFT cards)
 *
 * Shows buttons at the bottom of the card with gradient overlay background.
 * Only visible on hover.
 *
 * @example
 * ```tsx
 * <NFTActionOverlay
 *   nft={nft}
 *   isOwner={false}
 *   onActionClick={(action, nft) => {
 *     if (action === 'buy') onBuyClick(nft)
 *     if (action === 'rent') onRentClick(nft)
 *   }}
 * />
 * ```
 */
export function NFTActionOverlay({
  nft,
  isOwner,
  onActionClick,
  showAllActions = false,
  maxActions = 1,
}: Omit<NFTActionButtonsProps, 'layout' | 'size' | 'className'>) {
  return (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end pointer-events-none">
      <div className="p-4 w-full pointer-events-auto">
        <NFTActionButtons
          nft={nft}
          isOwner={isOwner}
          onActionClick={onActionClick}
          showAllActions={showAllActions}
          maxActions={maxActions}
          layout="vertical"
        />
      </div>
    </div>
  )
}

/**
 * Callback type for action clicks
 */
export interface NFTActionCallbacks {
  onBuyClick?: (nft: PortfolioNFT) => void
  onRentClick?: (nft: PortfolioNFT) => void
  onSwapClick?: (nft: PortfolioNFT) => void
  onListSaleClick?: (nft: PortfolioNFT) => void
  onListRentClick?: (nft: PortfolioNFT) => void
  onListSwapClick?: (nft: PortfolioNFT) => void
  onEditPriceClick?: (nft: PortfolioNFT) => void
  onCancelListingClick?: (nft: PortfolioNFT) => void
  onUnwrapBundleClick?: (nft: PortfolioNFT) => void
  onUnwrapRentalClick?: (nft: PortfolioNFT) => void
  onViewClick?: (nft: PortfolioNFT) => void
}

/**
 * Convert action type to callback
 */
export function useActionCallback(
  action: NFTAction,
  callbacks: NFTActionCallbacks
): ((nft: PortfolioNFT) => void) | undefined {
  switch (action) {
    case 'buy': return callbacks.onBuyClick
    case 'rent': return callbacks.onRentClick
    case 'swap': return callbacks.onSwapClick
    case 'list_sale': return callbacks.onListSaleClick
    case 'list_rent': return callbacks.onListRentClick
    case 'list_swap': return callbacks.onListSwapClick
    case 'edit_price': return callbacks.onEditPriceClick
    case 'cancel_listing': return callbacks.onCancelListingClick
    case 'unwrap_bundle': return callbacks.onUnwrapBundleClick
    case 'unwrap_rental': return callbacks.onUnwrapRentalClick
    case 'view': return callbacks.onViewClick
    default: return undefined
  }
}

/**
 * Helper to handle action click with callbacks
 */
export function handleActionClick(
  action: NFTAction,
  nft: PortfolioNFT,
  callbacks: NFTActionCallbacks
) {
  const callback = useActionCallback(action, callbacks)
  callback?.(nft)
}
