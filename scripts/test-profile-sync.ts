/**
 * Comprehensive Profile Sync Test Suite
 *
 * Tests all profile data sync patterns between localStorage and Supabase
 * to catch bugs like the Home page profile creation issue.
 */

import { ProfileService } from '../lib/profile-service'
import { getSupabaseClient } from '../lib/supabase'

interface TestResult {
  test: string
  status: 'PASS' | 'FAIL' | 'WARN'
  message: string
  details?: any
}

const results: TestResult[] = []

async function testProfileCreationSync() {
  console.log('\n🧪 Testing Profile Creation Sync...\n')

  const testOAuthData = {
    provider: 'google',
    providerAccountId: `test_${Date.now()}`,
    email: `test_${Date.now()}@example.com`
  }

  const testUsername = `testuser_${Date.now()}`
  const testWallet = `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`

  try {
    // Step 1: Create profile in Supabase
    console.log('📝 Creating profile in Supabase...')
    const profile = await ProfileService.createProfileInDatabase(
      testUsername,
      testOAuthData,
      testWallet
    )

    // Step 2: Verify profile exists in Supabase
    console.log('🔍 Verifying profile in Supabase...')
    const fetchedProfile = await ProfileService.getProfileByOAuthProvider(
      testOAuthData.provider,
      testOAuthData.providerAccountId
    )

    if (!fetchedProfile) {
      results.push({
        test: 'Profile Creation Sync',
        status: 'FAIL',
        message: 'Profile not found in Supabase after creation',
        details: { expectedId: profile.id }
      })
      return
    }

    // Step 3: Verify data integrity
    const checks = [
      { field: 'username', expected: testUsername, actual: fetchedProfile.username },
      { field: 'email', expected: testOAuthData.email, actual: fetchedProfile.email },
      { field: 'walletAddress', expected: testWallet, actual: fetchedProfile.walletAddress },
      { field: 'verified', expected: true, actual: fetchedProfile.verified }
    ]

    const failedChecks = checks.filter(c => c.expected !== c.actual)

    if (failedChecks.length > 0) {
      results.push({
        test: 'Profile Creation Sync',
        status: 'FAIL',
        message: 'Data mismatch detected',
        details: failedChecks
      })
    } else {
      results.push({
        test: 'Profile Creation Sync',
        status: 'PASS',
        message: 'Profile created and synced successfully'
      })
    }

    // Cleanup
    const supabase = getSupabaseClient()
    await supabase.from('profile_wallets').delete().eq('profile_id', profile.id)
    await supabase.from('profile_oauth_accounts').delete().eq('profile_id', profile.id)
    await supabase.from('profiles').delete().eq('id', profile.id)
    console.log('🧹 Cleaned up test data')

  } catch (error: any) {
    results.push({
      test: 'Profile Creation Sync',
      status: 'FAIL',
      message: `Error during test: ${error.message}`,
      details: error
    })
  }
}

