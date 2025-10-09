/**
 * One-time sync script to copy all blockchain messages to Supabase
 * Run with: npx tsx scripts/sync-blockchain-to-supabase.ts <contractAddress>
 */

// IMPORTANT: Load environment variables BEFORE any imports that depend on them
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { readContract, getContract } from "thirdweb"
import { client, apeChain } from "../lib/thirdweb"
import { getCollectionChatId } from "../lib/collection-chat"
import { getSupabaseClient, CHAT_MESSAGES_TABLE, ChatMessage } from "../lib/supabase"

const CHAT_RELAY_ADDRESS = process.env.NEXT_PUBLIC_GROUP_CHAT_RELAY_ADDRESS || "0xC75255aB6eeBb6995718eBa64De276d5B110fb7f"

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

async function syncBlockchainToSupabase(contractAddress: string) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔄 SYNCING BLOCKCHAIN MESSAGES TO SUPABASE')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Collection Address: ${contractAddress}`)
  console.log(`Chat Relay Contract: ${CHAT_RELAY_ADDRESS}`)
  console.log('')

  const supabase = getSupabaseClient()

  // Step 1: Calculate GroupId
  const groupId = getCollectionChatId(contractAddress)
  console.log(`✅ Group ID: ${groupId.toString()}`)

  // Step 2: Get contract instance
  const contract = getContract({
    client,
    chain: apeChain,
    address: CHAT_RELAY_ADDRESS as `0x${string}`,
  })

  // Step 3: Fetch messages from blockchain
  console.log('\n📥 Fetching messages from blockchain...')

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

    console.log(`✅ Fetched ${messages.length} messages from blockchain`)

    if (messages.length === 0) {
      console.log('⚠️  No messages to sync!')
      return
    }

    // Step 4: Transform to Supabase format
    console.log('\n🔄 Transforming messages to Supabase format...')

    const supabaseMessages = messages.map((msg: any) => ({
      collection_address: contractAddress.toLowerCase(),
      group_id: groupId.toString(),
      sender_address: msg.sender.toLowerCase(),
      content: msg.content,
      message_type: getMessageType(Number(msg.messageType)),
      is_bot: msg.isBot,
      timestamp: new Date(Number(msg.timestamp) * 1000).toISOString(),
      blockchain_id: msg.id.toString(),
    }))

    console.log(`✅ Transformed ${supabaseMessages.length} messages`)

    // Step 5: Insert into Supabase (using upsert to avoid duplicates)
    console.log('\n💾 Inserting messages into Supabase...')

    const { data, error } = await supabase
      .from(CHAT_MESSAGES_TABLE)
      .upsert(supabaseMessages, {
        onConflict: 'collection_address,blockchain_id',
        ignoreDuplicates: false
      })
      .select()

    if (error) {
      console.error('❌ Error inserting messages:', error)
      throw error
    }

    console.log(`✅ Successfully synced ${messages.length} messages to Supabase!`)

    // Step 6: Verify
    console.log('\n🔍 Verifying sync...')

    const { data: verifyData, error: verifyError, count } = await supabase
      .from(CHAT_MESSAGES_TABLE)
      .select('*', { count: 'exact' })
      .eq('collection_address', contractAddress.toLowerCase())
      .order('timestamp', { ascending: true })

    if (verifyError) {
      console.error('❌ Error verifying:', verifyError)
    } else {
      console.log(`✅ Verified ${count} messages in Supabase`)
      console.log('\n📝 Sample messages:')
      verifyData?.slice(0, 3).forEach((msg: any, idx: number) => {
        console.log(`  ${idx + 1}. [${msg.timestamp}] ${msg.sender_address.slice(0, 8)}...: "${msg.content}"`)
      })
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ SYNC COMPLETE!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  } catch (error: any) {
    console.error('❌ Sync failed:', error)
    console.error('Error details:', error.message)
    throw error
  }
}

// Run if called directly
const contractAddress = process.argv[2]
if (!contractAddress) {
  console.error('Usage: npx tsx scripts/sync-blockchain-to-supabase.ts <contractAddress>')
  process.exit(1)
}

syncBlockchainToSupabase(contractAddress).catch(console.error)
