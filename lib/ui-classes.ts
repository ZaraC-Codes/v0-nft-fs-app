/**
 * Reusable Tailwind Class Patterns
 * Single source of truth for common UI styling patterns
 *
 * IMPORTANT: Use these constants instead of hardcoding Tailwind classes
 * This ensures consistency and makes theme changes easier
 */

// ============================================
// BUTTON GRADIENTS
// ============================================

export const BUTTON_GRADIENTS = {
  // Action-specific gradients
  BUY: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
  RENT: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
  SWAP: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
  SELL: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',

  // Generic gradients
  PRIMARY: 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700',
  SUCCESS: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
  DANGER: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
  WARNING: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
  INFO: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
  NEUTRAL: 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
} as const

// ============================================
// NEON GLOW EFFECTS
// ============================================

export const NEON_GLOW = {
  // Primary cyan glow (used on NFT cards)
  PRIMARY: 'neon-glow',

  // Custom glow effects
  CYAN: 'drop-shadow-[0_0_12px_rgba(0,255,255,0.8)] hover:drop-shadow-[0_0_16px_rgba(0,255,255,0.9)]',
  GREEN: 'drop-shadow-[0_0_12px_rgba(34,197,94,0.8)] hover:drop-shadow-[0_0_16px_rgba(34,197,94,0.9)]',
  BLUE: 'drop-shadow-[0_0_12px_rgba(59,130,246,0.8)] hover:drop-shadow-[0_0_16px_rgba(59,130,246,0.9)]',
  PURPLE: 'drop-shadow-[0_0_12px_rgba(168,85,247,0.8)] hover:drop-shadow-[0_0_16px_rgba(168,85,247,0.9)]',

  // Subtle glows for watchlist icons
  CYAN_SUBTLE: 'drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]',
} as const

// ============================================
// CARD STYLES
// ============================================

export const CARD_STYLES = {
  // Base card
  BASE: 'bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300',

  // NFT card hover effects
  NFT_HOVER: 'hover:shadow-lg hover:shadow-primary/20',

  // Card content padding by size
  PADDING: {
    MICRO: 'p-1.5',
    COMPACT: 'p-2',
    STANDARD: 'p-3',
    LARGE: 'p-4',
  },

  // Overlay gradients
  OVERLAY_GRADIENT: 'bg-gradient-to-t from-black/80 via-transparent to-transparent',
} as const

// ============================================
// BADGE STYLES
// ============================================

export const BADGE_STYLES = {
  // Badge positioning on cards
  POSITION: {
    TOP_LEFT: 'absolute top-1.5 left-1.5',
    TOP_RIGHT: 'absolute top-1.5 right-1.5',
    BOTTOM_LEFT: 'absolute bottom-1.5 left-1.5',
    BOTTOM_RIGHT: 'absolute bottom-1.5 right-1.5',
  },

  // Badge sizes
  SIZE: {
    XS: 'px-1.5 py-0.5 text-xs',
    SM: 'px-2 py-0.5 text-xs',
    MD: 'px-2.5 py-1 text-sm',
    LG: 'px-3 py-1.5 text-base',
  },

  // Badge backgrounds
  BACKGROUND: {
    DARK: 'bg-black/70 backdrop-blur-sm',
    LIGHT: 'bg-white/70 backdrop-blur-sm',
    CYAN: 'bg-cyan-500/20 border border-cyan-500/50',
    GREEN: 'bg-green-500/20 border border-green-500/50',
  },
} as const

// ============================================
// MODAL STYLES
// ============================================

export const MODAL_STYLES = {
  // Base modal dialog
  DIALOG: 'bg-black/90 border-cyan-500/50',

  // Modal header
  HEADER: 'border-b border-cyan-500/30',

  // Modal title
  TITLE: 'text-2xl font-bold neon-text',

  // Modal description
  DESCRIPTION: 'text-muted-foreground',

  // Modal footer
  FOOTER: 'border-t border-cyan-500/30',

  // Modal sizes
  SIZE: {
    SM: 'max-w-md',
    MD: 'max-w-2xl',
    LG: 'max-w-4xl',
    XL: 'max-w-6xl',
    FULL: 'max-w-[95vw]',
  },
} as const

// ============================================
// TEXT STYLES
// ============================================

