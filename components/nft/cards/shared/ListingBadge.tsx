import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Clock, Repeat } from "lucide-react"
import type { ListingType } from "@/types/profile"

interface ListingBadgeProps {
  listingType: ListingType
  price?: string
  size?: 'xs' | 'sm' | 'md'
  className?: string
}

const LISTING_CONFIG = {
  sale: {
    icon: ShoppingCart,
    label: 'For Sale',
    colorClass: 'from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30'
  },
  rent: {
    icon: Clock,
    label: 'For Rent',
    colorClass: 'from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30'
  },
  swap: {
    icon: Repeat,
    label: 'For Swap',
    colorClass: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30'
  },
  none: {
    icon: null,
    label: '',
    colorClass: ''
  }
}

const SIZE_CLASSES = {
  xs: {
    badge: 'text-[9px] px-1.5 py-0.5',
    icon: 'h-2.5 w-2.5'
  },
  sm: {
    badge: 'text-[10px] px-2 py-0.5',
    icon: 'h-3 w-3'
  },
  md: {
    badge: 'text-xs px-2 py-1',
    icon: 'h-3.5 w-3.5'
  }
}

/**
 * Listing Badge - Displays NFT listing status
 *
 * Shows "For Sale", "For Rent", or "For Swap" with color coding
 *
 * @example
 * <ListingBadge listingType="sale" price="2.5 APE" />
 * <ListingBadge listingType="rent" size="sm" />
 */
export function ListingBadge({ listingType, price, size = 'sm', className = '' }: ListingBadgeProps) {
  if (listingType === 'none') return null

  const config = LISTING_CONFIG[listingType]
  const sizeClasses = SIZE_CLASSES[size]
  const Icon = config.icon

  return (
    <Badge
      className={`bg-gradient-to-r ${config.colorClass} flex items-center gap-1 ${sizeClasses.badge} ${className}`}
    >
      {Icon && <Icon className={sizeClasses.icon} />}
      {config.label}
    </Badge>
  )
}
