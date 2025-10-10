import { getSupabaseClient } from '../lib/supabase'

async function fixUserProfile() {
  const supabase = getSupabaseClient()

  console.log('🔍 Checking profiles in database...\n')

  // Get all profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error fetching profiles:', error)
    return
  }

  console.log(`📊 Found ${profiles?.length || 0} profiles\n`)

  // Show current profile data
  profiles?.forEach((profile, index) => {
    console.log(`Profile ${index + 1}:`)
    console.log(`  ID: ${profile.id}`)
    console.log(`  Username: ${profile.username}`)
    console.log(`  Bio: ${profile.bio}`)
    console.log(`  Created: ${profile.created_at}`)
    console.log(`  Email: ${profile.email}`)
    console.log('')
  })

  // Find the profile with wallet-generated username
  const walletProfile = profiles?.find(p =>
    p.username && p.username.startsWith('0x') && p.username.includes('...')
  )

  if (!walletProfile) {
    console.log('✅ No wallet-generated usernames found. All profiles are clean!')
    return
  }

  console.log('🔧 Found profile with auto-generated username:', walletProfile.username)
  console.log('📝 Would you like to update this to a friendly username?\n')

  // Generate a friendly username
  const friendlyUsername = `Tester${Math.floor(Math.random() * 1000)}`
  const newBio = 'Welcome to Fortuna Square! NFT enthusiast exploring the platform.'

  console.log(`Suggested updates:`)
  console.log(`  New Username: ${friendlyUsername}`)
  console.log(`  New Bio: ${newBio}`)
  console.log('')
  console.log('To apply this update, uncomment the update code below and run again.')
  console.log('')

  // UNCOMMENT TO ACTUALLY UPDATE:
  /*
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      username: friendlyUsername,
      bio: newBio
    })
    .eq('id', walletProfile.id)

  if (updateError) {
    console.error('❌ Update failed:', updateError)
  } else {
    console.log('✅ Profile updated successfully!')
    console.log(`   Username: ${walletProfile.username} → ${friendlyUsername}`)
    console.log(`   Bio: ${walletProfile.bio} → ${newBio}`)
  }
  */
}

fixUserProfile()
  .then(() => {
    console.log('\n✅ Script complete')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Script error:', error)
    process.exit(1)
  })
