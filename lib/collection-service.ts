/**
 * Collection Service
 * Fetches NFT collection data from ApeChain blockchain and Moralis API
 */

import { getContract, readContract, prepareEvent, getContractEvents, defineChain } from "thirdweb"
import { client } from "./thirdweb"
import { Collection, CollectionStats, CollectionWithStats } from "@/types/collection"
import collectionsData from "./collections-curated.json"
import { getAllListings } from "./marketplace"
import { getMoralisCollectionStats } from "./moralis-api"

const APECHAIN_ID = 33139

/**
 * Get all curated collections
 */
export async function getAllCollections(): Promise<Collection[]> {
  return collectionsData.collections as Collection[]
}

/**
 * Get collection by slug
 */
export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const collections = await getAllCollections()
  return collections.find(c => c.slug === slug) || null
}

/**
 * Get collection by contract address
 */
export async function getCollectionByAddress(contractAddress: string): Promise<Collection | null> {
  const collections = await getAllCollections()
  return collections.find(c => c.contractAddress.toLowerCase() === contractAddress.toLowerCase()) || null
}

/**
 * Get collection statistics from Moralis API (aggregated cross-marketplace data)
 * Falls back to blockchain data if Moralis fails
 */
export async function getCollectionStats(contractAddress: string): Promise<CollectionStats> {
  try {
    // Try Moralis API first for accurate cross-marketplace stats
    const moralisStats = await getMoralisCollectionStats(contractAddress, APECHAIN_ID)

    if (moralisStats) {
      console.log(`✅ Using Moralis stats for ${contractAddress}`)
      return {
        totalSupply: moralisStats.totalSupply,
        owners: moralisStats.owners,
        floorPrice: moralisStats.floorPrice ? (BigInt(Math.floor(moralisStats.floorPrice * 1e18))).toString() : null,
        floorPriceAPE: moralisStats.floorPrice,
        volume24h: (BigInt(Math.floor(moralisStats.volume24h * 1e18))).toString(),
        volume24hAPE: moralisStats.volume24h,
        volumeTotal: (BigInt(Math.floor(moralisStats.volumeTotal * 1e18))).toString(),
        volumeTotalAPE: moralisStats.volumeTotal,
        listedCount: moralisStats.listedCount,
        volumeChange24h: moralisStats.volumeChange24h,
      }
    }

    // Fallback to blockchain data
    console.log(`⚠️ Moralis unavailable, using blockchain data for ${contractAddress}`)
    const chain = defineChain(APECHAIN_ID)
    const contract = getContract({
      client,
      chain,
      address: contractAddress,
    })

    // Get total supply
    let totalSupply = 0
    try {
      const supply = await readContract({
        contract,
        method: "function totalSupply() view returns (uint256)",
        params: [],
      })
      totalSupply = Number(supply)
    } catch (error) {
      console.warn(`Could not fetch totalSupply for ${contractAddress}:`, error)
    }

    // Get floor price from marketplace listings
    const floorPrice = await getCollectionFloorPrice(contractAddress)

    // Get holder count
    const owners = await getCollectionHolderCount(contractAddress)

    // Get volume stats
    const { volume24h, volumeTotal, volumeChange24h } = await getCollectionVolume(contractAddress)

    // Get listed count
    const listedCount = await getCollectionListedCount(contractAddress)

    return {
      totalSupply,
      owners,
      floorPrice: floorPrice?.wei || null,
      floorPriceAPE: floorPrice?.ape || null,
      volume24h: volume24h.wei,
      volume24hAPE: volume24h.ape,
      volumeTotal: volumeTotal.wei,
      volumeTotalAPE: volumeTotal.ape,
      listedCount,
      volumeChange24h,
    }
  } catch (error) {
    console.error(`Failed to fetch collection stats for ${contractAddress}:`, error)
    return {
      totalSupply: 0,
      owners: 0,
      floorPrice: null,
      floorPriceAPE: null,
      volume24h: "0",
      volume24hAPE: 0,
      volumeTotal: "0",
      volumeTotalAPE: 0,
      listedCount: 0,
    }
  }
}

