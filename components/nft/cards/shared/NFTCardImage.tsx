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

/**
 * NFT Card Image - Standardized image container with overlays
 *
 * Features:
 * - Square aspect ratio (aspect-square)
 * - Object-contain to prevent cropping
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
  return (
    <div className={`relative ${className}`}>
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className={`w-full aspect-square object-contain bg-black/20 transition-transform duration-300 ${
          showHover ? 'group-hover:scale-105' : ''
        } ${onImageClick ? 'cursor-pointer' : ''}`}
        onClick={onImageClick}
      />

      {/* Overlays (badges, actions, etc.) */}
      {children}
    </div>
  )
}
