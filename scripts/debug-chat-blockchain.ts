/**
 * CRITICAL BLOCKCHAIN MESSAGE RETRIEVAL DEBUG SCRIPT
 *
 * This script verifies the EXACT blockchain state and compares with API responses
 * Run with: npx ts-node scripts/debug-chat-blockchain.ts <contractAddress>
 */

import { readContract, getContract } from "thirdweb"
import { client, apeChain } from "../lib/thirdweb"
import { getCollectionChatId } from "../lib/collection-chat"

const CHAT_RELAY_ADDRESS = process.env.NEXT_PUBLIC_GROUP_CHAT_RELAY_ADDRESS || "0xC75255aB6eeBb6995718eBa64De276d5B110fb7f"

async function debugChatBlockchain(contractAddress: string) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 CRITICAL BLOCKCHAIN MESSAGE RETRIEVAL DEBUG')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Collection Contract: ${contractAddress}`)
  console.log(`Chat Relay Contract: ${CHAT_RELAY_ADDRESS}`)
  console.log('')

  // Step 1: Calculate GroupId
  const groupId = getCollectionChatId(contractAddress)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📋 STEP 1: GroupId Calculation')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`GroupId (BigInt): ${groupId}`)
  console.log(`GroupId (String): ${groupId.toString()}`)
  console.log(`GroupId (Hex): 0x${groupId.toString(16)}`)
  console.log('')

  // Step 2: Get contract instance
  const contract = getContract({
    client,
    chain: apeChain,
    address: CHAT_RELAY_ADDRESS as `0x${string}`,
  })

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📋 STEP 2: Check Contract State')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  try {
    // Check message count
    const messageCount = await readContract({
      contract,
      method: "function getMessageCount(uint256 groupId) view returns (uint256)",
      params: [groupId],
    })
    console.log(`✅ Message Count: ${messageCount.toString()}`)
  } catch (error: any) {
    console.log(`❌ Failed to get message count:`, error.message)
  }

  console.log('')

  // Step 3: Fetch messages
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📋 STEP 3: Fetch Messages from Blockchain')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  try {
    const messages = await readContract({
      contract,
      method: {
        type: "function",
        name: "getGroupMessages",
        inputs: [{ name: "groupId", type: "uint256", internalType: "uint256" }],
        outputs: [{
          name: "",
          type: "tuple[]",
          internalType: "struct GroupChatRelay.Message[]",
          components: [
            { name: "id", type: "uint256", internalType: "uint256" },
            { name: "groupId", type: "uint256", internalType: "uint256" },
            { name: "sender", type: "address", internalType: "address" },
            { name: "content", type: "string", internalType: "string" },
            { name: "timestamp", type: "uint256", internalType: "uint256" },
            { name: "messageType", type: "uint8", internalType: "enum GroupChatRelay.MessageType" },
            { name: "isBot", type: "bool", internalType: "bool" }
          ]
        }],
        stateMutability: "view"
      },
      params: [groupId],
    })

    console.log(`✅ Successfully fetched ${messages.length} messages from blockchain`)
    console.log('')

    if (messages.length === 0) {
      console.log('⚠️ WARNING: No messages found on blockchain!')
      console.log('   This could mean:')
      console.log('   1. Messages are being sent to a different groupId')
      console.log('   2. Transactions are succeeding but not storing messages')
      console.log('   3. The relayer is not authorized on the contract')
      console.log('')
    } else {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📋 BLOCKCHAIN MESSAGES:')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      messages.forEach((msg: any, idx: number) => {
        console.log(`\nMessage ${idx + 1}:`)
        console.log(`  ID: ${msg.id.toString()}`)
        console.log(`  GroupId: ${msg.groupId.toString()}`)
        console.log(`  Sender: ${msg.sender}`)
        console.log(`  Content: "${msg.content}"`)
        console.log(`  Timestamp: ${msg.timestamp.toString()} (${new Date(Number(msg.timestamp) * 1000).toISOString()})`)
        console.log(`  MessageType: ${msg.messageType}`)
        console.log(`  IsBot: ${msg.isBot}`)
      })
      console.log('')
    }

    // Format for API comparison
    const formattedMessages = messages.map((msg: any) => ({
      id: msg.id.toString(),
      type: getMessageType(Number(msg.messageType)),
      content: msg.content,
      timestamp: new Date(Number(msg.timestamp) * 1000).toISOString(),
      senderAddress: msg.sender,
      isBot: msg.isBot,
    }))

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 FORMATTED MESSAGES (API Format):')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(JSON.stringify(formattedMessages, null, 2))
    console.log('')

  } catch (error: any) {
    console.log(`❌ Failed to fetch messages:`, error)
    console.log(`   Error message:`, error.message)
    console.log(`   Error stack:`, error.stack)
    console.log('')
  }

  // Step 4: Check relayer authorization
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📋 STEP 4: Verify Relayer Authorization')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const relayerAddress = process.env.RELAYER_WALLET_ADDRESS
  console.log(`Relayer Address: ${relayerAddress}`)

  if (relayerAddress) {
    try {
      const isAuthorized = await readContract({
        contract,
        method: "function authorizedRelayers(address) view returns (bool)",
        params: [relayerAddress as `0x${string}`],
      })
      console.log(`✅ Is Authorized: ${isAuthorized}`)

      if (!isAuthorized) {
        console.log('❌ CRITICAL: Relayer is NOT authorized!')
        console.log('   Messages will fail to be stored on blockchain')
        console.log('   Transaction will succeed but sendMessage will revert')
      }
    } catch (error: any) {
      console.log(`❌ Failed to check authorization:`, error.message)
    }
  } else {
    console.log('❌ RELAYER_WALLET_ADDRESS not set in environment')
  }

  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📋 DEBUGGING CHECKLIST:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('□ Are messages found on blockchain?')
  console.log('□ Is the groupId consistent between send and fetch?')
  console.log('□ Is the relayer authorized on the contract?')
  console.log('□ Do the transaction receipts show MessageSent events?')
  console.log('□ Is the contract address correct in both APIs?')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

function getMessageType(typeEnum: number): string {
  switch (typeEnum) {
    case 0: return "message"
    case 1: return "command"
    case 2: return "bot_response"
    case 3: return "system"
    case 4: return "proposal"
    default: return "message"
  }
}

// Run if called directly
const contractAddress = process.argv[2]
if (!contractAddress) {
  console.error('Usage: npx ts-node scripts/debug-chat-blockchain.ts <contractAddress>')
  process.exit(1)
}

debugChatBlockchain(contractAddress).catch(console.error)
