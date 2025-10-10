import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error(`URL: ${supabaseUrl ? 'SET' : 'MISSING'}`)
  console.error(`Anon Key: ${supabaseAnonKey ? 'SET' : 'MISSING'}`)
  process.exit(1)
}

async function deleteAllProfiles() {
  // Use anon key (RLS policies should allow deletion)
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log('🗑️ Deleting all profile data from Supabase...\n')

  // Get all profile IDs first
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id')

  if (!allProfiles || allProfiles.length === 0) {
    console.log('✅ No profiles to delete')
    return
  }

  const profileIds = allProfiles.map(p => p.id)
  console.log(`Found ${profileIds.length} profile(s) to delete\n`)

  // Delete profile_oauth_accounts first (foreign key constraint)
  console.log('📝 Deleting profile_oauth_accounts...')
  const { data: oauth, error: oauthError } = await supabase
    .from('profile_oauth_accounts')
    .delete()
    .in('profile_id', profileIds)
    .select()

  if (oauthError) {
    console.error('❌ Error deleting OAuth accounts:', oauthError)
  } else {
    console.log(`✅ Deleted ${oauth?.length || 0} OAuth accounts\n`)
  }

  // Delete profile_wallets (foreign key constraint)
  console.log('📝 Deleting profile_wallets...')
  const { data: wallets, error: walletsError } = await supabase
    .from('profile_wallets')
    .delete()
    .in('profile_id', profileIds)
    .select()

  if (walletsError) {
    console.error('❌ Error deleting wallets:', walletsError)
  } else {
    console.log(`✅ Deleted ${wallets?.length || 0} profile_wallets\n`)
  }

  // Delete all profiles
  console.log('📝 Deleting profiles...')
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .delete()
    .in('id', profileIds)
    .select()

  if (profilesError) {
    console.error('❌ Error deleting profiles:', profilesError)
  } else {
    console.log(`✅ Deleted ${profiles?.length || 0} profiles\n`)
  }

  // Verify deletion
  console.log('🔍 Verifying deletion...')
  const { data: remainingProfiles, error: checkError } = await supabase
    .from('profiles')
    .select('*')

  if (checkError) {
    console.error('❌ Error checking profiles:', checkError)
  } else {
    console.log(`📊 Remaining profiles in database: ${remainingProfiles?.length || 0}`)
  }

  console.log('\n🎉 Done! All profiles deleted from database.')
  console.log('💡 Note: You still need to clear localStorage in browser console:')
  console.log('   localStorage.clear()')
}

deleteAllProfiles()
