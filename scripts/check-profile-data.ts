import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load .env.local
config({ path: '.env.local' })

async function checkProfiles() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local')
    console.log('URL:', supabaseUrl ? 'SET' : 'MISSING')
    console.log('KEY:', supabaseKey ? 'SET' : 'MISSING')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('🔍 Fetching profiles from Supabase...\n')

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }

  console.log(`✅ Found ${profiles?.length || 0} profiles in database\n`)

  profiles?.forEach((profile, index) => {
    console.log(`Profile ${index + 1}:`)
    console.log(`  ID: ${profile.id}`)
    console.log(`  Username: ${profile.username}`)
    console.log(`  Bio: ${profile.bio}`)
    console.log(`  Email: ${profile.email || 'N/A'}`)
    console.log(`  Avatar: ${profile.avatar || 'N/A'}`)
    console.log(`  Created: ${new Date(profile.created_at).toLocaleString()}`)
    console.log('')
  })

  // Check for wallet-generated usernames
  const walletProfiles = profiles?.filter(p =>
    p.username && (p.username.startsWith('0x') && p.username.includes('...'))
  )

  if (walletProfiles && walletProfiles.length > 0) {
    console.log(`⚠️ Found ${walletProfiles.length} profiles with auto-generated wallet usernames`)
    console.log('These should be updated to friendly usernames for better UX\n')
  } else {
    console.log('✅ All profiles have friendly usernames\n')
  }
}

checkProfiles()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Script error:', err)
    process.exit(1)
  })