async function testProfileUpdateSync() {
  console.log('\n🧪 Testing Profile Update Sync...\n')

  const testOAuthData = {
    provider: 'discord',
    providerAccountId: `test_${Date.now()}`,
    email: `test_${Date.now()}@example.com`
  }

  const testUsername = `testuser_${Date.now()}`
  const testWallet = `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`

  try {
    // Create test profile
    const profile = await ProfileService.createProfileInDatabase(
      testUsername,
      testOAuthData,
      testWallet
    )

    // Update profile
    const updates = {
      bio: 'Updated bio for testing',
      twitter: 'testhandle',
      instagram: 'testinsta',
      showWalletAddress: false,
      showEmail: true
    }

    console.log('📝 Updating profile in Supabase...')
    await ProfileService.updateProfileInDatabase(profile.id, updates)

    // Verify update
    console.log('🔍 Verifying updates in Supabase...')
    const supabase = getSupabaseClient()
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profile.id)
      .single()

    if (error) throw error

    const checks = [
      { field: 'bio', expected: updates.bio, actual: updatedProfile.bio },
      { field: 'twitter', expected: updates.twitter, actual: updatedProfile.twitter },
      { field: 'instagram', expected: updates.instagram, actual: updatedProfile.instagram },
      { field: 'show_wallet_address', expected: updates.showWalletAddress, actual: updatedProfile.show_wallet_address },
      { field: 'show_email', expected: updates.showEmail, actual: updatedProfile.show_email }
    ]

    const failedChecks = checks.filter(c => c.expected !== c.actual)

    if (failedChecks.length > 0) {
      results.push({
        test: 'Profile Update Sync',
        status: 'FAIL',
        message: 'Update data mismatch',
        details: failedChecks
      })
    } else {
      results.push({
        test: 'Profile Update Sync',
        status: 'PASS',
        message: 'Profile updates synced successfully'
      })
    }

    // Cleanup
    await supabase.from('profile_wallets').delete().eq('profile_id', profile.id)
    await supabase.from('profile_oauth_accounts').delete().eq('profile_id', profile.id)
    await supabase.from('profiles').delete().eq('id', profile.id)

  } catch (error: any) {
    results.push({
      test: 'Profile Update Sync',
      status: 'FAIL',
      message: `Error during test: ${error.message}`,
      details: error
    })
  }
}

async function testWalletLinkingSync() {
  console.log('\n🧪 Testing Wallet Linking Sync...\n')

  const testOAuthData = {
    provider: 'twitter',
    providerAccountId: `test_${Date.now()}`,
    email: `test_${Date.now()}@example.com`
  }

  const testUsername = `testuser_${Date.now()}`
  const embeddedWallet = `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`
  const externalWallet = `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`

  try {
    // Create profile with embedded wallet
    const profile = await ProfileService.createProfileInDatabase(
      testUsername,
      testOAuthData,
      embeddedWallet
    )

    // Link external wallet
    console.log('🔗 Linking external wallet...')
    await ProfileService.linkWalletToProfileInDatabase(
      profile.id,
      externalWallet,
      'metamask'
    )

    // Verify both wallets linked
    console.log('🔍 Verifying wallet links...')
    const supabase = getSupabaseClient()
    const { data: wallets, error } = await supabase
      .from('profile_wallets')
      .select('*')
      .eq('profile_id', profile.id)

    if (error) throw error

    if (wallets.length !== 2) {
      results.push({
        test: 'Wallet Linking Sync',
        status: 'FAIL',
        message: `Expected 2 wallets, found ${wallets.length}`,
        details: wallets
      })
    } else {
      const hasEmbedded = wallets.some(w => w.wallet_address === embeddedWallet && w.wallet_type === 'embedded')
      const hasExternal = wallets.some(w => w.wallet_address === externalWallet && w.wallet_type === 'metamask')

      if (hasEmbedded && hasExternal) {
        results.push({
          test: 'Wallet Linking Sync',
          status: 'PASS',
          message: 'Both wallets linked successfully'
        })
      } else {
        results.push({
          test: 'Wallet Linking Sync',
          status: 'FAIL',
          message: 'Wallet metadata incorrect',
          details: { hasEmbedded, hasExternal, wallets }
        })
      }
    }

    // Cleanup
    await supabase.from('profile_wallets').delete().eq('profile_id', profile.id)
    await supabase.from('profile_oauth_accounts').delete().eq('profile_id', profile.id)
    await supabase.from('profiles').delete().eq('id', profile.id)

  } catch (error: any) {
    results.push({
      test: 'Wallet Linking Sync',
      status: 'FAIL',
      message: `Error during test: ${error.message}`,
      details: error
    })
  }
}

