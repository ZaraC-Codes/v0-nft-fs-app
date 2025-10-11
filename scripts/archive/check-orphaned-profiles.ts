import { getSupabaseClient } from '../lib/supabase'

async function checkOrphanedProfiles() {
  const supabase = getSupabaseClient()
  
  console.log('🔍 Checking for orphaned profiles...\n')
  
  // Get all profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, created_at')
    .order('created_at', { ascending: false })
  
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
    return
  }
  
  console.log(`📊 Total profiles: ${profiles.length}\n`)
  
  for (const profile of profiles) {
    // Check wallets
    const { data: wallets, error: walletsError } = await supabase
      .from('wallets')
      .select('address, type')
      .eq('profile_id', profile.id)
    
    // Check OAuth accounts
    const { data: oauth, error: oauthError } = await supabase
      .from('oauth_accounts')
      .select('provider, provider_account_id')
      .eq('profile_id', profile.id)
    
    const hasWallets = wallets && wallets.length > 0
    const hasOAuth = oauth && oauth.length > 0
    
    console.log(`Profile: ${profile.username} (ID: ${profile.id})`)
    console.log(`  Created: ${new Date(profile.created_at).toLocaleString()}`)
    console.log(`  Wallets: ${hasWallets ? wallets.length : 0}`)
    if (hasWallets) {
      wallets.forEach(w => console.log(`    - ${w.address} (${w.type})`))
    }
    console.log(`  OAuth: ${hasOAuth ? oauth.length : 0}`)
    if (hasOAuth) {
      oauth.forEach(o => console.log(`    - ${o.provider} (${o.provider_account_id})`))
    }
    
    if (!hasWallets && !hasOAuth) {
      console.log(`  ⚠️ ORPHANED PROFILE - No wallets or OAuth accounts!`)
    }
    console.log('')
  }
}

checkOrphanedProfiles().catch(console.error)
