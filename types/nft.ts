/**
 * Extended NFT types for the unified card component system
 * Extends the base PortfolioNFT type with UI-specific fields
 */

import type { PortfolioNFT, NFTListing } from './profile'

/**
 * NFT Type Discriminator
 * Used for runtime type checking and rendering the correct card variant
 */
export type NFTCardType = 'individual' | 'bundle' | 'rental_wrapper'

/**
 * Card size variants for responsive grids
 */
export type CardSize = 'compact' | 'standard' | 'large'

/**
 * Extended NFT Card Data
 * Adds UI-specific fields to base PortfolioNFT
 */
export interface NFTCardData extends PortfolioNFT {
  // UI State
  isSelected?: boolean        // For multi-select grids
  isThumbnail?: boolean       // For bundle thumbnail selection
  isWatchlisted?: boolean     // Watchlist status

  // Derived Type
  cardType: NFTCardType       // Auto-detected from isBundle/isWrapper flags

  // Owner Context
  isOwnedByViewer: boolean    // Is viewer the owner?

  // Action Availability
  canList: boolean            // Can create listing?
  canBuy: boolean             // Can purchase?
  canRent: boolean            // Can rent?
  canSwap: boolean            // Can propose swap?
  canUnwrap: boolean          // Can unwrap bundle/rental?
}

/**
 * Available NFT Actions
 */
export type NFTAction =
  | 'view'
  | 'buy'
  | 'rent'
  | 'swap'
  | 'list_sale'
  | 'list_rent'
  | 'list_swap'
  | 'unwrap_bundle'
  | 'unwrap_rental'
  | 'cancel_listing'
  | 'edit_price'

/**
 * Action Button Configuration
 */
export interface NFTActionButton {
  action: NFTAction
  label: string
  icon: React.ComponentType<{ className?: string }>
  className: string  // Gradient classes
  show: boolean      // Conditional display
  disabled?: boolean
  priority: number   // Display order (lower = higher priority)
}

/**
 * Grid Responsive Breakpoints
 * Optimized for viewing bundle thumbnails and action buttons
 */
export interface GridBreakpoints {
  xs: number   // < 640px
  sm: number   // 640-768px
  md: number   // 768-1024px
  lg: number   // 1024-1280px
  xl: number   // 1280px+
}

export const DEFAULT_GRID_BREAKPOINTS: GridBreakpoints = {
  xs: 2,   // 2 columns on extra small phones (~170px cards)
  sm: 3,   // 3 columns on phones (~210px cards)
  md: 4,   // 4 columns on tablets (~190px cards)
  lg: 5,   // 5 columns on laptops (~200px cards)
  xl: 6,   // 6 columns on desktop (~210px cards)
}

/**
 * Type guard: Check if NFT is an individual NFT
 */
export function isIndividualNFT(nft: PortfolioNFT): boolean {
  return !nft.isBundle && !nft.isWrapper
}

/**
 * Type guard: Check if NFT is a bundle
 */
export function isBundleNFT(nft: PortfolioNFT): boolean {
  return nft.isBundle === true && typeof nft.bundleCount === 'number'
}

/**
 * Type guard: Check if NFT is a rental wrapper
 */
export function isRentalWrapperNFT(nft: PortfolioNFT): boolean {
  return nft.isWrapper === true && typeof nft.wrapperId === 'string'
}

/**
 * Detect NFT card type from PortfolioNFT
 */
export function detectNFTCardType(nft: PortfolioNFT): NFTCardType {
  if (isBundleNFT(nft)) return 'bundle'
  if (isRentalWrapperNFT(nft)) return 'rental_wrapper'
  return 'individual'
}