async function testFollowSync() {
  console.log('\n🧪 Testing Follow System Sync...\n')

  const supabase = getSupabaseClient()

  // Create two test profiles
  const user1 = await ProfileService.createProfileInDatabase(
    `user1_${Date.now()}`,
    { provider: 'google', providerAccountId: `test1_${Date.now()}`, email: 'user1@test.com' },
    `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`
  )

  const user2 = await ProfileService.createProfileInDatabase(
    `user2_${Date.now()}`,
    { provider: 'google', providerAccountId: `test2_${Date.now()}`, email: 'user2@test.com' },
    `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`
  )

  try {
    // User1 follows User2
    console.log('👥 Creating follow relationship...')
    await ProfileService.followUser(user1.id, user2.id)

    // Verify follow exists
    console.log('🔍 Verifying follow in Supabase...')
    const isFollowing = await ProfileService.isFollowing(user1.id, user2.id)

    if (!isFollowing) {
      results.push({
        test: 'Follow System Sync',
        status: 'FAIL',
        message: 'Follow relationship not found in Supabase',
        details: { follower: user1.id, following: user2.id }
      })
    } else {
      // Verify counts
      const counts = await ProfileService.getFollowCounts(user2.id)

      if (counts.followers === 1) {
        results.push({
          test: 'Follow System Sync',
          status: 'PASS',
          message: 'Follow relationship synced correctly'
        })
      } else {
        results.push({
          test: 'Follow System Sync',
          status: 'FAIL',
          message: `Follower count incorrect. Expected 1, got ${counts.followers}`,
          details: counts
        })
      }
    }

    // Cleanup
    await supabase.from('profile_follows').delete().eq('follower_id', user1.id)
    await supabase.from('profile_wallets').delete().eq('profile_id', user1.id)
    await supabase.from('profile_wallets').delete().eq('profile_id', user2.id)
    await supabase.from('profile_oauth_accounts').delete().eq('profile_id', user1.id)
    await supabase.from('profile_oauth_accounts').delete().eq('profile_id', user2.id)
    await supabase.from('profiles').delete().eq('id', user1.id)
    await supabase.from('profiles').delete().eq('id', user2.id)

  } catch (error: any) {
    results.push({
      test: 'Follow System Sync',
      status: 'FAIL',
      message: `Error during test: ${error.message}`,
      details: error
    })
  }
}

async function testWatchlistSync() {
  console.log('\n🧪 Testing Watchlist Sync...\n')

  const testOAuthData = {
    provider: 'apple',
    providerAccountId: `test_${Date.now()}`,
    email: `test_${Date.now()}@example.com`
  }

  const testUsername = `testuser_${Date.now()}`
  const testWallet = `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`

  try {
    // Create profile
    const profile = await ProfileService.createProfileInDatabase(
      testUsername,
      testOAuthData,
      testWallet
    )

    // Add to watchlist
    const collectionAddress = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D'
    const chainId = 1

    console.log('⭐ Adding collection to watchlist...')
    await ProfileService.addToWatchlist(
      profile.id,
      collectionAddress,
      chainId,
      'Bored Ape Yacht Club',
      'https://example.com/bayc.png'
    )

    // Verify watchlist
    console.log('🔍 Verifying watchlist in Supabase...')
    const isInWatchlist = await ProfileService.isInWatchlist(
      profile.id,
      collectionAddress,
      chainId
    )

    if (!isInWatchlist) {
      results.push({
        test: 'Watchlist Sync',
        status: 'FAIL',
        message: 'Collection not found in watchlist',
        details: { profileId: profile.id, collection: collectionAddress }
      })
    } else {
      // Verify metadata
      const watchlist = await ProfileService.getWatchlist(profile.id)
      const item = watchlist.find(w => w.collectionAddress === collectionAddress)

      if (item && item.collectionName === 'Bored Ape Yacht Club') {
        results.push({
          test: 'Watchlist Sync',
          status: 'PASS',
          message: 'Watchlist item synced with metadata'
        })
      } else {
        results.push({
          test: 'Watchlist Sync',
          status: 'FAIL',
          message: 'Watchlist metadata incorrect',
          details: item
        })
      }
    }

    // Cleanup
    const supabase = getSupabaseClient()
    await supabase.from('profile_watchlist').delete().eq('profile_id', profile.id)
    await supabase.from('profile_wallets').delete().eq('profile_id', profile.id)
    await supabase.from('profile_oauth_accounts').delete().eq('profile_id', profile.id)
    await supabase.from('profiles').delete().eq('id', profile.id)

  } catch (error: any) {
    results.push({
      test: 'Watchlist Sync',
      status: 'FAIL',
      message: `Error during test: ${error.message}`,
      details: error
    })
  }
}

