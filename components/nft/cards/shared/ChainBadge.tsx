import { Badge } from "@/components/ui/badge"
import { getChainMetadata } from "@/lib/thirdweb"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ChainBadgeProps {
  chainId: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
  logoOnly?: boolean // New: show only logo without text
  showTooltip?: boolean // New: show tooltip on hover (defaults to true when logoOnly is true)
}

const SIZE_CLASSES = {
  sm: {
    badge: 'text-[9px] px-1.5 py-0.5',
    logoOnlyBadge: 'p-0.5',
    icon: 'w-2.5 h-2.5'
  },
  md: {
    badge: 'text-xs px-2 py-1',
    logoOnlyBadge: 'p-1',
    icon: 'w-3 h-3'
  },
  lg: {
    badge: 'text-sm px-2.5 py-1.5',
    logoOnlyBadge: 'p-1.5',
    icon: 'w-4 h-4'
  }
}

/**
 * Chain Badge - Displays blockchain network indicator with icon
 *
 * @example
 * <ChainBadge chainId={33139} size="sm" />
 * <ChainBadge chainId={33139} size="sm" logoOnly showTooltip />
 */
export function ChainBadge({
  chainId,
  size = 'md',
  className = '',
  logoOnly = false,
  showTooltip = logoOnly // Auto-enable tooltip for logo-only mode
}: ChainBadgeProps) {
  const chainMetadata = getChainMetadata(chainId)

  if (!chainMetadata) return null

  const sizeClasses = SIZE_CLASSES[size]

  const badgeContent = (
    <Badge
      className={`bg-gradient-to-r ${chainMetadata.color} text-white border-0 flex items-center ${logoOnly ? '' : 'gap-1'} ${logoOnly ? sizeClasses.logoOnlyBadge : sizeClasses.badge} ${className}`}
    >
      <img
        src={chainMetadata.icon}
        alt={chainMetadata.name}
        className={sizeClasses.icon}
      />
      {!logoOnly && chainMetadata.shortName}
    </Badge>
  )

  // Wrap in tooltip if enabled
  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badgeContent}
          </TooltipTrigger>
          <TooltipContent>
            <p>{chainMetadata.name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return badgeContent
}