/**
 * Get collection floor price from marketplace listings
 */
export async function getCollectionFloorPrice(contractAddress: string): Promise<{ wei: string; ape: number } | null> {
  try {
    const listings = await getAllListings()

    // Filter listings for this collection
    const collectionListings = listings.filter(
      listing => listing.nftContract.toLowerCase() === contractAddress.toLowerCase()
    )

    if (collectionListings.length === 0) {
      return null
    }

    // Find lowest price
    const lowestListing = collectionListings.reduce((min, listing) => {
      const price = Number(listing.pricePerToken)
      const minPrice = Number(min.pricePerToken)
      return price < minPrice ? listing : min
    })

    const priceWei = lowestListing.pricePerToken.toString()
    const priceAPE = Number(priceWei) / 1e18

    return {
      wei: priceWei,
      ape: priceAPE
    }
  } catch (error) {
    console.error(`Failed to fetch floor price for ${contractAddress}:`, error)
    return null
  }
}

/**
 * Get collection holder count from Transfer events
 */
export async function getCollectionHolderCount(contractAddress: string): Promise<number> {
  try {
    const chain = defineChain(APECHAIN_ID)
    const contract = getContract({
      client,
      chain,
      address: contractAddress,
    })

    // Fetch all Transfer events
    const transferEvent = prepareEvent({
      signature: "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
    })

    const transferEvents = await getContractEvents({
      contract,
      events: [transferEvent],
    })

    // Track current owners
    const tokenOwners = new Map<string, string>() // tokenId -> owner address

    for (const event of transferEvents) {
      if (event.args?.tokenId && event.args?.to) {
        const tokenId = event.args.tokenId.toString()
        const owner = event.args.to.toLowerCase()
        tokenOwners.set(tokenId, owner)
      }
    }

    // Count unique owners (excluding zero address)
    const uniqueOwners = new Set<string>()
    for (const owner of tokenOwners.values()) {
      if (owner !== "0x0000000000000000000000000000000000000000") {
        uniqueOwners.add(owner)
      }
    }

    return uniqueOwners.size
  } catch (error) {
    console.error(`Failed to fetch holder count for ${contractAddress}:`, error)
    return 0
  }
}

/**
 * Get collection volume from marketplace Sale events
 */
export async function getCollectionVolume(contractAddress: string): Promise<{
  volume24h: { wei: string; ape: number }
  volumeTotal: { wei: string; ape: number }
  volumeChange24h?: number
}> {
  try {
    const marketplaceAddress = process.env.NEXT_PUBLIC_FORTUNA_MARKETPLACE_ADDRESS
    if (!marketplaceAddress) {
      throw new Error("Marketplace address not configured")
    }

    const chain = defineChain(APECHAIN_ID)
    const marketplaceContract = getContract({
      client,
      chain,
      address: marketplaceAddress,
    })

    // Fetch Sale events
    const saleEvent = prepareEvent({
      signature: "event Sale(uint256 indexed listingId, address indexed buyer, address indexed seller, address nftContract, uint256 tokenId, uint256 quantity, uint256 totalPrice, uint256 platformFee)"
    })

    const saleEvents = await getContractEvents({
      contract: marketplaceContract,
      events: [saleEvent],
    })

    // Filter for this collection
    const collectionSales = saleEvents.filter(
      event => event.args?.nftContract?.toLowerCase() === contractAddress.toLowerCase()
    )

    // Calculate total volume
    let totalVolumeWei = BigInt(0)
    let volume24hWei = BigInt(0)

    const now = Math.floor(Date.now() / 1000)
    const oneDayAgo = now - 86400

    for (const sale of collectionSales) {
      const price = BigInt(sale.args?.totalPrice || 0)
      totalVolumeWei += price

      // Check if sale is within last 24 hours
      const saleTime = Number(sale.blockTimestamp || 0)
      if (saleTime >= oneDayAgo) {
        volume24hWei += price
      }
    }

    return {
      volume24h: {
        wei: volume24hWei.toString(),
        ape: Number(volume24hWei) / 1e18
      },
      volumeTotal: {
        wei: totalVolumeWei.toString(),
        ape: Number(totalVolumeWei) / 1e18
      }
    }
  } catch (error) {
    console.error(`Failed to fetch volume for ${contractAddress}:`, error)
    return {
      volume24h: { wei: "0", ape: 0 },
      volumeTotal: { wei: "0", ape: 0 }
    }
  }
}

