import { CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { CardSize } from "@/types/nft"
import type { ListingType, PortfolioNFT } from "@/types/profile"

interface NFTCardContentProps {
  title: string
  collection?: string
  bundleCount?: number
  nft: PortfolioNFT // Pass full NFT to access listing data
  size?: CardSize
  className?: string
}

const TEXT_SIZE_CLASSES = {
  compact: {
    title: 'text-xs',
    subtitle: 'text-[10px]',
    price: 'text-xs',
    badge: 'text-[9px] px-1.5 py-0.5'
  },
  standard: {
    title: 'text-sm',
    subtitle: 'text-xs',
    price: 'text-sm',
    badge: 'text-xs px-2 py-0.5'
  },
  large: {
    title: 'text-base',
    subtitle: 'text-sm',
    price: 'text-base',
    badge: 'text-sm px-2 py-1'
  }
}

const PADDING_CLASSES = {
  compact: 'p-2',
  standard: 'p-3',
  large: 'p-4'
}

/**
 * NFT Card Content - Footer section matching old implementation
 *
 * Shows:
 * - Title + Collection + Bundle Count
 * - Listing status badge (Sale/Rent/Swap)
 * - Price information based on listing type:
 *   - Sale: "X APE" (green)
 *   - Rent: "X APE/Day" (blue)
 *   - Swap: "Wants: Collection" + details (purple)
 *   - None: "Last Sale: X APE" or "Not Listed" (gray)
 */
export function NFTCardContent({
  title,
  collection,
  bundleCount,
  nft,
  size = 'standard',
  className = ''
}: NFTCardContentProps) {
  const textClasses = TEXT_SIZE_CLASSES[size]
  const paddingClass = PADDING_CLASSES[size]
  const listing = nft.listing
  const listingType = listing?.type

  return (
    <CardContent className={`${paddingClass} ${className}`}>
      {/* Header Row - Collection Name / Token ID */}
      <div className="mb-1">
        <h3 className={`font-semibold text-foreground group-hover:text-primary transition-colors truncate ${textClasses.title}`}>
          {collection || title}
        </h3>
        <p className={`text-muted-foreground truncate ${textClasses.subtitle}`}>
          #{nft.tokenId}
          {bundleCount && (
            <span className="ml-1 text-orange-400">
              • {bundleCount}
            </span>
          )}
        </p>
      </div>

      {/* Price Information Row */}
      <div className="space-y-0.5">
        {/* Sale Listing - Green */}
        {listingType === 'sale' && listing.sale && (
          <div>
            <p className={`font-bold text-primary neon-text ${textClasses.price}`}>
              {listing.sale.price} APE
            </p>
          </div>
        )}

        {/* Rent Listing - Blue */}
        {listingType === 'rent' && listing.rent && (
          <div>
            <p className={`font-bold text-blue-400 ${textClasses.price}`}>
              {listing.rent.pricePerDay} APE/Day
            </p>
          </div>
        )}

        {/* Swap Listing - Purple */}
        {listingType === 'swap' && listing.swap && (
          <div>
            <p className={`font-bold text-purple-400 ${textClasses.price} mb-1`}>
              Wants: {listing.swap.wantedCollection}
            </p>
            <p className={`${textClasses.subtitle} text-muted-foreground`}>
              ID: {listing.swap.wantedTokenId || "Any"}
            </p>
            {listing.swap.wantedTraits && listing.swap.wantedTraits.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {listing.swap.wantedTraits.map((trait, index) => (
                  <Badge key={index} variant="outline" className={`${textClasses.badge} px-1 py-0`}>
                    {trait}
                  </Badge>
                ))}
              </div>
            )}
            {nft.lastSalePrice && (
              <p className={`${textClasses.subtitle} text-muted-foreground mt-1`}>
                Last Sale: {nft.lastSalePrice} APE
              </p>
            )}
          </div>
        )}

        {/* Not Listed - Gray */}
        {(!listingType || listingType === 'none') && (
          <div>
            {nft.lastSalePrice ? (
              <p className={`${textClasses.price} text-muted-foreground`}>
                Last Sale: {nft.lastSalePrice} APE
              </p>
            ) : (
              <p className={`${textClasses.price} text-muted-foreground`}>
                Not Listed
              </p>
            )}
          </div>
        )}
      </div>
    </CardContent>
  )
}
