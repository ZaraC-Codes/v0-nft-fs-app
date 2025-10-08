/**
 * Collection Types
 * TypeScript interfaces for NFT collections on ApeChain
 */

export interface Collection {
  contractAddress: string
  slug: string
  name: string
  symbol: string
  description: string
  bannerImage: string
  logo: string
  verified: boolean
  website?: string
  twitter?: string
  discord?: string
  category?: string
  chainId: number
}

export interface CollectionStats {
  totalSupply: number
  owners: number
  floorPrice: string | null
  floorPriceAPE: number | null
  volume24h: string
  volume24hAPE: number
  volumeTotal: string
  volumeTotalAPE: number
  listedCount: number
  volumeChange24h?: number
}

export interface CollectionWithStats extends Collection {
  stats: CollectionStats
}

export interface CollectionMetadata {
  name: string
  symbol: string
  description: string
  image: string
  banner_image?: string
  external_link?: string
}
