"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, X } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { ChainBadge } from "@/components/ui/chain-badge"
import { GRID_LAYOUTS, BADGE_STYLES } from "@/lib/ui-classes"
import { PortfolioNFT } from "@/types/profile"

export interface NFTSelectionGridProps {
  /** All available NFTs to select from */
  nfts: PortfolioNFT[]

  /** Currently selected NFTs */
  selectedNFTs: PortfolioNFT[]

  /** Callback when selection changes */
  onSelectionChange: (selectedNFTs: PortfolioNFT[]) => void

  /** Maximum number of NFTs that can be selected (0 = unlimited) */
  maxSelection?: number

  /** Minimum number of NFTs that must be selected */
  minSelection?: number

  /** Whether to enforce same-chain selection */
  requireSameChain?: boolean

  /** Custom filter function to disable certain NFTs */
  isDisabled?: (nft: PortfolioNFT) => boolean

  /** Custom message for disabled NFTs */
  getDisabledReason?: (nft: PortfolioNFT) => string | undefined

  /** Show selected count */
  showCount?: boolean

  /** Grid size */
  gridSize?: 'sm' | 'md' | 'lg'

  /** Custom className for container */
  className?: string
}

/**
 * NFTSelectionGrid - Reusable NFT selection component
 *
 * Used in bundle creation, swap proposals, and any other multi-NFT selection UI.
 * Eliminates duplicate selection logic across modals.
 *
 * @example
 * ```tsx
 * <NFTSelectionGrid
 *   nfts={userNFTs}
 *   selectedNFTs={selectedNFTs}
 *   onSelectionChange={setSelectedNFTs}
 *   maxSelection={50}
 *   requireSameChain
 *   isDisabled={(nft) => nft.listing?.type === 'sale'}
 *   getDisabledReason={(nft) =>
 *     nft.listing?.type === 'sale' ? 'Listed NFTs cannot be bundled' : undefined
 *   }
 * />
 * ```
 */
