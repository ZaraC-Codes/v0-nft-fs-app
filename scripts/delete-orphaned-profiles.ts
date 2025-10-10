/**
 * Delete orphaned profiles (profiles with no wallets AND no OAuth accounts)
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local explicitly
config({ path: resolve(process.cwd(), '.env.local') })

import { getSupabaseClient } from '../lib/supabase'

async function main() {
  console.log('🗑️ Deleting orphaned profiles...\n')

  const supabase = getSupabaseClient()

  // IDs of orphaned profiles
  const orphanedIds = [
    'ae752788-c829-403d-8ceb-379eaee695eb', // Collector6005
    '10d4592b-acaf-4127-b2b1-198ce69485e5'  // Collector4676
  ]

  for (const id of orphanedIds) {
    console.log(`Deleting profile ${id}...`)

    const { data, error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error(`❌ Error deleting profile ${id}:`, error)
    } else {
      console.log(`✅ Deleted profile:`, data?.username)
    }
  }

  console.log('\n✅ Cleanup complete')
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
