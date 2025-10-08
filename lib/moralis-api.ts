/**
 * Moralis API Integration
 * Provides cross-marketplace NFT data aggregation
 * Replaces Reservoir which shut down October 2025
 * Docs: https://docs.moralis.com/web3-data-api/evm/nft-api
 */

const MORALIS_API_KEY = process.env.NEXT_PUBLIC_MORALIS_API_KEY || ""
const MORALIS_BASE_URL = "https://deep-index.moralis.io/api/v2.2"

interface MoralisHeaders {
  "X-API-Key": string
  "Content-Type": string
  accept: string
}

/**
 * Get collection statistics from Moralis
 * Includes floor price, volume, supply, owners across ALL marketplaces
 */
export async function getMoralisCollectionStats(contractAddress: string, chainId: number = 33139) {
  try {
    if (!MORALIS_API_KEY) {
      console.warn("Moralis API key not configured")
      return null
    }

    const headers: MoralisHeaders = {
      "X-API-Key": MORALIS_API_KEY,
      "Content-Type": "application/json",
      "accept": "application/json"
    }

    // Convert chainId to Moralis chain format (hex)
    const chain = `0x${chainId.toString(16)}`

    // Get collection metadata
    const metadataResponse = await fetch(
      `${MORALIS_BASE_URL}/nft/${contractAddress}/metadata?chain=${chain}`,
      { headers }
    )

    if (!metadataResponse.ok) {
      console.error(`Moralis API error: ${metadataResponse.status}`)
      return null
    }

    const metadata = await metadataResponse.json()

    // Get collection stats (floor price, volume, etc.)
    const statsResponse = await fetch(
      `${MORALIS_BASE_URL}/nft/${contractAddress}/stats?chain=${chain}`,
      { headers }
    )

    let stats = null
    if (statsResponse.ok) {
      stats = await statsResponse.json()
    }

    return {
      floorPrice: stats?.floor_price || null,
      floorPriceUSD: stats?.floor_price_usd || null,
      totalSupply: metadata?.total_supply ? parseInt(metadata.total_supply) : 0,
      owners: stats?.total_owners || 0,
      listedCount: stats?.total_listed || 0,
      volume24h: stats?.volume_24h || 0,
      volumeTotal: stats?.total_volume || 0,
      volumeChange24h: stats?.volume_24h_change_percentage || 0,
    }
  } catch (error) {
    console.error("Error fetching Moralis collection stats:", error)
    return null
  }
}

/**
 * Get NFT transfers (activity) for a specific token
 */
export async function getMoralisTokenActivity(
  contractAddress: string,
  tokenId: string,
  chainId: number = 33139,
  limit: number = 50
) {
  try {
    if (!MORALIS_API_KEY) {
      console.warn("Moralis API key not configured")
      return []
    }

    const headers: MoralisHeaders = {
      "X-API-Key": MORALIS_API_KEY,
      "Content-Type": "application/json",
      "accept": "application/json"
    }

    // Convert chainId to Moralis chain format (hex)
    const chain = `0x${chainId.toString(16)}`

    // Get NFT transfers
    const response = await fetch(
      `${MORALIS_BASE_URL}/nft/${contractAddress}/${tokenId}/transfers?chain=${chain}&limit=${limit}`,
      { headers }
    )

    if (!response.ok) {
      console.error(`Moralis API error: ${response.status}`)
      return []
    }

    const data = await response.json()
    return data.result || []
  } catch (error) {
    console.error("Error fetching Moralis token activity:", error)
    return []
  }
}

/**
 * Get collection transfers/activity
 */
export async function getMoralisCollectionActivity(
  contractAddress: string,
  chainId: number = 33139,
  limit: number = 50
) {
  try {
    if (!MORALIS_API_KEY) {
      console.warn("Moralis API key not configured")
      return []
    }

    const headers: MoralisHeaders = {
      "X-API-Key": MORALIS_API_KEY,
      "Content-Type": "application/json",
      "accept": "application/json"
    }

    // Convert chainId to Moralis chain format (hex)
    const chain = `0x${chainId.toString(16)}`

    // Get collection transfers
    const response = await fetch(
      `${MORALIS_BASE_URL}/nft/${contractAddress}/transfers?chain=${chain}&limit=${limit}`,
      { headers }
    )

    if (!response.ok) {
      console.error(`Moralis API error: ${response.status}`)
      return []
    }

    const data = await response.json()
    return data.result || []
  } catch (error) {
    console.error("Error fetching Moralis collection activity:", error)
    return []
  }
}

/**
 * Get lowest price listings for a collection
 */
export async function getMoralisCollectionListings(
  contractAddress: string,
  chainId: number = 33139,
  limit: number = 50
) {
  try {
    if (!MORALIS_API_KEY) {
      console.warn("Moralis API key not configured")
      return []
    }

    const headers: MoralisHeaders = {
      "X-API-Key": MORALIS_API_KEY,
      "Content-Type": "application/json",
      "accept": "application/json"
    }

    // Convert chainId to Moralis chain format (hex)
    const chain = `0x${chainId.toString(16)}`

    // Get lowest listings
    const response = await fetch(
      `${MORALIS_BASE_URL}/nft/${contractAddress}/lowestprice?chain=${chain}&marketplace=opensea&limit=${limit}`,
      { headers }
    )

    if (!response.ok) {
      console.error(`Moralis API error: ${response.status}`)
      return []
    }

    const data = await response.json()
    return data.result || []
  } catch (error) {
    console.error("Error fetching Moralis collection listings:", error)
    return []
  }
}

/**
 * Get specific NFT metadata with market data
 */
export async function getMoralisNFTData(
  contractAddress: string,
  tokenId: string,
  chainId: number = 33139
) {
  try {
    if (!MORALIS_API_KEY) {
      console.warn("Moralis API key not configured")
      return null
    }

    const headers: MoralisHeaders = {
      "X-API-Key": MORALIS_API_KEY,
      "Content-Type": "application/json",
      "accept": "application/json"
    }

    // Convert chainId to Moralis chain format (hex)
    const chain = `0x${chainId.toString(16)}`

    // Get NFT metadata
    const response = await fetch(
      `${MORALIS_BASE_URL}/nft/${contractAddress}/${tokenId}?chain=${chain}&format=decimal&normalizeMetadata=true`,
      { headers }
    )

    if (!response.ok) {
      console.error(`Moralis API error: ${response.status}`)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching Moralis NFT data:", error)
    return null
  }
}