export function NFTSelectionGrid({
  nfts,
  selectedNFTs,
  onSelectionChange,
  maxSelection = 0,
  minSelection = 0,
  requireSameChain = false,
  isDisabled,
  getDisabledReason,
  showCount = true,
  gridSize = 'md',
  className,
}: NFTSelectionGridProps) {
  const isSelected = (nft: PortfolioNFT) => {
    return selectedNFTs.some(
      (n) => n.contractAddress === nft.contractAddress && n.tokenId === nft.tokenId
    )
  }

  const isNFTDisabled = (nft: PortfolioNFT) => {
    // Check custom disabled function
    if (isDisabled && isDisabled(nft)) {
      return true
    }

    // Check chain restriction
    if (requireSameChain && selectedNFTs.length > 0) {
      const firstChain = selectedNFTs[0].chainId
      if (nft.chainId !== firstChain && !isSelected(nft)) {
        return true
      }
    }

    // Check max selection
    if (maxSelection > 0 && selectedNFTs.length >= maxSelection && !isSelected(nft)) {
      return true
    }

    return false
  }

  const getDisabledMessage = (nft: PortfolioNFT): string | undefined => {
    // Custom disabled reason
    if (getDisabledReason) {
      const reason = getDisabledReason(nft)
      if (reason) return reason
    }

    // Chain restriction reason
    if (requireSameChain && selectedNFTs.length > 0) {
      const firstChain = selectedNFTs[0].chainId
      if (nft.chainId !== firstChain && !isSelected(nft)) {
        return 'All NFTs must be on the same blockchain'
      }
    }

    // Max selection reason
    if (maxSelection > 0 && selectedNFTs.length >= maxSelection && !isSelected(nft)) {
      return `Maximum ${maxSelection} NFTs can be selected`
    }

    return undefined
  }

  const handleToggle = (nft: PortfolioNFT) => {
    const disabled = isNFTDisabled(nft)
    if (disabled) {
      const message = getDisabledMessage(nft)
      if (message) {
        alert(message)
      }
      return
    }

    const selected = isSelected(nft)

    if (selected) {
      // Deselect (check min selection)
      if (minSelection > 0 && selectedNFTs.length <= minSelection) {
        alert(`At least ${minSelection} NFT${minSelection > 1 ? 's' : ''} must be selected`)
        return
      }

      onSelectionChange(
        selectedNFTs.filter(
          (n) => !(n.contractAddress === nft.contractAddress && n.tokenId === nft.tokenId)
        )
      )
    } else {
      // Select
      onSelectionChange([...selectedNFTs, nft])
    }
  }

  const gridClass = {
    sm: GRID_LAYOUTS.RESPONSIVE_1_3,
    md: GRID_LAYOUTS.RESPONSIVE_2_4,
    lg: GRID_LAYOUTS.BUNDLES,
  }[gridSize]

  return (
    <div className={cn("space-y-4", className)}>
      {/* Selection Count */}
      {showCount && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {selectedNFTs.length} selected
            {maxSelection > 0 && ` of ${maxSelection} max`}
          </p>
          {minSelection > 0 && (
            <p className="text-xs text-muted-foreground">
              Minimum: {minSelection}
            </p>
          )}
        </div>
      )}

      {/* NFT Grid */}
      <ScrollArea className="h-[400px] pr-4">
        <div className={gridClass}>
          {nfts.map((nft) => (
            <SelectableNFTCard
              key={`${nft.contractAddress}-${nft.tokenId}`}
              nft={nft}
              isSelected={isSelected(nft)}
              isDisabled={isNFTDisabled(nft)}
              disabledReason={getDisabledMessage(nft)}
              onClick={() => handleToggle(nft)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

/**
 * SelectableNFTCard - Individual selectable NFT card
 */
interface SelectableNFTCardProps {
  nft: PortfolioNFT
  isSelected: boolean
  isDisabled: boolean
  disabledReason?: string
  onClick: () => void
}

function SelectableNFTCard({
  nft,
  isSelected,
  isDisabled,
  disabledReason,
  onClick,
}: SelectableNFTCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden cursor-pointer transition-all duration-200",
        "hover:shadow-lg hover:scale-105",
        isSelected && "ring-2 ring-primary shadow-lg shadow-primary/20",
        isDisabled && "opacity-50 cursor-not-allowed hover:scale-100"
      )}
      onClick={onClick}
      title={disabledReason}
    >
      {/* Chain Badge */}
      <div className={BADGE_STYLES.POSITION.TOP_LEFT}>
        <ChainBadge chainId={nft.chainId} size="xs" logoOnly showTooltip />
      </div>

      {/* Selection Indicator */}
      <div className={cn(
        BADGE_STYLES.POSITION.TOP_RIGHT,
        "z-10"
      )}>
        {isSelected ? (
          <div className="rounded-full bg-primary p-1">
            <Check className="h-3 w-3 text-primary-foreground" />
          </div>
        ) : (
          <div className="rounded-full bg-muted/70 p-1 border-2 border-border">
            <div className="h-3 w-3" />
          </div>
        )}
      </div>

      {/* Disabled Overlay */}
      {isDisabled && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-destructive/90 rounded-full p-2">
            <X className="h-4 w-4 text-destructive-foreground" />
          </div>
        </div>
      )}

      {/* NFT Image */}
      <div className="aspect-square relative bg-muted">
        <Image
          src={nft.image || '/placeholder-nft.png'}
          alt={nft.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>

      {/* NFT Info */}
      <div className="p-2">
        <p className="text-xs font-medium truncate">{nft.name}</p>
        <p className="text-[10px] text-muted-foreground truncate">
          {nft.collection}
        </p>

        {/* Listing Badge */}
        {nft.listing && nft.listing.type !== 'none' && (
          <Badge
            variant="secondary"
            className={cn(BADGE_STYLES.SIZE.XS, "mt-1")}
          >
            {nft.listing.type === 'sale' && `${nft.listing.sale.price} APE`}
            {nft.listing.type === 'rent' && `${nft.listing.rent.pricePerDay} APE/day`}
            {nft.listing.type === 'swap' && 'For Swap'}
          </Badge>
        )}
      </div>
    </Card>
  )
}
