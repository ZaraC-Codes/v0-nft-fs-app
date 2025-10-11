import { Badge } from "@/components/ui/badge"
import { CHAIN_METADATA } from "@/lib/thirdweb"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ChainBadgeProps {
  chainId: number
  className?: string
  size?: "xs" | "sm" | "md" | "lg"
  logoOnly?: boolean // New: show only logo without text
  showTooltip?: boolean // New: show tooltip on hover (defaults to true when logoOnly is true)
}

export function ChainBadge({
  chainId,
  className = "",
  size = "md",
  logoOnly = false,
  showTooltip = logoOnly // Auto-enable tooltip for logo-only mode
}: ChainBadgeProps) {
  const metadata = CHAIN_METADATA[chainId as keyof typeof CHAIN_METADATA]

  if (!metadata) return null

  const sizeClasses = {
    xs: "text-[8px] px-1 py-0",
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-3 py-1.5"
  }

  // Logo-only mode uses tighter padding
  const logoOnlySizeClasses = {
    xs: "p-0.5",
    sm: "p-0.5",
    md: "p-1",
    lg: "p-1.5"
  }

  const iconSizes = {
    xs: "h-2 w-2",
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  }

  const isImageIcon = metadata.icon.startsWith("http")

  const badgeContent = (
    <Badge
      className={`bg-gradient-to-r ${metadata.color} border-0 ${logoOnly ? logoOnlySizeClasses[size] : sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: metadata.bgColor,
        color: metadata.textColor
      }}
    >
      <div className={`flex items-center ${logoOnly ? '' : 'gap-1.5'}`}>
        {isImageIcon ? (
          <img
            src={metadata.icon}
            alt={metadata.name}
            className={iconSizes[size]}
          />
        ) : (
          <span>{metadata.icon}</span>
        )}
        {!logoOnly && <span className="font-semibold">{metadata.shortName}</span>}
      </div>
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
            <p>{metadata.name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return badgeContent
}
