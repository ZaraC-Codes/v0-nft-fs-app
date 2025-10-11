import 'dotenv/config'
import { getSupabaseClient } from '../lib/supabase'

const supabase = getSupabaseClient()

async function checkProfiles() {
  console.log('🔍 Checking profiles in database...\n')

  // Get all profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, username, email, wallet_address, created_at, avatar')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log('=== ALL PROFILES ===')
  profiles?.forEach((p, i) => {
    console.log(`\n${i + 1}. ${p.username}`)
    console.log(`   ID: ${p.id}`)
    console.log(`   Email: ${p.email || 'N/A'}`)
    console.log(`   Wallet: ${p.wallet_address || 'N/A'}`)
    console.log(`   Avatar: ${p.avatar ? 'Yes' : 'No'}`)
    console.log(`   Created: ${p.created_at}`)
  })

  // Check for duplicate usernames
  const usernames = profiles?.map(p => p.username) || []
  const duplicates = usernames.filter((u, i) => usernames.indexOf(u) !== i)

  console.log('\n\n=== DUPLICATES CHECK ===')
  if (duplicates.length > 0) {
    console.log('⚠️  Found duplicate usernames:', duplicates)
  } else {
    console.log('✅ No duplicate usernames found')
  }

  console.log('\n=== SUMMARY ===')
  console.log(`Total profiles: ${profiles?.length || 0}`)
}

checkProfiles().catch(console.error)
