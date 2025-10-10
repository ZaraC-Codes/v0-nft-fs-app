/**
 * NFT Action Button Configurations
 * Single source of truth for action button rendering on NFT cards
 *
 * IMPORTANT: All action buttons should use these configurations
 * This ensures consistency across all NFT card types
 */

import { ShoppingCart, Calendar, ArrowLeftRight, Eye, Edit, X, DollarSign } from 'lucide-react'
import { getActionButtonClass } from './ui-classes'
import type { NFTAction } from '@/types/nft'
import type { PortfolioNFT } from '@/types/profile'

// ============================================
// ACTION BUTTON CONFIGURATION
// ============================================

export interface ActionButtonConfig {
  action: NFTAction
  label: string | ((nft: PortfolioNFT) => string)
  icon: typeof ShoppingCart // Lucide icon component type
  className: string
  show: (nft: PortfolioNFT, isOwner: boolean) => boolean
  priority: number // Lower = higher priority (shown first)
}

/**
 * All available NFT action buttons
 * Priority determines display order (1 = highest priority)
 */
export const NFT_ACTION_BUTTONS: Record<NFTAction, ActionButtonConfig> = {
  // Primary actions (for non-owners)
  buy: {
    action: 'buy',
    label: (nft) => `Buy for ${nft.listing?.sale?.price || '0'} APE`,
    icon: ShoppingCart,
    className: getActionButtonClass('buy'),
    show: (nft, isOwner) => nft.listing?.type === 'sale' && !isOwner,
    priority: 1,
  },

  rent: {
    action: 'rent',
    label: (nft) => `Rent ${nft.listing?.rent?.pricePerDay || '0'} APE/Day`,
    icon: Calendar,
    className: getActionButtonClass('rent'),
    show: (nft, isOwner) => nft.listing?.type === 'rent' && !isOwner,
    priority: 2,
  },

  swap: {
    action: 'swap',
    label: 'Propose Swap',
    icon: ArrowLeftRight,
    className: getActionButtonClass('swap'),
    show: (nft, isOwner) => nft.listing?.type === 'swap' && !isOwner,
    priority: 3,
  },

  // Owner actions (for listing NFTs)
  list_sale: {
    action: 'list_sale',
    label: 'List for Sale',
    icon: DollarSign,
    className: getActionButtonClass('sell'),
    show: (nft, isOwner) => isOwner && (!nft.listing || nft.listing.type === 'none'),
    priority: 4,
  },

  list_rent: {
    action: 'list_rent',
    label: 'List for Rent',
    icon: Calendar,
    className: getActionButtonClass('rent'),
    show: (nft, isOwner) => isOwner && (!nft.listing || nft.listing.type === 'none'),
    priority: 5,
  },

  list_swap: {
    action: 'list_swap',
    label: 'List for Swap',
    icon: ArrowLeftRight,
    className: getActionButtonClass('swap'),
    show: (nft, isOwner) => isOwner && (!nft.listing || nft.listing.type === 'none'),
    priority: 6,
  },

  // Listing management (for owners with active listings)
  edit_price: {
    action: 'edit_price',
    label: 'Edit Price',
    icon: Edit,
    className: getActionButtonClass('view'),
    show: (nft, isOwner) => isOwner && !!nft.listing && nft.listing.type !== 'none',
    priority: 7,
  },

  cancel_listing: {
    action: 'cancel_listing',
    label: 'Cancel Listing',
    icon: X,
    className: getActionButtonClass('view'),
    show: (nft, isOwner) => isOwner && !!nft.listing && nft.listing.type !== 'none',
    priority: 8,
  },

  // Special actions
  unwrap_bundle: {
    action: 'unwrap_bundle',
    label: 'Unwrap Bundle',
    icon: ArrowLeftRight,
    className: getActionButtonClass('view'),
    show: (nft, isOwner) => isOwner && nft.isBundle === true,
    priority: 9,
  },

  unwrap_rental: {
    action: 'unwrap_rental',
    label: 'Return NFT',
    icon: ArrowLeftRight,
    className: getActionButtonClass('view'),
    show: (nft, isOwner) => isOwner && nft.isWrapper === true,
    priority: 10,
  },

  // Default view action (lowest priority)
  view: {
    action: 'view',
    label: 'View Details',
    icon: Eye,
    className: getActionButtonClass('view'),
    show: () => true, // Always available as fallback
    priority: 99,
  },
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get all visible action buttons for an NFT
 * Returns buttons sorted by priority (highest first)
 */
export function getVisibleActions(
  nft: PortfolioNFT,
  isOwner: boolean
): ActionButtonConfig[] {
  return Object.values(NFT_ACTION_BUTTONS)
    .filter((config) => config.show(nft, isOwner))
    .sort((a, b) => a.priority - b.priority)
}

/**
 * Get the primary action button for an NFT
 * Returns the highest priority visible action
 */
export function getPrimaryAction(
  nft: PortfolioNFT,
  isOwner: boolean
): ActionButtonConfig {
  const actions = getVisibleActions(nft, isOwner)
  return actions[0] || NFT_ACTION_BUTTONS.view
}

/**
 * Get label text for an action button
 * Handles both static strings and dynamic label functions
 */
export function getActionLabel(
  config: ActionButtonConfig,
  nft: PortfolioNFT
): string {
  return typeof config.label === 'function'
    ? config.label(nft)
    : config.label
}

/**
 * Check if NFT has any listing
 */
export function hasListing(nft: PortfolioNFT): boolean {
  return !!nft.listing && nft.listing.type !== 'none'
}

/**
 * Check if NFT is available for purchase
 */
export function isAvailableForPurchase(nft: PortfolioNFT): boolean {
  return nft.listing?.type === 'sale'
}

/**
 * Check if NFT is available for rent
 */
export function isAvailableForRent(nft: PortfolioNFT): boolean {
  return nft.listing?.type === 'rent'
}

/**
 * Check if NFT is available for swap
 */
export function isAvailableForSwap(nft: PortfolioNFT): boolean {
  return nft.listing?.type === 'swap'
}

/**
 * Get listing price display text
 */
export function getListingPriceText(nft: PortfolioNFT): string | null {
  if (!nft.listing) return null

  switch (nft.listing.type) {
    case 'sale':
      return `${nft.listing.sale.price} APE`
    case 'rent':
      return `${nft.listing.rent.pricePerDay} APE/Day`
    case 'swap':
      return 'Open for Swap'
    default:
      return null
  }
}

/**
 * Get listing badge text (short version for badges)
 */
export function getListingBadgeText(nft: PortfolioNFT): string | null {
  if (!nft.listing) return null

  switch (nft.listing.type) {
    case 'sale':
      return 'For Sale'
    case 'rent':
      return 'For Rent'
    case 'swap':
      return 'For Swap'
    default:
      return null
  }
}

// ============================================
// ACTION CATEGORIES
// ============================================

/**
 * Group actions by category for UI display
 */
export const ACTION_CATEGORIES = {
  // Actions available to non-owners
  MARKETPLACE: ['buy', 'rent', 'swap'] as NFTAction[],

  // Actions available to owners for creating listings
  CREATE_LISTING: ['list_sale', 'list_rent', 'list_swap'] as NFTAction[],

  // Actions available to owners for managing existing listings
  MANAGE_LISTING: ['edit_price', 'cancel_listing'] as NFTAction[],

  // Special actions for bundles and rentals
  SPECIAL: ['unwrap_bundle', 'unwrap_rental'] as NFTAction[],

  // Default action
  DEFAULT: ['view'] as NFTAction[],
} as const

/**
 * Get actions by category
 */
export function getActionsByCategory(
  category: keyof typeof ACTION_CATEGORIES
): ActionButtonConfig[] {
  const actionKeys = ACTION_CATEGORIES[category]
  return actionKeys.map((key) => NFT_ACTION_BUTTONS[key])
}
