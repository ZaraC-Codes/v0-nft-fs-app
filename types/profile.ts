export type WalletType = 'embedded' | 'metamask' | 'glyph' | 'rabby' | 'coinbase' | 'external'

export interface WalletMetadata {
  address: string
  type: WalletType
  label?: string // Custom user label
  addedAt: Date
}

export interface SocialLinks {
  twitter?: string // Twitter/X handle (without @)
  discord?: string // Discord username
  website?: string // Personal website URL
  instagram?: string // Instagram handle (without @)
  telegram?: string // Telegram username (without @)
  github?: string // GitHub username
}

export interface UserProfile {
  id: string
  username: string
  email?: string
  bio?: string
  avatar?: string
  coverImage?: string
  walletAddress?: string // Primary/default wallet (for backwards compatibility)
  linkedWallets?: string[] // Deprecated: kept for migration, use wallets instead
  wallets?: WalletMetadata[] // New: all wallets with metadata
  activeWallet?: string // Currently selected wallet for transactions
  createdAt: Date
  updatedAt: Date
  verified: boolean

  // Social links
  socialLinks?: SocialLinks

  // OAuth metadata (auto-populated from social login)
  oauthProvider?: 'google' | 'discord' | 'twitter' | 'facebook' | 'apple'
  oauthProfilePicture?: string // Original OAuth profile picture URL

  // Social stats
  followersCount: number
  followingCount: number

  // Profile settings
  isPublic: boolean
  showWalletAddress: boolean
  showEmail: boolean
}

export interface NFTWatchlistItem {
  id: string
  userId: string
  contractAddress: string
  tokenId: string
  name: string
  image?: string
  collection: string
  addedAt: Date
  lastSalePrice?: number
  chainId: number
  listing?: NFTListing
  rarity?: string
}

export interface UserFollow {
  id: string
  followerId: string
  followingId: string
  createdAt: Date
}

export interface Portfolio {
  id: string
  userId: string
  nfts: PortfolioNFT[]
  totalValue: number
  lastUpdated: Date
}

export interface PortfolioNFT {
  contractAddress: string
  tokenId: string
  name: string
  image?: string
  collection: string
  acquiredAt: Date
  estimatedValue?: number
  rarity?: string
  lastSalePrice?: number
  listing?: NFTListing
  isBundle?: boolean
  bundleItems?: PortfolioNFT[]
  bundleCount?: number
  bundlePreviewImages?: Array<{ image: string; name: string; tokenId: string }>
  isWrapper?: boolean // Is this a rental wrapper NFT?
  wrapperId?: string // Wrapper token ID
  originalContract?: string // Original NFT contract address (if wrapper)
  originalTokenId?: string // Original NFT token ID (if wrapper)
  tbaAddress?: string // Token Bound Account address (if wrapper)
  rentalListing?: {
    pricePerDay: bigint
    minRentalDays: bigint
    maxRentalDays: bigint
    currentRenter: string
    expiresAt: bigint
  }
  chainId: number
  ownerWallet?: string // Which wallet owns this NFT
}

export type ListingType = 'sale' | 'rent' | 'swap' | 'none'

export interface NFTListing {
  type: ListingType
  listingId?: bigint // Marketplace listing ID for cancellation
  sale?: {
    price: number
    lastSalePrice?: number
    seller?: string
  }
  rent?: {
    pricePerDay: number
    minDuration?: number
    maxDuration?: number
    minDays?: number // Legacy
    maxDays?: number // Legacy
  }
  swap?: {
    wantedCollection: string
    wantedTokenId?: string // "Any" if not specified
    wantedTraits?: string[] // up to 3 traits, "Any" if not specified
  }
}

export interface Treasury {
  id: string
  userId: string
  name: string
  description?: string
  nfts: PortfolioNFT[]
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

export type ProfileTab = 'portfolio' | 'treasuries' | 'watchlist' | 'following' | 'followers'

export interface ProfileTabData {
  portfolio: PortfolioNFT[]
  treasuries: Treasury[]
  watchlist: NFTWatchlistItem[]
  following: UserProfile[]
  followers: UserProfile[]
}