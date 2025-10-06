/**
 * Bundle NFT History Service
 * Tracks bundle-specific activity and historical provenance of bundled contents
 */

import { getContract, prepareEvent, getContractEvents, defineChain } from "thirdweb"
import { client } from "./thirdweb"
import { getNFTHistory, NFTActivityEvent } from "./nft-history"

export interface BundleActivityEvent {
  type: "bundle_created" | "bundle_unwrapped" | "bundle_transfer" | "nft_deposited"
  bundleId: string
  creator?: string
  owner?: string
  from?: string
  to?: string
  nftContracts?: string[]
  tokenIds?: string[]
  accountAddress?: string
  timestamp: Date
  txHash: string
  blockNumber?: number
}

export interface BundledNFTProvenance {
  contractAddress: string
  tokenId: string
  history: NFTActivityEvent[]
}

/**
 * Get complete activity history for a bundle NFT
 * This shows what happened to the BUNDLE itself (not the contents)
 */
export async function getBundleActivity(
  bundleTokenId: string,
  chainId: number
): Promise<BundleActivityEvent[]> {
  try {
    const activities: BundleActivityEvent[] = []
    const chain = defineChain(chainId)

    const bundleContractAddress = process.env.NEXT_PUBLIC_BUNDLE_NFT_ADDRESS
    if (!bundleContractAddress) {
      console.error("❌ Bundle contract address not configured")
      return []
    }

    const bundleContract = getContract({
      client,
      chain,
      address: bundleContractAddress,
    })

    // 1. BundleCreated event
    const bundleCreatedEvent = prepareEvent({
      signature: "event BundleCreated(uint256 indexed bundleId, address indexed creator, address accountAddress, address[] nftContracts, uint256[] tokenIds)"
    })

    const createdEvents = await getContractEvents({
      contract: bundleContract,
      events: [bundleCreatedEvent],
    })

    for (const event of createdEvents) {
      if (event.args?.bundleId?.toString() === bundleTokenId) {
        activities.push({
          type: "bundle_created",
          bundleId: bundleTokenId,
          creator: event.args.creator,
          accountAddress: event.args.accountAddress,
          nftContracts: event.args.nftContracts,
          tokenIds: event.args.tokenIds?.map((id: bigint) => id.toString()),
          timestamp: new Date((event.block?.timestamp || 0) * 1000),
          txHash: event.transactionHash,
          blockNumber: event.block?.number,
        })
      }
    }

    // 2. BundleUnwrapped event
    const bundleUnwrappedEvent = prepareEvent({
      signature: "event BundleUnwrapped(uint256 indexed bundleId, address indexed owner, address[] nftContracts, uint256[] tokenIds)"
    })

    const unwrappedEvents = await getContractEvents({
      contract: bundleContract,
      events: [bundleUnwrappedEvent],
    })

    for (const event of unwrappedEvents) {
      if (event.args?.bundleId?.toString() === bundleTokenId) {
        activities.push({
          type: "bundle_unwrapped",
          bundleId: bundleTokenId,
          owner: event.args.owner,
          nftContracts: event.args.nftContracts,
          tokenIds: event.args.tokenIds?.map((id: bigint) => id.toString()),
          timestamp: new Date((event.block?.timestamp || 0) * 1000),
          txHash: event.transactionHash,
          blockNumber: event.block?.number,
        })
      }
    }

    // 3. Bundle NFT Transfer events (bundle traded as a whole)
    const transferEvent = prepareEvent({
      signature: "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
    })

    const transferEvents = await getContractEvents({
      contract: bundleContract,
      events: [transferEvent],
    })

    for (const event of transferEvents) {
      if (event.args?.tokenId?.toString() === bundleTokenId) {
        const isMint = event.args.from === "0x0000000000000000000000000000000000000000"

        // Skip mint event (already captured in BundleCreated)
        if (!isMint) {
          activities.push({
            type: "bundle_transfer",
            bundleId: bundleTokenId,
            from: event.args.from,
            to: event.args.to,
            timestamp: new Date((event.block?.timestamp || 0) * 1000),
            txHash: event.transactionHash,
            blockNumber: event.block?.number,
          })
        }
      }
    }

    // 4. NFTDeposited events (if any NFTs added after creation)
    const nftDepositedEvent = prepareEvent({
      signature: "event NFTDeposited(uint256 indexed bundleId, address nftContract, uint256 tokenId)"
    })

    const depositedEvents = await getContractEvents({
      contract: bundleContract,
      events: [nftDepositedEvent],
    })

    for (const event of depositedEvents) {
      if (event.args?.bundleId?.toString() === bundleTokenId) {
        activities.push({
          type: "nft_deposited",
          bundleId: bundleTokenId,
          nftContracts: [event.args.nftContract],
          tokenIds: [event.args.tokenId?.toString()],
          timestamp: new Date((event.block?.timestamp || 0) * 1000),
          txHash: event.transactionHash,
          blockNumber: event.block?.number,
        })
      }
    }

    // Sort by timestamp (newest first)
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    console.log(`📦 Fetched ${activities.length} bundle activity events for bundle #${bundleTokenId}`)

    return activities

  } catch (error) {
    console.error("Failed to fetch bundle activity:", error)
    return []
  }
}

/**
 * Get historical provenance of all NFTs that were bundled
 * Shows what happened to each NFT BEFORE it was bundled
 */
export async function getBundledContentsProvenance(
  nftContracts: string[],
  tokenIds: string[],
  chainId: number
): Promise<BundledNFTProvenance[]> {
  try {
    const provenances: BundledNFTProvenance[] = []

    // Fetch history for each NFT in parallel
    const historyPromises = nftContracts.map(async (contractAddress, index) => {
      const tokenId = tokenIds[index]
      const history = await getNFTHistory(contractAddress, tokenId, chainId)

      return {
        contractAddress,
        tokenId,
        history,
      }
    })

    const results = await Promise.all(historyPromises)
    provenances.push(...results)

    console.log(`🔍 Fetched provenance for ${provenances.length} bundled NFTs`)

    return provenances

  } catch (error) {
    console.error("Failed to fetch bundled contents provenance:", error)
    return []
  }
}

/**
 * Format bundle activity type for display
 */
export function getBundleActivityLabel(type: BundleActivityEvent["type"]): string {
  const labels: Record<BundleActivityEvent["type"], string> = {
    bundle_created: "Bundle Created",
    bundle_unwrapped: "Bundle Unwrapped",
    bundle_transfer: "Bundle Transferred",
    nft_deposited: "NFT Added to Bundle",
  }

  return labels[type] || type
}

/**
 * Get bundle activity type color
 */
export function getBundleActivityColor(type: BundleActivityEvent["type"]): string {
  const colors: Record<BundleActivityEvent["type"], string> = {
    bundle_created: "text-green-400",
    bundle_unwrapped: "text-orange-400",
    bundle_transfer: "text-blue-400",
    nft_deposited: "text-purple-400",
  }

  return colors[type] || "text-gray-400"
}

/**
 * Format NFT list for display
 */
export function formatBundledNFTs(nftContracts?: string[], tokenIds?: string[]): string {
  if (!nftContracts || !tokenIds || nftContracts.length === 0) {
    return "No NFTs"
  }

  if (nftContracts.length === 1) {
    return `1 NFT (Token #${tokenIds[0]})`
  }

  return `${nftContracts.length} NFTs`
}
