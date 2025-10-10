/**
 * Diagnostic Script: Profile Issues
 *
 * Checks database state to diagnose:
 * - Duplicate profiles
 * - ID format mismatches
 * - Profile data consistency
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function diagnoseProfiles() {
  console.log('🔍 PROFILE DIAGNOSTICS')
  console.log('=' .repeat(80))

  // 1. Check all profiles
  console.log('\n1️⃣ ALL PROFILES:')
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, email, wallet_address, created_at')
    .order('created_at', { ascending: false })

  if (profilesError) {
    console.error('❌ Error fetching profiles:', profilesError)
  } else {
    console.log(`\n   Found ${profiles?.length || 0} profiles:`)
    profiles?.forEach((p, i) => {
      console.log(`\n   Profile ${i + 1}:`)
      console.log(`   - ID: ${p.id}`)
      console.log(`   - Username: ${p.username}`)
      console.log(`   - Email: ${p.email || 'none'}`)
      console.log(`   - Wallet: ${p.wallet_address || 'none'}`)
      console.log(`   - Created: ${p.created_at}`)
    })
  }

  // 2. Check for duplicate usernames
  console.log('\n\n2️⃣ DUPLICATE USERNAMES:')
  const { data: duplicates, error: dupError } = await supabase
    .rpc('check_duplicate_usernames')
    .catch(() => null)

  // Fallback: manual duplicate check
  const usernameCounts: Record<string, number> = {}
  profiles?.forEach(p => {
    usernameCounts[p.username] = (usernameCounts[p.username] || 0) + 1
  })

  const dupes = Object.entries(usernameCounts).filter(([_, count]) => count > 1)
  if (dupes.length > 0) {
    console.log('   ⚠️ Found duplicates:')
    dupes.forEach(([username, count]) => {
      console.log(`   - "${username}": ${count} profiles`)
    })
  } else {
    console.log('   ✅ No duplicate usernames found')
  }

  // 3. Check profile wallets
  console.log('\n\n3️⃣ PROFILE WALLETS:')
  const { data: wallets, error: walletsError } = await supabase
    .from('profile_wallets')
    .select('profile_id, address, wallet_type, is_primary, created_at')
    .order('created_at', { ascending: false })

  if (walletsError) {
    console.error('❌ Error fetching wallets:', walletsError)
  } else {
    console.log(`\n   Found ${wallets?.length || 0} wallets:`)
    wallets?.forEach((w, i) => {
      console.log(`\n   Wallet ${i + 1}:`)
      console.log(`   - Profile ID: ${w.profile_id}`)
      console.log(`   - Address: ${w.address}`)
      console.log(`   - Type: ${w.wallet_type}`)
      console.log(`   - Is Primary: ${w.is_primary}`)
      console.log(`   - Created: ${w.created_at}`)
    })
  }

  // 4. Check ID formats
  console.log('\n\n4️⃣ ID FORMAT VALIDATION:')
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  profiles?.forEach(p => {
    const isValidUUID = uuidRegex.test(p.id)
    const status = isValidUUID ? '✅' : '❌'
    console.log(`   ${status} ${p.username}: ${p.id} ${!isValidUUID ? '(INVALID UUID)' : ''}`)
  })

  // 5. Check for orphaned wallets
  console.log('\n\n5️⃣ ORPHANED WALLETS:')
  const profileIds = new Set(profiles?.map(p => p.id) || [])
  const orphaned = wallets?.filter(w => !profileIds.has(w.profile_id)) || []

  if (orphaned.length > 0) {
    console.log(`   ⚠️ Found ${orphaned.length} orphaned wallets:`)
    orphaned.forEach(w => {
      console.log(`   - Address: ${w.address}`)
      console.log(`     Profile ID: ${w.profile_id} (profile not found)`)
    })
  } else {
    console.log('   ✅ No orphaned wallets')
  }

  // 6. Summary
  console.log('\n\n📊 SUMMARY:')
  console.log(`   - Total Profiles: ${profiles?.length || 0}`)
  console.log(`   - Total Wallets: ${wallets?.length || 0}`)
  console.log(`   - Duplicate Usernames: ${dupes.length}`)
  console.log(`   - Invalid UUIDs: ${profiles?.filter(p => !uuidRegex.test(p.id)).length || 0}`)
  console.log(`   - Orphaned Wallets: ${orphaned.length}`)

  console.log('\n' + '='.repeat(80))
}

diagnoseProfiles()
  .then(() => {
    console.log('\n✅ Diagnostics complete')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Diagnostics failed:', error)
    process.exit(1)
  })
