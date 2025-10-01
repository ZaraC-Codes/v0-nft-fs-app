export interface UserProfile {
  id: string
  username: string
  email?: string
  bio?: string
  avatar?: string
  coverImage?: string
  walletAddress?: string // Primary/default wallet
  linkedWallets?: string[] // Additional linked wallets
  activeWallet?: string // Currently selected wallet for transactions
  createdAt: Date
  updatedAt: Date
  verified: boolean

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
  chainId: number
  ownerWallet?: string // Which wallet owns this NFT
}

export type ListingType = 'sale' | 'rent' | 'swap' | 'none'

export interface NFTListing {
  type: ListingType
  sale?: {
    price: number
    lastSalePrice?: number
  }
  rent?: {
    pricePerDay: number
    minDays: number
    maxDays: number
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