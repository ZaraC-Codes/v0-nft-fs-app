import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { getSupabaseClient, CHAT_MESSAGES_TABLE } from "../lib/supabase"

async function testSupabase() {
  const supabase = getSupabaseClient()

  const { data, error, count } = await supabase
    .from(CHAT_MESSAGES_TABLE)
    .select('*', { count: 'exact' })
    .eq('collection_address', '0x7ca094eb7e2e305135a0c49835e394b0daca8c56')

  console.log('Messages in Supabase:', count)
  console.log('Error:', error)
  console.log('Sample messages:', data?.slice(0, 3).map(m => m.content))
}

testSupabase()
