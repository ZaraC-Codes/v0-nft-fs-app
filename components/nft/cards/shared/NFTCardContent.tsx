import { CardContent } from "@/components/ui/card"
import { Heart, Eye } from "lucide-react"
import type { CardSize } from "@/types/nft"

interface NFTCardContentProps {
  title: string
  creator?: string
  collection?: string
  price?: string
  priceLabel?: string  // e.g., "2.5 APE/day" for rentals
  likes?: number
  views?: number
  bundleCount?: number
  size?: CardSize
  showStats?: boolean
  className?: string
}

const TEXT_SIZE_CLASSES = {
  compact: {
    title: 'text-xs',
    subtitle: 'text-[10px]',
    price: 'text-xs'
  },
  standard: {
    title: 'text-sm',
    subtitle: 'text-xs',
    price: 'text-sm'
  },
  large: {
    title: 'text-base',
    subtitle: 'text-sm',
    price: 'text-base'
  }
}

const PADDING_CLASSES = {
  compact: 'p-2',
  standard: 'p-3',
  large: 'p-4'
}

/**
 * NFT Card Content - Footer section with title, creator, price, stats
 *
 * @example
 * <NFTCardContent
 *   title="Cyber Samurai #001"
 *   creator="NeonArtist"
 *   collection="Cyber Samurai Collection"
 *   price="2.5 APE"
 *   likes={234}
 *   views={1520}
 *   size="compact"
 * />
 */
export function NFTCardContent({
  title,
  creator,
  collection,
  price,
  priceLabel,
  likes,
  views,
  bundleCount,
  size = 'standard',
  showStats = true,
  className = ''
}: NFTCardContentProps) {
  const textClasses = TEXT_SIZE_CLASSES[size]
  const paddingClass = PADDING_CLASSES[size]

  // Display collection name with bundle count if applicable
  const collectionDisplay = collection || ''
  const bundleSuffix = bundleCount ? ` • ${bundleCount}` : ''

  return (
    <CardContent className={`${paddingClass} ${className}`}>
      <div className="flex items-start justify-between mb-1">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-foreground group-hover:text-primary transition-colors truncate ${textClasses.title}`}>
            {title}
          </h3>
          {(creator || collectionDisplay) && (
            <p className={`text-muted-foreground truncate ${textClasses.subtitle}`}>
              {creator && `by ${creator}`}
              {creator && collectionDisplay && ' • '}
              {collectionDisplay}
              {bundleCount && (
                <span className="text-orange-400">{bundleSuffix}</span>
              )}
            </p>
          )}
        </div>

        {price && (
          <div className="text-right ml-2 flex-shrink-0">
            <p className={`font-bold text-primary neon-text whitespace-nowrap ${textClasses.price}`}>
              {priceLabel || price}
            </p>
          </div>
        )}
      </div>

      {showStats && (likes !== undefined || views !== undefined) && (
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center space-x-2">
            {likes !== undefined && (
              <span className="flex items-center">
                <Heart className="mr-1 h-2.5 w-2.5" />
                {likes}
              </span>
            )}
            {views !== undefined && (
              <span className="flex items-center">
                <Eye className="mr-1 h-2.5 w-2.5" />
                {views}
              </span>
            )}
          </div>
        </div>
      )}
    </CardContent>
  )
}
