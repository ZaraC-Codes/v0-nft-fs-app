/**
 * NFT History Service
 * Fetches complete blockchain activity for individual NFTs
 * Combines ThirdWeb Insight API + direct blockchain event queries
 */

import { getContract, prepareEvent, getContractEvents, defineChain } from "thirdweb"
import { client } from "./thirdweb"

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
 * Combines Transfer events + FortunaSquare marketplace events
 */
export async function getNFTHistory(
  contractAddress: string,
  tokenId: string,
  chainId: number
): Promise<NFTActivityEvent[]> {
  try {
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
          timestamp: new Date((event.block?.timestamp || 0) * 1000),
          txHash: event.transactionHash,
          blockNumber: event.block?.number,
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
            timestamp: new Date((event.block?.timestamp || 0) * 1000),
            txHash: event.transactionHash,
            blockNumber: event.block?.number,
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
            timestamp: new Date((event.block?.timestamp || 0) * 1000),
            txHash: event.transactionHash,
            blockNumber: event.block?.number,
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
            timestamp: new Date((event.block?.timestamp || 0) * 1000),
            txHash: event.transactionHash,
            blockNumber: event.block?.number,
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

    // Sort by timestamp (newest first)
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    console.log(`📜 Fetched ${activities.length} activity events for NFT ${contractAddress}:${tokenId}`)

    return activities

  } catch (error) {
    console.error("Failed to fetch NFT history:", error)
    return []
  }
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
