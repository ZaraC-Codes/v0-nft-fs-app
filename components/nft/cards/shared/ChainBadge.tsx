import { Badge } from "@/components/ui/badge"
import { getChainMetadata } from "@/lib/thirdweb"

interface ChainBadgeProps {
  chainId: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASSES = {
  sm: {
    badge: 'text-[9px] px-1.5 py-0.5',
    icon: 'w-2.5 h-2.5'
  },
  md: {
    badge: 'text-xs px-2 py-1',
    icon: 'w-3 h-3'
  },
  lg: {
    badge: 'text-sm px-2.5 py-1.5',
    icon: 'w-4 h-4'
  }
}

/**
 * Chain Badge - Displays blockchain network indicator with icon
 *
 * @example
 * <ChainBadge chainId={33139} size="sm" />
 */
export function ChainBadge({ chainId, size = 'md', className = '' }: ChainBadgeProps) {
  const chainMetadata = getChainMetadata(chainId)

  if (!chainMetadata) return null

  const sizeClasses = SIZE_CLASSES[size]

  return (
    <Badge
      className={`bg-gradient-to-r ${chainMetadata.color} text-white border-0 flex items-center gap-1 ${sizeClasses.badge} ${className}`}
    >
      <img
        src={chainMetadata.icon}
        alt={chainMetadata.name}
        className={sizeClasses.icon}
      />
      {chainMetadata.shortName}
    </Badge>
  )
}
