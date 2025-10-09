/**
 * Collection Chat Utilities
 * Token-gated chat for NFT collection holders
 * Reuses GroupChatRelay.sol contract with deterministic groupId mapping
 */

import { getGoldRushNFTs } from "./goldrush-api"
import { getContract, readContract } from "thirdweb"
import { client, apeChain } from "./thirdweb"

/**
 * Generate deterministic chat ID for a collection
 * Uses prefix "1" + last 18 digits of contract address to avoid collision with treasury groups
 *
 * @param contractAddress - NFT collection contract address
 * @returns Deterministic groupId for the collection chat
 */
export function getCollectionChatId(contractAddress: string): bigint {
  // Remove 0x prefix and convert to bigint
  const addressHex = contractAddress.toLowerCase().replace("0x", "")
  const addressNum = BigInt("0x" + addressHex)

  // Use modulo to get last 18 digits, prefix with 1 for collection chats
  const suffix = addressNum % BigInt(10 ** 18)
  return BigInt("1" + suffix.toString().padStart(18, "0"))
}

/**
 * Verify that a wallet (or multiple wallets) owns at least 1 NFT from a collection
 * Uses GoldRush API as primary source, falls back to blockchain
 *
 * SECURITY: This should ONLY be called server-side (API routes)
 * Never trust frontend ownership checks!
 *
 * @param walletAddresses - Single wallet address or array of wallet addresses to check
 * @param contractAddress - NFT collection contract address
 * @returns true if ANY wallet owns ≥1 NFT, false otherwise
 */
export async function verifyCollectionOwnership(
  walletAddresses: string | string[],
  contractAddress: string
): Promise<boolean> {
  try {
    // Normalize to array
    const addresses = Array.isArray(walletAddresses) ? walletAddresses : [walletAddresses]

    console.log(`🔍 Verifying ownership for ${addresses.length} wallet(s) in collection ${contractAddress}`)
    console.log(`📍 Checking wallets:`, addresses)

    // Check each wallet
    for (const walletAddress of addresses) {
      console.log(`🔎 Checking wallet: ${walletAddress}`)

      try {
        // Try GoldRush API first (faster, more reliable) with 10 second timeout
        const nfts = await Promise.race([
          getGoldRushNFTs(walletAddress, "apechain-mainnet", contractAddress),
          new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error('GoldRush API timeout after 10s')), 10000)
          )
        ])

        if (nfts && nfts.length > 0) {
          // Check if any NFT matches the contract address
          const hasNFT = nfts.some((nft: any) => {
            const nftContract = (nft.contract_address || nft.token_address || "").toLowerCase()
            return nftContract === contractAddress.toLowerCase()
          })

          if (hasNFT) {
            console.log(`✅ Verified ownership via GoldRush: ${walletAddress} owns ${nfts.length} NFT(s) from ${contractAddress}`)
            return true
          }
        }
      } catch (error: any) {
        console.log(`⚠️ GoldRush API failed for ${walletAddress}:`, error.message)
      }

      // Fallback: Check blockchain directly with timeout
      try {
        console.log(`⚠️ GoldRush returned no results for ${walletAddress}, checking blockchain...`)
        const hasNFTOnChain = await Promise.race([
          verifyOwnershipOnChain(walletAddress, contractAddress),
          new Promise<boolean>((_, reject) =>
            setTimeout(() => reject(new Error('Blockchain check timeout after 15s')), 15000)
          )
        ])

        if (hasNFTOnChain) {
          console.log(`✅ Verified ownership via blockchain: ${walletAddress} owns NFT(s) from ${contractAddress}`)
          return true
        }
      } catch (error: any) {
        console.log(`⚠️ Blockchain check failed for ${walletAddress}:`, error.message)
      }

      console.log(`❌ No NFTs found for ${walletAddress}`)
    }

    console.log(`❌ No ownership verified: None of the ${addresses.length} wallet(s) own NFTs from ${contractAddress}`)
    return false
  } catch (error) {
    console.error("Error verifying collection ownership:", error)
    // SECURITY: Fail closed - deny access on error
    return false
  }
}

/**
 * Verify ownership by checking blockchain directly
 * Queries balanceOf for ERC721 contracts
 *
 * @param walletAddress - User's wallet address
 * @param contractAddress - NFT collection contract address
 * @returns true if balance > 0, false otherwise
 */
async function verifyOwnershipOnChain(
  walletAddress: string,
  contractAddress: string
): Promise<boolean> {
  try {
    const contract = getContract({
      client,
      chain: apeChain,
      address: contractAddress,
    })

    // Try ERC721 balanceOf
    try {
      const balance = await readContract({
        contract,
        method: "function balanceOf(address owner) view returns (uint256)",
        params: [walletAddress as `0x${string}`],
      })

      return Number(balance) > 0
    } catch (error) {
      // Contract might not be ERC721
      console.warn("balanceOf call failed, contract might not be ERC721:", error)
      return false
    }
  } catch (error) {
    console.error("Error checking on-chain ownership:", error)
    return false
  }
}

/**
 * Get NFT count for a wallet in a collection
 * Useful for displaying "You own X NFTs from this collection"
 *
 * @param walletAddress - User's wallet address
 * @param contractAddress - NFT collection contract address
 * @returns Number of NFTs owned, or 0 on error
 */
export async function getCollectionNFTCount(
  walletAddress: string,
  contractAddress: string
): Promise<number> {
  try {
    // Try blockchain first for exact count
    const contract = getContract({
      client,
      chain: apeChain,
      address: contractAddress,
    })

    const balance = await readContract({
      contract,
      method: "function balanceOf(address owner) view returns (uint256)",
      params: [walletAddress as `0x${string}`],
    })

    return Number(balance)
  } catch (error) {
    // Fallback to GoldRush
    try {
      const nfts = await getGoldRushNFTs(walletAddress, "apechain-mainnet", contractAddress)
      const filteredNFTs = nfts.filter((nft: any) => {
        const nftContract = (nft.contract_address || nft.token_address || "").toLowerCase()
        return nftContract === contractAddress.toLowerCase()
      })
      return filteredNFTs.length
    } catch (e) {
      console.error("Error getting NFT count:", error)
      return 0
    }
  }
}

/**
 * Format message type enum to string
 *
 * @param typeEnum - Message type number from contract
 * @returns Human-readable message type
 */
export function getMessageType(typeEnum: number): string {
  switch (typeEnum) {
    case 0:
      return "message"
    case 1:
      return "command"
    case 2:
      return "bot_response"
    case 3:
      return "system"
    case 4:
      return "proposal"
    default:
      return "message"
  }
}

/**
 * Format Ethereum address for display
 *
 * @param address - Ethereum address
 * @returns Shortened address (0x1234...5678)
 */
export function formatAddress(address: string): string {
  if (!address) return "Unknown"
  if (address === "0x0000000000000000000000000000000000000000") return "System"
  return address.slice(0, 6) + "..." + address.slice(-4)
}

/**
 * Get avatar URL for address using DiceBear API
 *
 * @param address - Ethereum address
 * @returns Avatar URL
 */
export function getAvatarUrl(address: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`
}

/**
 * Format timestamp for chat messages
 *
 * @param timestamp - Date object
 * @returns Formatted time string (e.g., "just now", "5m ago", "3:45 PM")
 */
export function formatMessageTime(timestamp: Date): string {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()

  // Less than 1 minute
  if (diff < 60000) return "just now"

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}m ago`
  }

  // Same day
  if (now.toDateString() === timestamp.toDateString()) {
    return timestamp.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    })
  }

  // Older
  return timestamp.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  })
}
