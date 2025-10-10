/**
 * Verify database cleanup - check that only Z33Fi profile remains
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local explicitly
config({ path: resolve(process.cwd(), '.env.local') })

import { getSupabaseClient } from '../lib/supabase'

async function main() {
  console.log('🔍 Verifying database state after cleanup...\n')

  const supabase = getSupabaseClient()

  // Fetch all profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error fetching profiles:', error)
    return
  }

  console.log(`📊 Total profiles in database: ${profiles?.length || 0}\n`)

  if (!profiles || profiles.length === 0) {
    console.log('⚠️ No profiles found in database')
    return
  }

  // Display each profile
  for (const profile of profiles) {
    console.log('─'.repeat(60))
    console.log(`Username: ${profile.username}`)
    console.log(`ID: ${profile.id}`)
    console.log(`Email: ${profile.email || 'N/A'}`)
    console.log(`Created: ${new Date(profile.created_at).toLocaleString()}`)

    // Fetch wallets for this profile
    const { data: wallets } = await supabase
      .from('profile_wallets')
      .select('*')
      .eq('profile_id', profile.id)

    console.log(`Wallets: ${wallets?.length || 0}`)
    if (wallets && wallets.length > 0) {
      wallets.forEach((w, i) => {
        console.log(`  ${i + 1}. ${w.wallet_address} (${w.wallet_type})`)
      })
    }

    // Fetch OAuth accounts for this profile
    const { data: oauth } = await supabase
      .from('profile_oauth_accounts')
      .select('*')
      .eq('profile_id', profile.id)

    console.log(`OAuth Accounts: ${oauth?.length || 0}`)
    if (oauth && oauth.length > 0) {
      oauth.forEach((o, i) => {
        console.log(`  ${i + 1}. ${o.provider} (${o.email || 'no email'})`)
      })
    }
  }

  console.log('─'.repeat(60))

  // Summary
  console.log('\n📋 Summary:')
  if (profiles.length === 1 && profiles[0].username === 'Z33Fi') {
    console.log('✅ Database is clean! Only Z33Fi profile remains.')
  } else if (profiles.length > 1) {
    console.log(`⚠️ Multiple profiles found: ${profiles.map(p => p.username).join(', ')}`)
  } else {
    console.log(`⚠️ Unexpected state: ${profiles.length} profile(s) found`)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
