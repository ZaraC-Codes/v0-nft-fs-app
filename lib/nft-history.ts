/**
 * NFT History Service
 * Fetches complete blockchain activity for individual NFTs
 * Uses Moralis API for comprehensive cross-marketplace activity
 * Falls back to blockchain events if Moralis unavailable
 */

import { getContract, prepareEvent, getContractEvents, defineChain } from "thirdweb"
import { client } from "./thirdweb"
import { getAllSaleHistory } from "./cross-marketplace-sales"
import { getMoralisTokenActivity } from "./moralis-api"

export interface NFTActivityEvent {
  type: "transfer" | "sale" | "listing" | "listing_cancelled" | "listing_updated" | "mint"
  from?: string
  to?: string
  price?: string
  priceUSD?: number
  currency?: string
  timestamp: Date
  txHash: string
  blockNumber?: number
  marketplace?: string
}

/**
 * Get complete activity history for an NFT
 * Uses Moralis API for comprehensive cross-marketplace data
 * Falls back to blockchain events if Moralis unavailable
 */
export async function getNFTHistory(
  contractAddress: string,
  tokenId: string,
  chainId: number
): Promise<NFTActivityEvent[]> {
  try {
    // Try Moralis API first for complete cross-marketplace activity
    const moralisActivity = await getMoralisTokenActivity(contractAddress, tokenId, chainId, 100)

    if (moralisActivity && moralisActivity.length > 0) {
      console.log(`✅ Using Moralis activity for ${contractAddress}:${tokenId}`)

      const activities: NFTActivityEvent[] = moralisActivity.map((transfer: any) => {
        // Detect if this is a mint (from zero address)
        const isMint = transfer.from_address === "0x0000000000000000000000000000000000000000" ||
                       transfer.from_address === null

        // Moralis transfers include value - if value > 0, it's likely a sale
        const isSale = transfer.value && parseFloat(transfer.value) > 0

        const type = isMint ? 'mint'
                   : isSale ? 'sale'
                   : 'transfer'

        return {
          type,
          from: transfer.from_address,
          to: transfer.to_address,
          price: transfer.value && parseFloat(transfer.value) > 0 ? transfer.value : undefined,
          timestamp: new Date(transfer.block_timestamp),
          txHash: transfer.transaction_hash || '',
          blockNumber: transfer.block_number ? parseInt(transfer.block_number) : undefined,
        }
      })

      return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    }

    // Fallback to blockchain events
    console.log(`⚠️ Moralis unavailable, using blockchain events for ${contractAddress}:${tokenId}`)
    const activities: NFTActivityEvent[] = []

    // Define the chain
    const chain = defineChain(chainId)

    // Get the NFT contract
    const nftContract = getContract({
      client,
      chain,
      address: contractAddress,
    })

    // 1. Fetch Transfer events (all blockchain transfers)
    const transferEvent = prepareEvent({
      signature: "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
    })

    const transferEvents = await getContractEvents({
      contract: nftContract,
      events: [transferEvent],
    })

    // Process Transfer events
    for (const event of transferEvents) {
      // Only include events for this specific tokenId
      if (event.args?.tokenId?.toString() === tokenId) {
        const isMint = event.args.from === "0x0000000000000000000000000000000000000000"

        activities.push({
          type: isMint ? "mint" : "transfer",
          from: event.args.from,
          to: event.args.to,
          timestamp: event.blockTimestamp ? new Date(Number(event.blockTimestamp) * 1000) : new Date(),
          txHash: event.transactionHash,
          blockNumber: event.blockNumber,
        })
      }
    }

    // 2. Fetch FortunaSquare Marketplace events
    const marketplaceAddress = process.env.NEXT_PUBLIC_FORTUNA_MARKETPLACE_ADDRESS

    if (marketplaceAddress) {
      const marketplaceContract = getContract({
        client,
        chain,
        address: marketplaceAddress,
      })

      // ListingCreated event
      const listingCreatedEvent = prepareEvent({
        signature: "event ListingCreated(uint256 indexed listingId, address indexed seller, address indexed nftContract, uint256 tokenId, uint256 pricePerToken, uint8 tokenType)"
      })

      const listingEvents = await getContractEvents({
        contract: marketplaceContract,
        events: [listingCreatedEvent],
      })

      for (const event of listingEvents) {
        if (
          event.args?.nftContract?.toLowerCase() === contractAddress.toLowerCase() &&
          event.args?.tokenId?.toString() === tokenId
        ) {
          activities.push({
            type: "listing",
            from: event.args.seller,
            price: event.args.pricePerToken?.toString(),
            timestamp: event.blockTimestamp ? new Date(Number(event.blockTimestamp) * 1000) : new Date(),
            txHash: event.transactionHash,
            blockNumber: event.blockNumber,
            marketplace: "Fortuna Square",
          })
        }
      }

      // Sale event
      const saleEvent = prepareEvent({
        signature: "event Sale(uint256 indexed listingId, address indexed buyer, address indexed seller, address nftContract, uint256 tokenId, uint256 quantity, uint256 totalPrice, uint256 platformFee)"
      })

      const saleEvents = await getContractEvents({
        contract: marketplaceContract,
        events: [saleEvent],
      })

      for (const event of saleEvents) {
        if (
          event.args?.nftContract?.toLowerCase() === contractAddress.toLowerCase() &&
          event.args?.tokenId?.toString() === tokenId
        ) {
          activities.push({
            type: "sale",
            from: event.args.seller,
            to: event.args.buyer,
            price: event.args.totalPrice?.toString(),
            timestamp: event.blockTimestamp ? new Date(Number(event.blockTimestamp) * 1000) : new Date(),
            txHash: event.transactionHash,
            blockNumber: event.blockNumber,
            marketplace: "Fortuna Square",
          })
        }
      }

      // ListingCancelled event
      const listingCancelledEvent = prepareEvent({
        signature: "event ListingCancelled(uint256 indexed listingId, address indexed seller, address indexed nftContract, uint256 tokenId)"
      })

      const cancelledEvents = await getContractEvents({
        contract: marketplaceContract,
        events: [listingCancelledEvent],
      })

      for (const event of cancelledEvents) {
        if (
          event.args?.nftContract?.toLowerCase() === contractAddress.toLowerCase() &&
          event.args?.tokenId?.toString() === tokenId
        ) {
          activities.push({
            type: "listing_cancelled",
            from: event.args.seller,
            timestamp: event.blockTimestamp ? new Date(Number(event.blockTimestamp) * 1000) : new Date(),
            txHash: event.transactionHash,
            blockNumber: event.blockNumber,
            marketplace: "Fortuna Square",
          })
        }
      }

      // ListingUpdated event
      const listingUpdatedEvent = prepareEvent({
        signature: "event ListingUpdated(uint256 indexed listingId, address indexed seller, uint256 newPricePerToken)"
      })

      const updatedEvents = await getContractEvents({
        contract: marketplaceContract,
        events: [listingUpdatedEvent],
      })

      // Note: We can't filter by nftContract/tokenId here since they're not in the event
      // We'd need to map listingId to nftContract/tokenId (future enhancement)
    }

    // 3. Fetch cross-marketplace sales (OpenSea, Blur, LooksRare, etc.)
    try {
      console.log(`🔍 Fetching cross-marketplace sales for ${contractAddress}:${tokenId}`)
      const crossMarketplaceSales = await getAllSaleHistory(contractAddress, tokenId, chainId)

      // Convert SaleRecord[] to NFTActivityEvent[]
      for (const sale of crossMarketplaceSales) {
        activities.push({
          type: "sale",
          from: sale.from,
          to: sale.to,
          price: sale.priceWei.toString(),
          timestamp: sale.timestamp,
          txHash: sale.txHash,
          blockNumber: sale.blockNumber,
          marketplace: sale.marketplace
        })
      }

      console.log(`✅ Added ${crossMarketplaceSales.length} cross-marketplace sales to activity feed`)
    } catch (error) {
      console.error(`⚠️ Failed to fetch cross-marketplace sales:`, error)
    }

    // 4. Deduplicate activities (prioritize sales over generic transfers)
    const deduplicatedActivities = deduplicateActivities(activities)

    // Sort by timestamp (newest first)
    deduplicatedActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    console.log(`📜 Fetched ${deduplicatedActivities.length} activity events for NFT ${contractAddress}:${tokenId}`)

    return deduplicatedActivities

  } catch (error) {
    console.error("Failed to fetch NFT history:", error)
    return []
  }
}

