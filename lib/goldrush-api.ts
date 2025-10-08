/**
 * GoldRush API Integration (formerly Covalent)
 * Provides cross-marketplace NFT data aggregation for ApeChain
 * Docs: https://goldrush.dev/docs/goldrush-foundational-api/overview
 */

const GOLDRUSH_API_KEY = process.env.NEXT_PUBLIC_GOLDRUSH_API_KEY || ""
const GOLDRUSH_BASE_URL = "https://api.covalenthq.com/v1"

interface GoldRushHeaders {
  Authorization: string
  "Content-Type": string
}

/**
 * Get collection metadata and stats from GoldRush
 */
export async function getGoldRushCollectionStats(contractAddress: string, chainName: string = "apechain-mainnet") {
  try {
    if (!GOLDRUSH_API_KEY) {
      console.warn("GoldRush API key not configured")
      return null
    }

    const headers: GoldRushHeaders = {
      Authorization: `Bearer ${GOLDRUSH_API_KEY}`,
      "Content-Type": "application/json"
    }

    // Get NFT metadata for the collection
    // Note: GoldRush doesn't have a direct "collection stats" endpoint like Reservoir
    // We need to aggregate data from individual NFT queries
    const response = await fetch(
      `${GOLDRUSH_BASE_URL}/${chainName}/nft/${contractAddress}/metadata/`,
      { headers }
    )

    if (!response.ok) {
      console.error(`GoldRush API error: ${response.status}`)
      return null
    }

    const data = await response.json()

    // GoldRush returns collection-level data
    const collection = data.data?.items?.[0]

    if (!collection) {
      return null
    }

    return {
      totalSupply: collection.contract_metadata?.total_supply ? parseInt(collection.contract_metadata.total_supply) : 0,
      owners: 0, // Not available from metadata endpoint
      floorPrice: null, // Not available directly
      floorPriceUSD: null,
      listedCount: 0, // Not available directly
      volume24h: 0, // Not available directly
      volumeTotal: 0, // Not available directly
      volumeChange24h: 0,
    }
  } catch (error) {
    console.error("Error fetching GoldRush collection stats:", error)
    return null
  }
}

/**
 * Get NFTs for a specific wallet address
 */
export async function getGoldRushNFTs(
  walletAddress: string,
  chainName: string = "apechain-mainnet",
  contractAddress?: string
) {
  try {
    if (!GOLDRUSH_API_KEY) {
      console.warn("GoldRush API key not configured")
      return []
    }

    const headers: GoldRushHeaders = {
      Authorization: `Bearer ${GOLDRUSH_API_KEY}`,
      "Content-Type": "application/json"
    }

    let url = `${GOLDRUSH_BASE_URL}/${chainName}/address/${walletAddress}/balances_nft/`
    if (contractAddress) {
      url += `?contract-address=${contractAddress}`
    }

    const response = await fetch(url, { headers })

    if (!response.ok) {
      console.error(`GoldRush API error: ${response.status}`)
      return []
    }

    const data = await response.json()
    return data.data?.items || []
  } catch (error) {
    console.error("Error fetching GoldRush NFTs:", error)
    return []
  }
}

/**
 * Get NFT transfers (activity) for a specific token
 */
export async function getGoldRushTokenActivity(
  contractAddress: string,
  tokenId: string,
  chainName: string = "apechain-mainnet"
) {
  try {
    if (!GOLDRUSH_API_KEY) {
      console.warn("GoldRush API key not configured")
      return []
    }

    const headers: GoldRushHeaders = {
      Authorization: `Bearer ${GOLDRUSH_API_KEY}`,
      "Content-Type": "application/json"
    }

    // Get token transfers
    const response = await fetch(
      `${GOLDRUSH_BASE_URL}/${chainName}/nft/${contractAddress}/token_id/${tokenId}/transfers/`,
      { headers }
    )

    if (!response.ok) {
      console.error(`GoldRush API error: ${response.status}`)
      return []
    }

    const data = await response.json()
    return data.data?.items || []
  } catch (error) {
    console.error("Error fetching GoldRush token activity:", error)
    return []
  }
}

/**
 * Get NFT metadata for a specific token
 */
export async function getGoldRushNFTMetadata(
  contractAddress: string,
  tokenId: string,
  chainName: string = "apechain-mainnet"
) {
  try {
    if (!GOLDRUSH_API_KEY) {
      console.warn("GoldRush API key not configured")
      return null
    }

    const headers: GoldRushHeaders = {
      Authorization: `Bearer ${GOLDRUSH_API_KEY}`,
      "Content-Type": "application/json"
    }

    const response = await fetch(
      `${GOLDRUSH_BASE_URL}/${chainName}/nft/${contractAddress}/metadata/${tokenId}/`,
      { headers }
    )

    if (!response.ok) {
      console.error(`GoldRush API error: ${response.status}`)
      return null
    }

    const data = await response.json()
    return data.data?.items?.[0] || null
  } catch (error) {
    console.error("Error fetching GoldRush NFT metadata:", error)
    return null
  }
}

/**
 * Get transaction details
 */
export async function getGoldRushTransaction(
  txHash: string,
  chainName: string = "apechain-mainnet"
) {
  try {
    if (!GOLDRUSH_API_KEY) {
      console.warn("GoldRush API key not configured")
      return null
    }

    const headers: GoldRushHeaders = {
      Authorization: `Bearer ${GOLDRUSH_API_KEY}`,
      "Content-Type": "application/json"
    }

    const response = await fetch(
      `${GOLDRUSH_BASE_URL}/${chainName}/transaction_v2/${txHash}/`,
      { headers }
    )

    if (!response.ok) {
      console.error(`GoldRush API error: ${response.status}`)
      return null
    }

    const data = await response.json()
    return data.data?.items?.[0] || null
  } catch (error) {
    console.error("Error fetching GoldRush transaction:", error)
    return null
  }
}
