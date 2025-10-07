import { Badge } from "@/components/ui/badge"
import { Package } from "lucide-react"

interface BundleBadgeProps {
  count: number
  size?: 'xs' | 'sm' | 'md'
  className?: string
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
 * Bundle Badge - Displays number of items in a bundle NFT
 *
 * @example
 * <BundleBadge count={5} size="sm" />
 */
export function BundleBadge({ count, size = 'sm', className = '' }: BundleBadgeProps) {
  const sizeClasses = SIZE_CLASSES[size]

  return (
    <Badge
      className={`bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30 flex items-center gap-1 ${sizeClasses.badge} ${className}`}
    >
      <Package className={sizeClasses.icon} />
      {count} {count === 1 ? 'Item' : 'Items'}
    </Badge>
  )
}
