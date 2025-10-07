import type { ReactNode } from "react"
import type { CardSize } from "@/types/nft"

interface NFTCardImageProps {
  src?: string
  alt: string
  size?: CardSize
  showHover?: boolean
  onImageClick?: () => void
  children?: ReactNode  // For badges, overlays, action buttons
  className?: string
}

const HEIGHT_CLASSES: Record<CardSize, string> = {
  compact: 'h-32',   // Dense 10-column grid
  standard: 'h-48',  // Standard 4-column grid
  large: 'h-64'      // Featured sections
}

/**
 * NFT Card Image - Standardized image container with overlays
 *
 * Features:
 * - Auto aspect ratio based on size
 * - Fallback placeholder for missing images
 * - Hover scale effect
 * - Supports overlay children (badges, action buttons)
 *
 * @example
 * <NFTCardImage
 *   src={nft.image}
 *   alt={nft.name}
 *   size="compact"
 *   onImageClick={() => openModal(nft)}
 * >
 *   <ChainBadge chainId={nft.chainId} />
 *   <RarityBadge rarity={nft.rarity} />
 * </NFTCardImage>
 */
export function NFTCardImage({
  src,
  alt,
  size = 'standard',
  showHover = true,
  onImageClick,
  children,
  className = ''
}: NFTCardImageProps) {
  const heightClass = HEIGHT_CLASSES[size]

  return (
    <div className={`relative ${className}`}>
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className={`w-full ${heightClass} object-cover transition-transform duration-300 ${
          showHover ? 'group-hover:scale-105' : ''
        } ${onImageClick ? 'cursor-pointer' : ''}`}
        onClick={onImageClick}
      />

      {/* Overlays (badges, actions, etc.) */}
      {children}
    </div>
  )
}
