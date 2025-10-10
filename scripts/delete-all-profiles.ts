import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

async function deleteAllProfiles() {
  // Use service role key for admin operations
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log('🗑️ Deleting all profile data from Supabase...\n')

  // Delete profile_wallets first (foreign key constraint)
  console.log('📝 Deleting profile_wallets...')
  const { data: wallets, error: walletsError } = await supabase
    .from('profile_wallets')
    .delete()
    .neq('wallet_address', '')
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
    .neq('id', '')
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