async function testLocalStorageCacheMismatch() {
  console.log('\n🧪 Testing localStorage vs Supabase Consistency...\n')

  try {
    // Get all profiles from localStorage
    const localProfiles = ProfileService.getProfiles()

    // Get all profiles from Supabase
    const supabaseProfiles = await ProfileService.getAllProfilesFromDatabase()

    if (localProfiles.length === 0 && supabaseProfiles.length === 0) {
      results.push({
        test: 'Cache Consistency',
        status: 'PASS',
        message: 'No profiles to compare (both empty)'
      })
      return
    }

    // Check for profiles in Supabase but not in localStorage
    const missingFromLocal = supabaseProfiles.filter(sp =>
      !localProfiles.some(lp => lp.id === sp.id)
    )

    // Check for profiles in localStorage but not in Supabase
    const missingFromSupabase = localProfiles.filter(lp =>
      !supabaseProfiles.some(sp => sp.id === lp.id)
    )

    if (missingFromLocal.length > 0 || missingFromSupabase.length > 0) {
      results.push({
        test: 'Cache Consistency',
        status: 'WARN',
        message: 'Mismatch between localStorage and Supabase',
        details: {
          missingFromLocal: missingFromLocal.map(p => ({ id: p.id, username: p.username })),
          missingFromSupabase: missingFromSupabase.map(p => ({ id: p.id, username: p.username }))
        }
      })
    } else {
      results.push({
        test: 'Cache Consistency',
        status: 'PASS',
        message: `All ${localProfiles.length} profiles synced between localStorage and Supabase`
      })
    }

  } catch (error: any) {
    results.push({
      test: 'Cache Consistency',
      status: 'FAIL',
      message: `Error during test: ${error.message}`,
      details: error
    })
  }
}

async function runAllTests() {
  console.log('═══════════════════════════════════════════')
  console.log('🧪 COMPREHENSIVE SUPABASE SYNC TEST SUITE')
  console.log('═══════════════════════════════════════════')

  await testProfileCreationSync()
  await testProfileUpdateSync()
  await testWalletLinkingSync()
  await testFollowSync()
  await testWatchlistSync()
  await testLocalStorageCacheMismatch()

  console.log('\n═══════════════════════════════════════════')
  console.log('📊 TEST RESULTS SUMMARY')
  console.log('═══════════════════════════════════════════\n')

  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const warnings = results.filter(r => r.status === 'WARN').length

  results.forEach(result => {
    const emoji = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️'
    console.log(`${emoji} ${result.test}: ${result.message}`)
    if (result.details) {
      console.log(`   Details:`, JSON.stringify(result.details, null, 2))
    }
  })

  console.log(`\n📈 Total: ${results.length} | ✅ Passed: ${passed} | ❌ Failed: ${failed} | ⚠️ Warnings: ${warnings}`)

  if (failed > 0) {
    console.log('\n❌ TEST SUITE FAILED - Fix critical sync issues before deploying!')
    process.exit(1)
  } else if (warnings > 0) {
    console.log('\n⚠️ TEST SUITE PASSED WITH WARNINGS - Review warnings before deploying')
    process.exit(0)
  } else {
    console.log('\n✅ TEST SUITE PASSED - All data syncs correctly!')
    process.exit(0)
  }
}

runAllTests()
