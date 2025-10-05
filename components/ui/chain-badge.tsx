import { Badge } from "@/components/ui/badge"
import { CHAIN_METADATA } from "@/lib/thirdweb"

interface ChainBadgeProps {
  chainId: number
  className?: string
  size?: "sm" | "md" | "lg"
}

export function ChainBadge({ chainId, className = "", size = "md" }: ChainBadgeProps) {
  const metadata = CHAIN_METADATA[chainId as keyof typeof CHAIN_METADATA]

  if (!metadata) return null

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-3 py-1.5"
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  }

  const isImageIcon = metadata.icon.startsWith("http")

  return (
    <Badge
      className={`bg-gradient-to-r ${metadata.color} border-0 ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: metadata.bgColor,
        color: metadata.textColor
      }}
    >
      <div className="flex items-center gap-1.5">
        {isImageIcon ? (
          <img
            src={metadata.icon}
            alt={metadata.name}
            className={iconSizes[size]}
          />
        ) : (
          <span>{metadata.icon}</span>
        )}
        <span className="font-semibold">{metadata.shortName}</span>
      </div>
    </Badge>
  )
}