/**
 * Get count of listed NFTs for collection
 */
export async function getCollectionListedCount(contractAddress: string): Promise<number> {
  try {
    const listings = await getAllListings()
    return listings.filter(
      listing => listing.nftContract.toLowerCase() === contractAddress.toLowerCase()
    ).length
  } catch (error) {
    console.error(`Failed to fetch listed count for ${contractAddress}:`, error)
    return 0
  }
}

/**
 * Get collection with stats
 */
export async function getCollectionWithStats(slug: string): Promise<CollectionWithStats | null> {
  const collection = await getCollectionBySlug(slug)
  if (!collection) return null

  const stats = await getCollectionStats(collection.contractAddress)

  return {
    ...collection,
    stats
  }
}

/**
 * Get collection slug by collection name
 * Returns the slug if found in curated collections, null otherwise
 */
export function getCollectionSlugByName(collectionName: string): string | null {
  if (!collectionName) return null

  const collections = collectionsData.collections as Collection[]
  const collection = collections.find(c =>
    c.name.toLowerCase() === collectionName.toLowerCase()
  )
  return collection?.slug || null
}

/**
 * Get NFTs from a collection with pagination
 */
export async function getCollectionNFTs(
  contractAddress: string,
  page: number = 1,
  limit: number = 50
): Promise<any[]> {
  try {
    const chain = defineChain(APECHAIN_ID)
    const contract = getContract({
      client,
      chain,
      address: contractAddress,
    })

    // Fetch Transfer events to get all tokenIds
    const transferEvent = prepareEvent({
      signature: "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
    })

    const transferEvents = await getContractEvents({
      contract,
      events: [transferEvent],
    })

    // Get unique tokenIds
    const tokenIds = new Set<string>()
    for (const event of transferEvents) {
      if (event.args?.tokenId) {
        tokenIds.add(event.args.tokenId.toString())
      }
    }

    // Convert to array and paginate
    const allTokenIds = Array.from(tokenIds)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedTokenIds = allTokenIds.slice(startIndex, endIndex)

    // Fetch metadata for each NFT using ThirdWeb
    const nfts = []
    for (const tokenId of paginatedTokenIds) {
      try {
        // Fetch token URI
        const tokenURI = await readContract({
          contract,
          method: "function tokenURI(uint256 tokenId) view returns (string)",
          params: [BigInt(tokenId)],
        })

        // Fetch metadata from URI
        let metadata: any = {}
        try {
          if (tokenURI) {
            const metadataUrl = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/')
            const response = await fetch(metadataUrl)
            if (response.ok) {
              metadata = await response.json()
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch metadata for token ${tokenId}:`, error)
        }

        nfts.push({
          contractAddress,
          tokenId,
          name: metadata.name || `Token #${tokenId}`,
          image: metadata.image ? metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/') : '',
          description: metadata.description || '',
          attributes: metadata.attributes || [],
        })
      } catch (error) {
        console.warn(`Failed to fetch NFT ${tokenId}:`, error)
      }
    }

    return nfts
  } catch (error) {
    console.error(`Failed to fetch collection NFTs for ${contractAddress}:`, error)
    return []
  }
}
