/**
 * Test script to simulate the API route behavior
 * Run: npx tsx scripts/test-api-route.ts
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env.local like Next.js does
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// Import after loading env vars
import { getSupabaseClient, CHAT_MESSAGES_TABLE } from '../lib/supabase'
import { getCollectionChatId } from '../lib/collection-chat'

async function testApiRoute() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🧪 Simulating API Route: GET /api/collections/[contractAddress]/chat/messages')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const contractAddress = '0x7ca094eb7e2e305135a0c49835e394b0daca8c56'

  try {
    console.log('1️⃣ Creating Supabase client...')
    const supabase = getSupabaseClient()
    const groupId = getCollectionChatId(contractAddress)

    console.log(`   ✅ Client created`)
    console.log(`   Contract: ${contractAddress}`)
    console.log(`   Group ID: ${groupId}`)

    console.log('\n2️⃣ Fetching messages from Supabase...')
    const { data: messages, error } = await supabase
      .from(CHAT_MESSAGES_TABLE)
      .select('*')
      .eq('collection_address', contractAddress.toLowerCase())
      .order('timestamp', { ascending: true })

    if (error) {
      console.error('   ❌ Error fetching messages from Supabase:', error)
      console.error('      Code:', error.code)
      console.error('      Message:', error.message)
      console.error('      Details:', error.details)
      console.error('      Hint:', error.hint)
      return
    }

    console.log(`   ✅ Fetched ${messages.length} messages`)

    console.log('\n3️⃣ Transforming to frontend format...')
    const formattedMessages = messages.map((msg: any) => ({
      id: msg.blockchain_id,
      type: msg.message_type,
      content: msg.content,
      timestamp: msg.timestamp,
      senderAddress: msg.sender_address,
      isBot: msg.is_bot,
    }))

    console.log(`   ✅ Transformed ${formattedMessages.length} messages`)

    console.log('\n4️⃣ Sample response:')
    console.log(JSON.stringify({
      success: true,
      messages: formattedMessages.slice(0, 2), // First 2 messages
      count: formattedMessages.length,
      groupId: groupId.toString(),
    }, null, 2))

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ API Route simulation successful!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  } catch (error: any) {
    console.error('\n❌ Unexpected error:')
    console.error('   Message:', error.message)
    console.error('   Stack:', error.stack)
    process.exit(1)
  }
}

testApiRoute()
