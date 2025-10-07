import { Badge } from "@/components/ui/badge"

interface RarityBadgeProps {
  rarity: string
  size?: 'xs' | 'sm' | 'md'
  className?: string
}

// Rarity colors matching Fortuna Square design system
const RARITY_COLORS = {
  'Legendary': 'from-yellow-400 to-orange-500',
  'Epic': 'from-purple-400 to-pink-500',
  'Rare': 'from-blue-400 to-cyan-500',
  'Uncommon': 'from-green-400 to-emerald-500',
  'Common': 'from-gray-400 to-gray-500',
  // Numeric rarity (1-5 scale)
  '1': 'from-yellow-400 to-orange-500',  // Legendary
  '2': 'from-purple-400 to-pink-500',    // Epic
  '3': 'from-blue-400 to-cyan-500',      // Rare
  '4': 'from-green-400 to-emerald-500',  // Uncommon
  '5': 'from-gray-400 to-gray-500',      // Common
}

const SIZE_CLASSES = {
  xs: 'text-[9px] px-1.5 py-0.5',
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2 py-1',
}

/**
 * Rarity Badge - Displays NFT rarity with color-coded gradient
 *
 * Supports both text rarity (Legendary, Epic, etc.) and numeric (1-5)
 *
 * @example
 * <RarityBadge rarity="Legendary" size="sm" />
 * <RarityBadge rarity="3" size="xs" />
 */
export function RarityBadge({ rarity, size = 'sm', className = '' }: RarityBadgeProps) {
  const colorClass = RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || RARITY_COLORS.Common
  const sizeClass = SIZE_CLASSES[size]

  // Convert numeric rarity to text for display
  const displayText = ['1', '2', '3', '4', '5'].includes(rarity)
    ? ['Legendary', 'Epic', 'Rare', 'Uncommon', 'Common'][parseInt(rarity) - 1]
    : rarity

  return (
    <Badge
      className={`bg-gradient-to-r ${colorClass} text-white border-0 neon-glow ${sizeClass} ${className}`}
    >
      {displayText}
    </Badge>
  )
}