/**
 * Deduplicate activities by transaction hash
 * Prioritizes sale events over generic transfers (same tx can have both)
 */
function deduplicateActivities(activities: NFTActivityEvent[]): NFTActivityEvent[] {
  const seen = new Map<string, NFTActivityEvent>()

  for (const activity of activities) {
    const key = activity.txHash

    // If this tx already exists
    if (seen.has(key)) {
      const existing = seen.get(key)!

      // Prioritize sale events over generic transfers
      if (activity.type === "sale" && existing.type === "transfer") {
        seen.set(key, activity) // Replace transfer with sale
      } else if (existing.type === "sale" && activity.type === "transfer") {
        // Keep the existing sale, skip this transfer
        continue
      }
      // For other duplicates, keep the first one (marketplace events vs transfers)
    } else {
      seen.set(key, activity)
    }
  }

  return Array.from(seen.values())
}

/**
 * Format address for display
 */
export function formatAddress(address: string): string {
  if (!address) return "Unknown"
  if (address === "0x0000000000000000000000000000000000000000") return "Null Address"
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Format price for display (converts from wei to APE)
 */
export function formatPrice(priceWei?: string): string {
  if (!priceWei) return "—"

  try {
    const apeAmount = Number(priceWei) / 1e18
    return `${apeAmount.toFixed(4)} APE`
  } catch {
    return "—"
  }
}

/**
 * Get activity type display label
 */
export function getActivityLabel(type: NFTActivityEvent["type"]): string {
  const labels: Record<NFTActivityEvent["type"], string> = {
    mint: "Minted",
    transfer: "Transferred",
    sale: "Sold",
    listing: "Listed for Sale",
    listing_cancelled: "Listing Cancelled",
    listing_updated: "Price Updated",
  }

  return labels[type] || type
}

/**
 * Get activity type color
 */
export function getActivityColor(type: NFTActivityEvent["type"]): string {
  const colors: Record<NFTActivityEvent["type"], string> = {
    mint: "text-green-400",
    transfer: "text-blue-400",
    sale: "text-purple-400",
    listing: "text-cyan-400",
    listing_cancelled: "text-red-400",
    listing_updated: "text-yellow-400",
  }

  return colors[type] || "text-gray-400"
}
