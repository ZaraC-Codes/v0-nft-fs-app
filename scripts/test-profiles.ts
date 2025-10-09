import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { getSupabaseClient } from "../lib/supabase"
import { ProfileService } from "../lib/profile-service"

async function testProfiles() {
  console.log('=== Testing Profile Database Access ===\n')

  const supabase = getSupabaseClient()

  // 1. Check if profiles table exists and count
  console.log('1. Checking profiles table...')
  const { data: profiles, error: profilesError, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })

  if (profilesError) {
    console.error('❌ Error fetching profiles:', profilesError)
  } else {
    console.log(`✅ Total profiles in database: ${count}`)
    if (profiles && profiles.length > 0) {
      console.log('\nProfiles found:')
      profiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. ${profile.username} (${profile.email || 'no email'})`)
        console.log(`     - ID: ${profile.id}`)
        console.log(`     - Created: ${profile.created_at}`)
      })
    } else {
      console.log('⚠️ No profiles found in database')
    }
  }

  // 2. Check profile wallets
  console.log('\n2. Checking profile wallets...')
  const { data: wallets, error: walletsError } = await supabase
    .from('profile_wallets')
    .select('*')

  if (walletsError) {
    console.error('❌ Error fetching wallets:', walletsError)
  } else {
    console.log(`✅ Total wallets in database: ${wallets?.length || 0}`)
    if (wallets && wallets.length > 0) {
      wallets.forEach((wallet, index) => {
        console.log(`  ${index + 1}. ${wallet.wallet_address} (${wallet.wallet_type}, primary: ${wallet.is_primary})`)
      })
    }
  }

  // 3. Check profile OAuth accounts
  console.log('\n3. Checking OAuth accounts...')
  const { data: oauthAccounts, error: oauthError } = await supabase
    .from('profile_oauth_accounts')
    .select('*')

  if (oauthError) {
    console.error('❌ Error fetching OAuth accounts:', oauthError)
  } else {
    console.log(`✅ Total OAuth accounts in database: ${oauthAccounts?.length || 0}`)
    if (oauthAccounts && oauthAccounts.length > 0) {
      oauthAccounts.forEach((account, index) => {
        console.log(`  ${index + 1}. ${account.provider} - ${account.email || 'no email'}`)
      })
    }
  }

  // 4. Test ProfileService.getAllProfilesFromDatabase()
  console.log('\n4. Testing ProfileService.getAllProfilesFromDatabase()...')
  try {
    const userProfiles = await ProfileService.getAllProfilesFromDatabase()
    console.log(`✅ ProfileService returned ${userProfiles.length} profiles`)

    if (userProfiles.length > 0) {
      console.log('\nProfiles from ProfileService:')
      userProfiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. ${profile.username}`)
        console.log(`     - Email: ${profile.email || 'none'}`)
        console.log(`     - Wallet: ${profile.walletAddress || 'none'}`)
        console.log(`     - Wallets count: ${profile.wallets?.length || 0}`)
      })
    }
  } catch (error) {
    console.error('❌ Error in ProfileService:', error)
  }

  // 5. Check RLS policies
  console.log('\n5. Checking if RLS (Row Level Security) is blocking reads...')
  console.log('   (If you see "permission denied" errors above, RLS might be enabled)')
  console.log('   To fix: Run this SQL in Supabase Dashboard:')
  console.log('   ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;')
  console.log('   ALTER TABLE profile_wallets DISABLE ROW LEVEL SECURITY;')
  console.log('   ALTER TABLE profile_oauth_accounts DISABLE ROW LEVEL SECURITY;')
}

testProfiles()
