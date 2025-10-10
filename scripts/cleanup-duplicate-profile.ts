/**
 * Cleanup script to delete duplicate profile from database
 *
 * This script deletes the profile with ID: 752dbfa0-07e4-4012-bc8f-9513981d18c8
 * which was created with username "Collector6130" and wallet address 0xB270b7D2AD432958b55822E17e6b2d05c1ab136b
 *
 * This is a duplicate/invalid profile that was created due to the bug where
 * createProfileInDatabase threw an error on OAuth account conflict but the profile
 * was already created.
 */

import { getSupabaseClient } from '../lib/supabase'

const DUPLICATE_PROFILE_ID = '752dbfa0-07e4-4012-bc8f-9513981d18c8'

async function cleanupDuplicateProfile() {
  const supabase = getSupabaseClient()

  console.log('🧹 Starting cleanup of duplicate profile...')
  console.log(`📋 Profile ID to delete: ${DUPLICATE_PROFILE_ID}`)

  try {
    // 1. First, fetch the profile to confirm details
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', DUPLICATE_PROFILE_ID)
      .single()

    if (fetchError || !profile) {
      console.log('✅ Profile not found - already deleted or never existed')
      return
    }

    console.log('📋 Profile found:')
    console.log(`   Username: ${profile.username}`)
    console.log(`   Email: ${profile.email}`)
    console.log(`   Created: ${profile.created_at}`)

    // 2. Delete associated OAuth accounts
    const { error: oauthError } = await supabase
      .from('profile_oauth_accounts')
      .delete()
      .eq('profile_id', DUPLICATE_PROFILE_ID)

    if (oauthError) {
      console.error('❌ Error deleting OAuth accounts:', oauthError)
      throw oauthError
    }
    console.log('✅ Deleted OAuth accounts')

    // 3. Delete associated wallets
    const { error: walletError } = await supabase
      .from('profile_wallets')
      .delete()
      .eq('profile_id', DUPLICATE_PROFILE_ID)

    if (walletError) {
      console.error('❌ Error deleting wallets:', walletError)
      throw walletError
    }
    console.log('✅ Deleted associated wallets')

    // 4. Delete the profile itself
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', DUPLICATE_PROFILE_ID)

    if (profileError) {
      console.error('❌ Error deleting profile:', profileError)
      throw profileError
    }
    console.log('✅ Deleted profile')

    console.log('🎉 Cleanup completed successfully!')
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    throw error
  }
}

// Run the cleanup
cleanupDuplicateProfile()
  .then(() => {
    console.log('✅ Script finished successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
