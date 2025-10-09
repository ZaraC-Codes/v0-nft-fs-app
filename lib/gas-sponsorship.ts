import { prepareContractCall, sendTransaction, getContract } from "thirdweb"
import { client } from "./thirdweb"
import { apeChain } from "./thirdweb"
import { privateKeyToAccount } from "thirdweb/wallets"

/**
 * Gas Sponsorship Configuration
 *
 * This module handles gasless transactions for chat messages
 * Backend relayer pays gas fees for user transactions
 */

// Relayer Configuration
// IMPORTANT: Keep RELAYER_PRIVATE_KEY secure and never expose it to frontend!
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY || ""
const RELAYER_WALLET_ADDRESS = process.env.RELAYER_WALLET_ADDRESS || ""

// Rate limiting configuration
const RATE_LIMIT = {
  messagesPerUser: 100, // Max messages per user per day
  messagesPerGroup: 1000, // Max messages per group per day
}

// In-memory rate limit tracking (in production, use Redis)
const rateLimits = new Map<string, { count: number; resetAt: number }>()

/**
 * Check if user/group is within rate limits
 */
export function checkRateLimit(key: string, limit: number): boolean {
  const now = Date.now()
  const record = rateLimits.get(key)

  if (!record || now > record.resetAt) {
    // Reset or create new record
    rateLimits.set(key, {
      count: 1,
      resetAt: now + 24 * 60 * 60 * 1000, // 24 hours
    })
    return true
  }

  if (record.count >= limit) {
    return false // Rate limit exceeded
  }

  record.count++
  return true
}

/**
 * Get relayer account for gas sponsorship
 * Only call this from backend API routes!
 */
export function getRelayerAccount() {
  if (!RELAYER_PRIVATE_KEY) {
    throw new Error("RELAYER_PRIVATE_KEY not configured")
  }

  // Create account from private key
  const account = privateKeyToAccount({
    client,
    privateKey: RELAYER_PRIVATE_KEY as `0x${string}`,
  })

  return account
}

/**
 * Send a gasless chat message
 * Called from backend API route
 */
export async function sendGaslessMessage(
  groupId: bigint,
  sender: string,
  content: string,
  messageType: number,
  chatRelayAddress: string
) {
  // Check rate limits
  const userKey = `user:${sender}`
  const groupKey = `group:${groupId}`

  if (!checkRateLimit(userKey, RATE_LIMIT.messagesPerUser)) {
    throw new Error("User rate limit exceeded")
  }

  if (!checkRateLimit(groupKey, RATE_LIMIT.messagesPerGroup)) {
    throw new Error("Group rate limit exceeded")
  }

  // Get relayer account
  const relayerAccount = getRelayerAccount()

  // Get contract
  const contract = getContract({
    client,
    chain: apeChain,
    address: chatRelayAddress as `0x${string}`,
  })

  // Prepare transaction
  console.log(`🔍 [GAS-SPONSORSHIP] Preparing transaction with params:`)
  console.log(`  - groupId: ${groupId} (type: ${typeof groupId})`)
  console.log(`  - groupId hex: 0x${groupId.toString(16)}`)
  console.log(`  - sender: ${sender}`)
  console.log(`  - content: ${content}`)
  console.log(`  - messageType: ${messageType}`)

  const transaction = prepareContractCall({
    contract,
    method: "function sendMessage(uint256 groupId, address sender, string memory content, uint8 messageType) external returns (uint256)",
    params: [groupId, sender as `0x${string}`, content, messageType],
  })

  // Send transaction with relayer paying gas
  const result = await sendTransaction({
    transaction,
    account: relayerAccount,
  })

  return {
    transactionHash: result.transactionHash,
    chain: apeChain,
  }
}

/**
 * Send a gasless bot message
 */
export async function sendGaslessBotMessage(
  groupId: bigint,
  content: string,
  messageType: number,
  chatRelayAddress: string
) {
  // Check rate limit for group
  const groupKey = `group:${groupId}`

  if (!checkRateLimit(groupKey, RATE_LIMIT.messagesPerGroup)) {
    throw new Error("Group rate limit exceeded")
  }

  // Get relayer account
  const relayerAccount = getRelayerAccount()

  // Get contract
  const contract = getContract({
    client,
    chain: apeChain,
    address: chatRelayAddress as `0x${string}`,
  })

  // Prepare transaction
  const transaction = prepareContractCall({
    contract,
    method: "function sendBotMessage(uint256 groupId, string memory content, uint8 messageType) external returns (uint256)",
    params: [groupId, content, messageType],
  })

  // Send transaction with relayer paying gas
  const result = await sendTransaction({
    transaction,
    account: relayerAccount,
  })

  return {
    transactionHash: result.transactionHash,
    chain: apeChain,
  }
}

/**
 * Send a gasless system message
 */
export async function sendGaslessSystemMessage(
  groupId: bigint,
  content: string,
  chatRelayAddress: string
) {
  // Get relayer account
  const relayerAccount = getRelayerAccount()

  // Get contract
  const contract = getContract({
    client,
    chain: apeChain,
    address: chatRelayAddress as `0x${string}`,
  })

  // Prepare transaction
  const transaction = prepareContractCall({
    contract,
    method: "function sendSystemMessage(uint256 groupId, string memory content) external returns (uint256)",
    params: [groupId, content],
  })

  // Send transaction with relayer paying gas
  const result = await sendTransaction({
    transaction,
    account: relayerAccount,
  })

  return {
    transactionHash: result.transactionHash,
    chain: apeChain,
  }
}

/**
 * Check relayer balance
 * IMPORTANT: Monitor this and refill when low!
 */
export async function checkRelayerBalance() {
  if (!RELAYER_WALLET_ADDRESS) {
    throw new Error("RELAYER_WALLET_ADDRESS not configured")
  }

  // In production, you would fetch the actual balance from the blockchain
  // For now, return a placeholder
  return {
    address: RELAYER_WALLET_ADDRESS,
    balance: "0", // Would be actual balance in wei
    balanceFormatted: "0 APE", // Human-readable balance
  }
}

/**
 * Setup Instructions:
 *
 * 1. Create a new wallet for the relayer (DO NOT use your main wallet!)
 * 2. Fund it with testnet APE from faucet
 * 3. Add to .env.local:
 *    RELAYER_PRIVATE_KEY=0x...your_relayer_private_key
 *    RELAYER_WALLET_ADDRESS=0x...your_relayer_address
 *
 * 4. Monitor relayer balance regularly:
 *    - Set up alerts when balance is low
 *    - Refill from main wallet when needed
 *
 * 5. Security Best Practices:
 *    - NEVER expose RELAYER_PRIVATE_KEY to frontend
 *    - Only use in backend API routes
 *    - Implement rate limiting (done above)
 *    - Monitor for abuse patterns
 *    - Consider using ThirdWeb Engine for production
 *
 * 6. Production Recommendations:
 *    - Use ThirdWeb Engine for better gas management
 *    - Implement sophisticated rate limiting with Redis
 *    - Add spending caps per user/group
 *    - Set up monitoring and alerting
 *    - Consider using a dedicated gas relay service
 */

// Export rate limit config for monitoring
export const RATE_LIMIT_CONFIG = RATE_LIMIT
