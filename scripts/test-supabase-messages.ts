/**
 * Test script to verify Supabase connection and messages API
 * Run: npx tsx scripts/test-supabase-messages.ts
 */

import { getSupabaseClient, CHAT_MESSAGES_TABLE } from '../lib/supabase'
import { getCollectionChatId } from '../lib/collection-chat'

async function testSupabaseMessages() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🧪 Testing Supabase Messages API')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // Check environment variables
  console.log('1️⃣ Checking environment variables...')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`)
  console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? '✅ Set' : '❌ Missing'}`)

  if (!supabaseUrl || !supabaseKey) {
    console.error('\n❌ Missing Supabase environment variables!')
    process.exit(1)
  }

  // Test Supabase connection
  console.log('\n2️⃣ Testing Supabase connection...')
  try {
    const supabase = getSupabaseClient()
    console.log('   ✅ Supabase client created')

    // Test query
    console.log('\n3️⃣ Testing messages query...')
    const contractAddress = '0x7ca094eb7e2e305135a0c49835e394b0daca8c56'
    const groupId = getCollectionChatId(contractAddress)

    console.log(`   Contract: ${contractAddress}`)
    console.log(`   Group ID: ${groupId}`)

    const { data, error, count } = await supabase
      .from(CHAT_MESSAGES_TABLE)
      .select('*', { count: 'exact' })
      .eq('collection_address', contractAddress.toLowerCase())
      .order('timestamp', { ascending: true })

    if (error) {
      console.error('\n❌ Supabase query error:')
      console.error('   Error code:', error.code)
      console.error('   Error message:', error.message)
      console.error('   Error details:', error.details)
      console.error('   Error hint:', error.hint)
      process.exit(1)
    }

    console.log(`\n   ✅ Query successful!`)
    console.log(`   📊 Found ${count} messages`)

    if (data && data.length > 0) {
      console.log('\n4️⃣ Sample message:')
      console.log(JSON.stringify(data[0], null, 2))
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ All tests passed!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  } catch (error: any) {
    console.error('\n❌ Unexpected error:')
    console.error('   Message:', error.message)
    console.error('   Stack:', error.stack)
    process.exit(1)
  }
}

testSupabaseMessages()
