import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { getSupabaseClient } from '../lib/supabase'

async function main() {
  const walletAddress = '0xB270b7D2AD432958b55822E17e6b2d05c1ab136b'

  console.log(`🔍 Checking ownership for wallet: ${walletAddress}\n`)

  const supabase = getSupabaseClient()

  // Find which profile owns this wallet
  const { data: walletLink, error } = await supabase
    .from('profile_wallets')
    .select('profile_id, wallet_address')
    .eq('wallet_address', walletAddress.toLowerCase())
    .single()

  if (error) {
    console.log('❌ Error:', error)
    return
  }

  if (!walletLink) {
    console.log('✅ Wallet is not linked to any profile')
    return
  }

  console.log('📍 Wallet is linked to profile:', walletLink.profile_id)

  // Get the profile details
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', walletLink.profile_id)
    .single()

  if (profile) {
    console.log('\nProfile Details:')
    console.log('- ID:', profile.id)
    console.log('- Username:', profile.username)
    console.log('- Email:', profile.email || 'N/A')
    console.log('- Created:', new Date(profile.created_at).toLocaleString())
  }

  // Check for OAuth accounts
  const { data: oauth } = await supabase
    .from('profile_oauth_accounts')
    .select('*')
    .eq('profile_id', walletLink.profile_id)

  console.log('\nOAuth Accounts:', oauth?.length || 0)
  oauth?.forEach(account => {
    console.log(`- ${account.provider}: ${account.email || account.provider_account_id}`)
  })

  // Check for other wallets
  const { data: wallets } = await supabase
    .from('profile_wallets')
    .select('*')
    .eq('profile_id', walletLink.profile_id)

  console.log('\nLinked Wallets:', wallets?.length || 0)
  wallets?.forEach(wallet => {
    console.log(`- ${wallet.wallet_address}`)
  })

  // Determine if this is an orphaned profile
  const isOrphaned = (!oauth || oauth.length === 0) && (!wallets || wallets.length <= 1)

  if (isOrphaned) {
    console.log('\n⚠️ This appears to be an ORPHANED profile (no OAuth, only 1 wallet)')
    console.log('🔧 You can safely delete this profile to unblock login')
  } else {
    console.log('\n✅ This is a VALID profile with OAuth or multiple wallets')
  }
}

main()