export const TEXT_STYLES = {
  // Neon text effect
  NEON: 'neon-text',

  // Truncation
  TRUNCATE: 'truncate',
  TRUNCATE_2: 'line-clamp-2',
  TRUNCATE_3: 'line-clamp-3',

  // Font weights
  WEIGHT: {
    NORMAL: 'font-normal',
    MEDIUM: 'font-medium',
    SEMIBOLD: 'font-semibold',
    BOLD: 'font-bold',
  },

  // Text sizes by card size
  SIZE_BY_CARD: {
    MICRO: {
      TITLE: 'text-xs',
      SUBTITLE: 'text-[10px]',
      PRICE: 'text-xs',
    },
    COMPACT: {
      TITLE: 'text-sm',
      SUBTITLE: 'text-xs',
      PRICE: 'text-sm',
    },
    STANDARD: {
      TITLE: 'text-base',
      SUBTITLE: 'text-sm',
      PRICE: 'text-base',
    },
    LARGE: {
      TITLE: 'text-lg',
      SUBTITLE: 'text-base',
      PRICE: 'text-lg',
    },
  },
} as const

// ============================================
// TRANSITION STYLES
// ============================================

export const TRANSITIONS = {
  // Standard transitions
  FAST: 'transition-all duration-150',
  NORMAL: 'transition-all duration-300',
  SLOW: 'transition-all duration-500',

  // Specific property transitions
  COLORS: 'transition-colors duration-300',
  TRANSFORM: 'transition-transform duration-300',
  OPACITY: 'transition-opacity duration-300',

  // Hover effects
  HOVER_SCALE: 'hover:scale-105',
  HOVER_SCALE_SMALL: 'hover:scale-102',
  HOVER_LIFT: 'hover:-translate-y-1',
} as const

// ============================================
// GRID LAYOUTS
// ============================================

export const GRID_LAYOUTS = {
  // NFT card grids by context
  COLLECTIONS: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3',
  PORTFOLIO: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4',
  BUNDLES: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3',
  FEATURED: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',

  // Generic responsive grids
  RESPONSIVE_2_4: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4',
  RESPONSIVE_1_3: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4',
} as const

// ============================================
// LOADING STATES
// ============================================

export const LOADING_STYLES = {
  // Spinner
  SPINNER: 'animate-spin',

  // Skeleton
  SKELETON: 'animate-pulse bg-muted/50',

  // Shimmer effect
  SHIMMER: 'animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent',
} as const

// ============================================
// BORDER STYLES
// ============================================

export const BORDER_STYLES = {
  // Card borders
  CARD: 'border border-border/50',
  CARD_HOVER: 'hover:border-primary/50',

  // Neon borders
  NEON_CYAN: 'border border-cyan-500/50',
  NEON_GREEN: 'border border-green-500/50',
  NEON_BLUE: 'border border-blue-500/50',

  // Rounded corners
  ROUNDED: {
    NONE: 'rounded-none',
    SM: 'rounded-sm',
    MD: 'rounded-md',
    LG: 'rounded-lg',
    XL: 'rounded-xl',
    FULL: 'rounded-full',
  },
} as const

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get button gradient class by action type
 */
export function getButtonGradient(action: 'buy' | 'rent' | 'swap' | 'sell' | 'view' = 'view'): string {
  switch (action) {
    case 'buy': return BUTTON_GRADIENTS.BUY
    case 'rent': return BUTTON_GRADIENTS.RENT
    case 'swap': return BUTTON_GRADIENTS.SWAP
    case 'sell': return BUTTON_GRADIENTS.SELL
    default: return BUTTON_GRADIENTS.NEUTRAL
  }
}

/**
 * Get text size classes for a card size
 */
export function getTextSizeByCard(cardSize: 'micro' | 'compact' | 'standard' | 'large' = 'standard') {
  return TEXT_STYLES.SIZE_BY_CARD[cardSize.toUpperCase() as keyof typeof TEXT_STYLES.SIZE_BY_CARD]
}

/**
 * Get card padding for a size
 */
export function getCardPadding(size: 'micro' | 'compact' | 'standard' | 'large' = 'standard'): string {
  return CARD_STYLES.PADDING[size.toUpperCase() as keyof typeof CARD_STYLES.PADDING]
}

/**
 * Combine button gradient with neon glow
 */
export function getActionButtonClass(action: 'buy' | 'rent' | 'swap' | 'sell' | 'view' = 'view'): string {
  return `${getButtonGradient(action)} ${NEON_GLOW.PRIMARY}`
}
