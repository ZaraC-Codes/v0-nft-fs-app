/**
 * Collection Service
 * Fetches NFT collection data from ApeChain blockchain and GoldRush API
 */

import { getContract, readContract, prepareEvent, getContractEvents, defineChain } from "thirdweb"
import { client } from "./thirdweb"
import { Collection, CollectionStats, CollectionWithStats } from "@/types/collection"
import collectionsData from "./collections-curated.json"
import { getAllListings } from "./marketplace"
import { getGoldRushCollectionStats } from "./goldrush-api"
import { CHAIN_IDS } from "./constants"

const APECHAIN_ID = CHAIN_IDS.APECHAIN_MAINNET

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
 * Get collection statistics from GoldRush API (aggregated cross-marketplace data)
 * Falls back to blockchain data if GoldRush fails
 */
export async function getCollectionStats(contractAddress: string): Promise<CollectionStats> {
  try {
    // Try GoldRush API first for accurate cross-marketplace stats
    const goldrushStats = await getGoldRushCollectionStats(contractAddress)

    if (goldrushStats && goldrushStats.totalSupply > 0) {
      console.log(`✅ Using GoldRush stats for ${contractAddress}`)
      return {
        totalSupply: goldrushStats.totalSupply,
        owners: goldrushStats.owners,
        floorPrice: goldrushStats.floorPrice ? (BigInt(Math.floor(goldrushStats.floorPrice * 1e18))).toString() : null,
        floorPriceAPE: goldrushStats.floorPrice,
        volume24h: (BigInt(Math.floor(goldrushStats.volume24h * 1e18))).toString(),
        volume24hAPE: goldrushStats.volume24h,
        volumeTotal: (BigInt(Math.floor(goldrushStats.volumeTotal * 1e18))).toString(),
        volumeTotalAPE: goldrushStats.volumeTotal,
        listedCount: goldrushStats.listedCount,
        volumeChange24h: goldrushStats.volumeChange24h,
      }
    }

    // Fallback to blockchain data
    console.log(`⚠️ GoldRush unavailable, using blockchain data for ${contractAddress}`)
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
 * Fetch a single NFT's metadata with timeout protection
 */
async function fetchSingleNFTMetadata(
  contract: any,
  contractAddress: string,
  tokenId: string
): Promise<any> {
  // Fetch token URI from blockchain
  const tokenURI = await readContract({
    contract,
    method: "function tokenURI(uint256 tokenId) view returns (string)",
    params: [BigInt(tokenId)],
  })

  // Fetch metadata from IPFS/HTTP
  let metadata: any = {}
  if (tokenURI) {
    const metadataUrl = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/')

    // Add timeout protection for IPFS fetch
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000) // 4s for IPFS

    try {
      const response = await fetch(metadataUrl, {
        signal: controller.signal,
        cache: 'force-cache' // Enable browser caching
      })
      clearTimeout(timeoutId)

      if (response.ok) {
        metadata = await response.json()
      }
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  return {
    contractAddress,
    tokenId,
    name: metadata.name || `Token #${tokenId}`,
    image: metadata.image ? metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/') : '',
    description: metadata.description || '',
    attributes: metadata.attributes || [],
    isPlaceholder: false
  }
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

    // Fetch metadata for each NFT using ThirdWeb (with parallel batching)
    const BATCH_SIZE = 10 // Process 10 NFTs at a time to avoid overwhelming network
    const nfts: any[] = []

    // Process in batches for controlled concurrency
    for (let i = 0; i < paginatedTokenIds.length; i += BATCH_SIZE) {
      const batch = paginatedTokenIds.slice(i, i + BATCH_SIZE)

      // Fetch all NFTs in this batch in parallel
      const batchPromises = batch.map(async (tokenId) => {
        try {
          // Fetch with 5-second timeout protection
          const nftData = await Promise.race([
            fetchSingleNFTMetadata(contract, contractAddress, tokenId),
            new Promise<null>((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), 5000)
            )
          ])

          return nftData
        } catch (error) {
          console.warn(`Failed to fetch NFT ${tokenId}:`, error)
          // Return placeholder NFT for failed fetches
          return {
            contractAddress,
            tokenId,
            name: `Token #${tokenId}`,
            image: '/placeholder.svg',
            description: 'Metadata temporarily unavailable',
            attributes: [],
            isPlaceholder: true
          }
        }
      })

      // Wait for entire batch to complete
      const batchResults = await Promise.allSettled(batchPromises)

      // Process results
      for (const result of batchResults) {
        if (result.status === 'fulfilled' && result.value) {
          nfts.push(result.value)
        }
      }
    }

    return nfts
  } catch (error) {
    console.error(`Failed to fetch collection NFTs for ${contractAddress}:`, error)
    return []
  }
}

/**
 * Get bundles for a collection
 * Returns empty array for now - bundles are a separate feature from individual NFTs
 */
export async function getCollectionBundles(contractAddress: string): Promise<any[]> {
  // Bundles are not shown on collection pages currently
  // This function exists to prevent errors but returns empty array
  return []
}

/**
 * Get activity/transactions for a collection
 */
export async function getCollectionActivity(contractAddress: string): Promise<any[]> {
  try {
    const apeChainConfig = defineChain(APECHAIN_ID)
    const contract = getContract({
      client,
      chain: apeChainConfig,
      address: contractAddress,
    })

    const transferEvent = prepareEvent({
      signature: "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    })

    const transferEvents = await getContractEvents({
      contract,
      events: [transferEvent],
    })

    // Map to activity format
    return transferEvents.map((event) => ({
      type: event.args?.from === '0x0000000000000000000000000000000000000000' ? 'mint' : 'transfer',
      from: event.args?.from,
      to: event.args?.to,
      tokenId: event.args?.tokenId?.toString(),
      transactionHash: event.transactionHash,
      blockNumber: event.blockNumber,
      timestamp: new Date(), // Would need to fetch block timestamp for accurate time
    }))
  } catch (error) {
    console.error(`Failed to fetch collection activity for ${contractAddress}:`, error)
    return []
  }
}
