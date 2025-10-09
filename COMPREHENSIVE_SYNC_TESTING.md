# Comprehensive Supabase Sync Testing Plan

**Purpose:** Catch ALL data sync issues between localStorage and Supabase to prevent silent failures like the Home page profile bug.

**Last Updated:** 2025-10-09

---

## Section 1: Complete Test Case Matrix

### 1.1 Profile Data Sync Tests

| Feature | Operation | Device A Action | Expected Device B Result | Priority |
|---------|-----------|-----------------|--------------------------|----------|
| **Profile Creation** | OAuth (Google) | Sign up with Google | Profile exists in Supabase, Device B sees it | P0 |
| **Profile Creation** | OAuth (Discord) | Sign up with Discord | Profile exists in Supabase, Device B sees it | P0 |
| **Profile Creation** | OAuth (Twitter) | Sign up with Twitter | Profile exists in Supabase, Device B sees it | P0 |
| **Profile Creation** | OAuth (Facebook) | Sign up with Facebook | Profile exists in Supabase, Device B sees it | P0 |
| **Profile Creation** | OAuth (Apple) | Sign up with Apple | Profile exists in Supabase, Device B sees it | P0 |
| **Profile Creation** | Email/Passkey | Sign up with email | Profile exists in Supabase, Device B sees it | P0 |
| **Profile Update** | Username | Change username on Device A | Device B shows new username | P0 |
| **Profile Update** | Avatar | Upload new avatar on Device A | Device B shows new avatar | P0 |
| **Profile Update** | Bio | Update bio on Device A | Device B shows new bio | P0 |
| **Profile Update** | Banner | Change banner image on Device A | Device B shows new banner | P0 |
| **Profile Update** | Twitter Handle | Update Twitter link on Device A | Device B shows new Twitter | P1 |
| **Profile Update** | Instagram Handle | Update Instagram link on Device A | Device B shows new Instagram | P1 |
| **Profile Update** | Discord Handle | Update Discord link on Device A | Device B shows new Discord | P1 |
| **Profile Update** | Website URL | Update website on Device A | Device B shows new website | P1 |
| **Profile Update** | Email | Change email on Device A | Device B shows new email | P0 |
| **Privacy Settings** | Wallet Visibility | Toggle `showWalletAddress` on Device A | Device B reflects change | P1 |
| **Privacy Settings** | Email Visibility | Toggle `showEmail` on Device A | Device B reflects change | P1 |
| **Privacy Settings** | Public Profile | Toggle `isPublic` on Device A | Device B reflects change | P1 |

### 1.2 Wallet Management Sync Tests

| Feature | Operation | Device A Action | Expected Device B Result | Priority |
|---------|-----------|-----------------|--------------------------|----------|
| **Wallet Linking** | Add MetaMask | Link MetaMask wallet | Device B shows wallet in linked wallets | P0 |
| **Wallet Linking** | Add Coinbase | Link Coinbase wallet | Device B shows wallet in linked wallets | P0 |
| **Wallet Linking** | Add Rabby | Link Rabby wallet | Device B shows wallet in linked wallets | P0 |
| **Wallet Linking** | Add Glyph | Link Glyph wallet | Device B shows wallet in linked wallets | P0 |
| **Wallet Unlinking** | Remove wallet | Unlink MetaMask wallet | Device B no longer shows wallet | P0 |
| **Primary Wallet** | Set primary | Set MetaMask as primary | Device B shows MetaMask as primary | P0 |
| **Active Wallet** | Switch active | Switch to Coinbase as active | Device B shows Coinbase as active | P0 |
| **Wallet Metadata** | Add label | Add custom label to wallet | Device B shows wallet label | P2 |

### 1.3 Social Features Sync Tests

| Feature | Operation | Device A Action | Expected Device B Result | Priority |
|---------|-----------|-----------------|--------------------------|----------|
| **Follow System** | Follow user | Follow user `alice` | Device B shows `alice` in following list | P0 |
| **Follow System** | Unfollow user | Unfollow user `alice` | Device B removes `alice` from following | P0 |
| **Follow System** | Follower count | User `bob` follows me | Device B shows +1 follower count | P0 |
| **Follow System** | Following count | Follow user `charlie` | Device B shows +1 following count | P0 |
| **Follow System** | Bi-directional | `alice` follows me, I follow `alice` | Device B shows in both lists | P1 |

### 1.4 Watchlist Sync Tests

| Feature | Operation | Device A Action | Expected Device B Result | Priority |
|---------|-----------|-----------------|--------------------------|----------|
| **Watchlist Add** | Add collection | Add BAYC to watchlist | Device B shows BAYC in watchlist | P0 |
| **Watchlist Add** | Add with metadata | Add collection with name/image | Device B shows metadata | P0 |
| **Watchlist Remove** | Remove collection | Remove BAYC from watchlist | Device B removes BAYC | P0 |
| **Watchlist Check** | Check status | Add collection on Device A | `isInWatchlist()` returns true on Device B | P0 |
| **Cross-chain** | Different chains | Add same contract on chain 1 & 137 | Device B shows both (different chain IDs) | P1 |

### 1.5 OAuth Account Linking

| Feature | Operation | Device A Action | Expected Device B Result | Priority |
|---------|-----------|-----------------|--------------------------|----------|
| **OAuth Lookup** | Login existing | Login with Google on Device B (existing account) | Finds existing profile via OAuth | P0 |
| **OAuth Lookup** | Multi-provider | Link Twitter to Google account | Device B shows both OAuth providers | P1 |
| **OAuth Wallet Link** | New device wallet | Login with Google on new device | Creates new embedded wallet, links to profile | P0 |

---

## Section 2: Automated Test Scripts

### 2.1 Profile Sync Verification Script

```typescript
// scripts/test-profile-sync.ts
import { ProfileService } from '@/lib/profile-service'
import { getSupabaseClient } from '@/lib/supabase'

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
  const testWallet = `0x${Math.random().toString(16).slice(2, 42)}`

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

  } catch (error) {
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
  const testWallet = `0x${Math.random().toString(16).slice(2, 42)}`

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

  } catch (error) {
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
  const embeddedWallet = `0x${Math.random().toString(16).slice(2, 42)}`
  const externalWallet = `0x${Math.random().toString(16).slice(2, 42)}`

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

  } catch (error) {
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
    `0x${Math.random().toString(16).slice(2, 42)}`
  )

  const user2 = await ProfileService.createProfileInDatabase(
    `user2_${Date.now()}`,
    { provider: 'google', providerAccountId: `test2_${Date.now()}`, email: 'user2@test.com' },
    `0x${Math.random().toString(16).slice(2, 42)}`
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

  } catch (error) {
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
  const testWallet = `0x${Math.random().toString(16).slice(2, 42)}`

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

  } catch (error) {
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

  } catch (error) {
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
```

### 2.2 Data Integrity Audit Script

```typescript
// scripts/audit-data-integrity.ts
import { ProfileService } from '@/lib/profile-service'
import { getSupabaseClient } from '@/lib/supabase'

interface IntegrityIssue {
  type: 'ERROR' | 'WARNING' | 'INFO'
  category: string
  message: string
  affectedData?: any
}

const issues: IntegrityIssue[] = []

async function auditProfiles() {
  console.log('\n🔍 Auditing Profiles...\n')

  const supabase = getSupabaseClient()

  // Get all profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(`
      *,
      profile_wallets (
        wallet_address,
        wallet_type,
        is_primary,
        added_at
      ),
      profile_oauth_accounts (
        provider,
        provider_account_id,
        email
      )
    `)

  if (error) {
    issues.push({
      type: 'ERROR',
      category: 'Profiles',
      message: `Failed to fetch profiles: ${error.message}`
    })
    return
  }

  console.log(`📊 Found ${profiles.length} profiles in Supabase`)

  // Check 1: Every profile should have at least one wallet
  profiles.forEach(profile => {
    if (!profile.profile_wallets || profile.profile_wallets.length === 0) {
      issues.push({
        type: 'ERROR',
        category: 'Profiles',
        message: 'Profile has no wallets linked',
        affectedData: { profileId: profile.id, username: profile.username }
      })
    }
  })

  // Check 2: Every profile should have exactly one primary wallet
  profiles.forEach(profile => {
    const primaryWallets = profile.profile_wallets?.filter(w => w.is_primary) || []
    if (primaryWallets.length === 0) {
      issues.push({
        type: 'ERROR',
        category: 'Profiles',
        message: 'Profile has no primary wallet',
        affectedData: { profileId: profile.id, username: profile.username }
      })
    } else if (primaryWallets.length > 1) {
      issues.push({
        type: 'ERROR',
        category: 'Profiles',
        message: 'Profile has multiple primary wallets',
        affectedData: { profileId: profile.id, username: profile.username, count: primaryWallets.length }
      })
    }
  })

  // Check 3: Every profile should have at least one OAuth account
  profiles.forEach(profile => {
    if (!profile.profile_oauth_accounts || profile.profile_oauth_accounts.length === 0) {
      issues.push({
        type: 'WARNING',
        category: 'Profiles',
        message: 'Profile has no OAuth accounts (legacy or manual creation)',
        affectedData: { profileId: profile.id, username: profile.username }
      })
    }
  })

  // Check 4: OAuth provider IDs should be unique
  const oauthMap = new Map<string, string[]>()
  profiles.forEach(profile => {
    profile.profile_oauth_accounts?.forEach(oauth => {
      const key = `${oauth.provider}:${oauth.provider_account_id}`
      if (!oauthMap.has(key)) {
        oauthMap.set(key, [])
      }
      oauthMap.get(key)!.push(profile.id)
    })
  })

  oauthMap.forEach((profileIds, key) => {
    if (profileIds.length > 1) {
      issues.push({
        type: 'ERROR',
        category: 'OAuth Accounts',
        message: 'Duplicate OAuth account across multiple profiles',
        affectedData: { oauthKey: key, profiles: profileIds }
      })
    }
  })

  // Check 5: Wallet addresses should be unique
  const walletMap = new Map<string, string[]>()
  profiles.forEach(profile => {
    profile.profile_wallets?.forEach(wallet => {
      const address = wallet.wallet_address.toLowerCase()
      if (!walletMap.has(address)) {
        walletMap.set(address, [])
      }
      walletMap.get(address)!.push(profile.id)
    })
  })

  walletMap.forEach((profileIds, address) => {
    if (profileIds.length > 1) {
      issues.push({
        type: 'ERROR',
        category: 'Wallets',
        message: 'Wallet address linked to multiple profiles',
        affectedData: { wallet: address, profiles: profileIds }
      })
    }
  })

  // Check 6: Usernames should be unique
  const usernameMap = new Map<string, string[]>()
  profiles.forEach(profile => {
    const username = profile.username.toLowerCase()
    if (!usernameMap.has(username)) {
      usernameMap.set(username, [])
    }
    usernameMap.get(username)!.push(profile.id)
  })

  usernameMap.forEach((profileIds, username) => {
    if (profileIds.length > 1) {
      issues.push({
        type: 'ERROR',
        category: 'Profiles',
        message: 'Duplicate username',
        affectedData: { username, profiles: profileIds }
      })
    }
  })
}

async function auditFollows() {
  console.log('\n🔍 Auditing Follow Relationships...\n')

  const supabase = getSupabaseClient()

  // Check 1: No self-follows
  const { data: selfFollows, error: selfError } = await supabase
    .from('profile_follows')
    .select('*')
    .eq('follower_id', 'following_id')

  if (selfError) {
    issues.push({
      type: 'ERROR',
      category: 'Follows',
      message: `Failed to check self-follows: ${selfError.message}`
    })
  } else if (selfFollows && selfFollows.length > 0) {
    issues.push({
      type: 'ERROR',
      category: 'Follows',
      message: 'Found self-follow relationships (database constraint violated)',
      affectedData: selfFollows
    })
  }

  // Check 2: All follow relationships reference valid profiles
  const { data: follows, error: followsError } = await supabase
    .from('profile_follows')
    .select('follower_id, following_id')

  if (!followsError && follows) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')

    if (!profilesError && profiles) {
      const validIds = new Set(profiles.map(p => p.id))

      follows.forEach(follow => {
        if (!validIds.has(follow.follower_id)) {
          issues.push({
            type: 'ERROR',
            category: 'Follows',
            message: 'Follow references non-existent follower profile',
            affectedData: { followerId: follow.follower_id, followingId: follow.following_id }
          })
        }
        if (!validIds.has(follow.following_id)) {
          issues.push({
            type: 'ERROR',
            category: 'Follows',
            message: 'Follow references non-existent following profile',
            affectedData: { followerId: follow.follower_id, followingId: follow.following_id }
          })
        }
      })
    }
  }
}

async function auditWatchlist() {
  console.log('\n🔍 Auditing Watchlist...\n')

  const supabase = getSupabaseClient()

  // Check 1: All watchlist items reference valid profiles
  const { data: watchlist, error: watchlistError } = await supabase
    .from('profile_watchlist')
    .select('profile_id, collection_address, chain_id')

  if (!watchlistError && watchlist) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')

    if (!profilesError && profiles) {
      const validIds = new Set(profiles.map(p => p.id))

      watchlist.forEach(item => {
        if (!validIds.has(item.profile_id)) {
          issues.push({
            type: 'ERROR',
            category: 'Watchlist',
            message: 'Watchlist item references non-existent profile',
            affectedData: { profileId: item.profile_id, collection: item.collection_address }
          })
        }
      })
    }
  }

  // Check 2: Valid Ethereum addresses
  if (watchlist) {
    watchlist.forEach(item => {
      if (!/^0x[a-fA-F0-9]{40}$/.test(item.collection_address)) {
        issues.push({
          type: 'WARNING',
          category: 'Watchlist',
          message: 'Invalid Ethereum address format',
          affectedData: { address: item.collection_address }
        })
      }
    })
  }
}

async function auditOrphanedData() {
  console.log('\n🔍 Checking for Orphaned Data...\n')

  const supabase = getSupabaseClient()

  // Get all profile IDs
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')

  if (!profiles) return

  const validProfileIds = new Set(profiles.map(p => p.id))

  // Check orphaned wallets
  const { data: wallets } = await supabase
    .from('profile_wallets')
    .select('profile_id, wallet_address')

  if (wallets) {
    const orphanedWallets = wallets.filter(w => !validProfileIds.has(w.profile_id))
    if (orphanedWallets.length > 0) {
      issues.push({
        type: 'ERROR',
        category: 'Orphaned Data',
        message: `Found ${orphanedWallets.length} orphaned wallet records`,
        affectedData: orphanedWallets
      })
    }
  }

  // Check orphaned OAuth accounts
  const { data: oauthAccounts } = await supabase
    .from('profile_oauth_accounts')
    .select('profile_id, provider, provider_account_id')

  if (oauthAccounts) {
    const orphanedOAuth = oauthAccounts.filter(o => !validProfileIds.has(o.profile_id))
    if (orphanedOAuth.length > 0) {
      issues.push({
        type: 'ERROR',
        category: 'Orphaned Data',
        message: `Found ${orphanedOAuth.length} orphaned OAuth account records`,
        affectedData: orphanedOAuth
      })
    }
  }
}

async function compareWithLocalStorage() {
  console.log('\n🔍 Comparing Supabase vs localStorage...\n')

  const localProfiles = ProfileService.getProfiles()
  const supabaseProfiles = await ProfileService.getAllProfilesFromDatabase()

  console.log(`📊 localStorage: ${localProfiles.length} profiles`)
  console.log(`📊 Supabase: ${supabaseProfiles.length} profiles`)

  // Profiles in Supabase but not in localStorage
  const missingFromLocal = supabaseProfiles.filter(sp =>
    !localProfiles.some(lp => lp.id === sp.id)
  )

  if (missingFromLocal.length > 0) {
    issues.push({
      type: 'WARNING',
      category: 'Cache Mismatch',
      message: `${missingFromLocal.length} profiles in Supabase but not in localStorage cache`,
      affectedData: missingFromLocal.map(p => ({ id: p.id, username: p.username }))
    })
  }

  // Profiles in localStorage but not in Supabase
  const missingFromSupabase = localProfiles.filter(lp =>
    !supabaseProfiles.some(sp => sp.id === lp.id)
  )

  if (missingFromSupabase.length > 0) {
    issues.push({
      type: 'ERROR',
      category: 'Sync Failure',
      message: `${missingFromSupabase.length} profiles in localStorage but not synced to Supabase`,
      affectedData: missingFromSupabase.map(p => ({ id: p.id, username: p.username }))
    })
  }

  // Compare data for matching profiles
  const matchingProfiles = localProfiles.filter(lp =>
    supabaseProfiles.some(sp => sp.id === lp.id)
  )

  matchingProfiles.forEach(localProfile => {
    const supabaseProfile = supabaseProfiles.find(sp => sp.id === localProfile.id)
    if (!supabaseProfile) return

    // Check username mismatch
    if (localProfile.username !== supabaseProfile.username) {
      issues.push({
        type: 'WARNING',
        category: 'Data Mismatch',
        message: 'Username mismatch between localStorage and Supabase',
        affectedData: {
          profileId: localProfile.id,
          localStorage: localProfile.username,
          supabase: supabaseProfile.username
        }
      })
    }

    // Check email mismatch
    if (localProfile.email !== supabaseProfile.email) {
      issues.push({
        type: 'WARNING',
        category: 'Data Mismatch',
        message: 'Email mismatch between localStorage and Supabase',
        affectedData: {
          profileId: localProfile.id,
          localStorage: localProfile.email,
          supabase: supabaseProfile.email
        }
      })
    }
  })
}

async function runAudit() {
  console.log('═══════════════════════════════════════════')
  console.log('🔍 DATA INTEGRITY AUDIT')
  console.log('═══════════════════════════════════════════')

  await auditProfiles()
  await auditFollows()
  await auditWatchlist()
  await auditOrphanedData()
  await compareWithLocalStorage()

  console.log('\n═══════════════════════════════════════════')
  console.log('📊 AUDIT RESULTS')
  console.log('═══════════════════════════════════════════\n')

  const errors = issues.filter(i => i.type === 'ERROR')
  const warnings = issues.filter(i => i.type === 'WARNING')
  const info = issues.filter(i => i.type === 'INFO')

  if (issues.length === 0) {
    console.log('✅ No integrity issues found!')
  } else {
    issues.forEach(issue => {
      const emoji = issue.type === 'ERROR' ? '❌' : issue.type === 'WARNING' ? '⚠️' : 'ℹ️'
      console.log(`${emoji} [${issue.category}] ${issue.message}`)
      if (issue.affectedData) {
        console.log(`   Affected:`, JSON.stringify(issue.affectedData, null, 2))
      }
    })
  }

  console.log(`\n📈 Total Issues: ${issues.length} | ❌ Errors: ${errors.length} | ⚠️ Warnings: ${warnings.length} | ℹ️ Info: ${info.length}`)

  if (errors.length > 0) {
    console.log('\n❌ CRITICAL DATA INTEGRITY ISSUES DETECTED!')
    process.exit(1)
  } else if (warnings.length > 0) {
    console.log('\n⚠️ Audit completed with warnings')
    process.exit(0)
  } else {
    console.log('\n✅ Data integrity verified!')
    process.exit(0)
  }
}

runAudit()
```

---

## Section 3: Manual Test Procedures

### 3.1 Cross-Device Profile Creation Test

**Prerequisites:**
- 2 devices (or 2 browsers in incognito mode)
- Clear localStorage on both devices

**Steps:**

1. **Device A: Sign up with Google**
   ```
   1. Go to app homepage
   2. Click "Connect Wallet" → Choose "Google"
   3. Complete Google OAuth flow
   4. Verify profile created (check Settings page)
   5. Note: Username, Email, Wallet Address
   ```

2. **Device B: Verify profile visible**
   ```
   1. Open browser console
   2. Run: npx tsx scripts/audit-data-integrity.ts
   3. Verify profile exists in Supabase
   4. Check: Username, Email, Wallet all match Device A
   ```

3. **Device B: Login with same Google account**
   ```
   1. Go to app homepage
   2. Click "Connect Wallet" → Choose "Google"
   3. Use SAME Google account as Device A
   4. Verify: Should NOT create new profile
   5. Verify: Should show same username/data as Device A
   6. Verify: New wallet address created for Device B
   ```

4. **Device A: Refresh and verify**
   ```
   1. Refresh page on Device A
   2. Go to Settings → Linked Wallets
   3. Verify: Should see TWO wallets (Device A + Device B)
   ```

**Success Criteria:**
- ✅ Single profile created (not duplicate)
- ✅ Both devices see same username/email
- ✅ Each device has unique wallet address
- ✅ Both wallets visible in Linked Wallets

**Failure Symptoms:**
- ❌ Device B creates duplicate profile
- ❌ Device A doesn't see Device B's wallet
- ❌ Profile data differs between devices

---

### 3.2 Profile Update Cross-Device Test

**Prerequisites:**
- Complete Section 3.1 first
- Two devices logged into same account

**Steps:**

1. **Device A: Update profile**
   ```
   1. Go to Settings
   2. Change username to "cyberpunk_legend"
   3. Update bio to "Master of the metaverse"
   4. Upload new avatar image
   5. Click "Save Changes"
   6. Wait for success message
   ```

2. **Device B: Verify updates (IMMEDIATE)**
   ```
   1. Refresh page
   2. Click on profile icon → Settings
   3. Verify username shows "cyberpunk_legend"
   4. Verify bio shows "Master of the metaverse"
   5. Verify avatar image updated
   ```

3. **Browser Console Verification**
   ```
   Device B console:
   > localStorage.getItem('fortuna_square_user')
   // Should show old data (cache not updated yet)

   > fetch('/api/profile/me').then(r => r.json())
   // Should show NEW data (Supabase is source of truth)
   ```

4. **Device A: Update privacy settings**
   ```
   1. Go to Settings → Privacy
   2. Toggle "Show Wallet Address" to OFF
   3. Toggle "Show Email" to ON
   4. Click "Save"
   ```

5. **Device B: Verify privacy changes**
   ```
   1. Refresh page
   2. Go to Profile page
   3. Verify: Wallet address is HIDDEN
   4. Verify: Email is VISIBLE (if logged in)
   ```

**Success Criteria:**
- ✅ All changes appear on Device B within 5 seconds of refresh
- ✅ Supabase reflects changes immediately
- ✅ localStorage eventually consistent (may lag)

**Failure Symptoms:**
- ❌ Device B still shows old data after refresh
- ❌ Changes lost after page reload
- ❌ Privacy settings not syncing

---

### 3.3 Watchlist Cross-Device Test

**Prerequisites:**
- Two devices logged into same account

**Steps:**

1. **Device A: Add to watchlist**
   ```
   1. Browse collections → BAYC
   2. Click "Add to Watchlist" star icon
   3. Verify star becomes filled/active
   4. Navigate to Profile → Watchlist tab
   5. Verify BAYC appears in list
   ```

2. **Device B: Verify watchlist sync**
   ```
   1. Navigate to Profile → Watchlist tab
   2. Verify BAYC appears in list
   3. Verify collection image, name displayed
   4. Browse to BAYC collection page
   5. Verify star icon is already filled/active
   ```

3. **Device B: Remove from watchlist**
   ```
   1. On BAYC page, click filled star to remove
   2. Verify star becomes unfilled
   3. Check Watchlist tab
   4. Verify BAYC no longer in list
   ```

4. **Device A: Verify removal synced**
   ```
   1. Refresh page
   2. Navigate to Watchlist tab
   3. Verify BAYC removed
   4. Browse to BAYC page
   5. Verify star is unfilled
   ```

**Success Criteria:**
- ✅ Watchlist adds/removes sync across devices
- ✅ Star icons reflect correct state
- ✅ Metadata (image, name) synced correctly

**Failure Symptoms:**
- ❌ Watchlist different on each device
- ❌ Star icon state inconsistent
- ❌ Duplicate entries in watchlist

---

### 3.4 Follow System Cross-Device Test

**Prerequisites:**
- Two separate accounts (UserA and UserB)
- Two devices or browsers

**Steps:**

1. **Device A (UserA): Follow UserB**
   ```
   1. Search for UserB's profile
   2. Click "Follow" button
   3. Verify button changes to "Following"
   4. Check Profile → Following tab
   5. Verify UserB appears in list
   ```

2. **Device B (UserB): Verify follower**
   ```
   1. Refresh page
   2. Navigate to Profile → Followers tab
   3. Verify UserA appears in followers list
   4. Check follower count badge
   5. Verify shows "1 follower"
   ```

3. **Device A (UserA): Unfollow UserB**
   ```
   1. Go to UserB's profile
   2. Click "Following" button to unfollow
   3. Verify button changes back to "Follow"
   4. Check Following tab
   5. Verify UserB removed from list
   ```

4. **Device B (UserB): Verify unfollow**
   ```
   1. Refresh page
   2. Check Followers tab
   3. Verify UserA removed
   4. Verify follower count shows "0"
   ```

**Success Criteria:**
- ✅ Follow/unfollow syncs across devices
- ✅ Follower counts update correctly
- ✅ Following lists accurate on both sides

**Failure Symptoms:**
- ❌ Follow action not visible to other user
- ❌ Follower counts incorrect
- ❌ Unfollow doesn't remove from lists

---

## Section 4: Debugging Commands

### 4.1 Browser Console Commands

Add these to your app for debugging:

```typescript
// Add to components/debug/sync-debugger.tsx
export const SyncDebugger = () => {
  if (typeof window !== 'undefined') {
    // Command: Check localStorage vs Supabase for current user
    (window as any).checkProfileSync = async () => {
      const userStr = localStorage.getItem('fortuna_square_user')
      if (!userStr) {
        console.log('❌ No user in localStorage')
        return
      }

      const user = JSON.parse(userStr)
      const { ProfileService } = await import('@/lib/profile-service')

      const localProfile = ProfileService.getProfile(user.id)
      const supabaseProfile = await ProfileService.getProfileByOAuthProvider(
        // You'll need to store provider info in localStorage too
        'google',
        user.id
      )

      console.log('📦 localStorage profile:', localProfile)
      console.log('☁️ Supabase profile:', supabaseProfile)
      console.log('✅ Synced:', JSON.stringify(localProfile) === JSON.stringify(supabaseProfile))
    }

    // Command: Force sync localStorage to Supabase
    (window as any).forceSyncToSupabase = async () => {
      const { ProfileService } = await import('@/lib/profile-service')
      const localProfiles = ProfileService.getProfiles()

      console.log(`🔄 Syncing ${localProfiles.length} profiles to Supabase...`)

      for (const profile of localProfiles) {
        try {
          await ProfileService.updateProfileInDatabase(profile.id, profile)
          console.log(`✅ Synced: ${profile.username}`)
        } catch (error) {
          console.error(`❌ Failed to sync ${profile.username}:`, error)
        }
      }
    }

    // Command: Pull fresh data from Supabase
    (window as any).pullFromSupabase = async () => {
      const { ProfileService } = await import('@/lib/profile-service')
      const supabaseProfiles = await ProfileService.getAllProfilesFromDatabase()

      console.log(`☁️ Fetched ${supabaseProfiles.length} profiles from Supabase`)

      // Sync to localStorage
      for (const profile of supabaseProfiles) {
        await ProfileService.syncProfileToLocalStorage(profile)
      }

      console.log('✅ Synced all Supabase profiles to localStorage')
      console.log('🔄 Refresh page to see changes')
    }

    // Command: Clear all data (both localStorage AND Supabase)
    (window as any).nukeAllData = async () => {
      const confirmed = confirm('⚠️ This will DELETE ALL profiles from localStorage AND Supabase. Continue?')
      if (!confirmed) return

      const { getSupabaseClient } = await import('@/lib/supabase')
      const supabase = getSupabaseClient()

      // Delete from Supabase (cascades to wallets, oauth, follows, watchlist)
      const { error } = await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000')

      if (error) {
        console.error('❌ Failed to delete from Supabase:', error)
      } else {
        console.log('☁️ Deleted all profiles from Supabase')
      }

      // Clear localStorage
      localStorage.removeItem('fortuna_square_profiles')
      localStorage.removeItem('fortuna_square_user')

      console.log('📦 Cleared localStorage')
      console.log('✅ All data nuked. Refresh to start fresh.')
    }

    // Command: Show sync status
    (window as any).syncStatus = async () => {
      const { ProfileService } = await import('@/lib/profile-service')

      const localProfiles = ProfileService.getProfiles()
      const supabaseProfiles = await ProfileService.getAllProfilesFromDatabase()

      console.log('═══════════════════════════════════')
      console.log('📊 SYNC STATUS')
      console.log('═══════════════════════════════════')
      console.log(`📦 localStorage: ${localProfiles.length} profiles`)
      console.log(`☁️ Supabase: ${supabaseProfiles.length} profiles`)

      const inLocalOnly = localProfiles.filter(lp =>
        !supabaseProfiles.some(sp => sp.id === lp.id)
      )
      const inSupabaseOnly = supabaseProfiles.filter(sp =>
        !localProfiles.some(lp => lp.id === sp.id)
      )

      if (inLocalOnly.length > 0) {
        console.log(`⚠️ ${inLocalOnly.length} profiles ONLY in localStorage:`, inLocalOnly.map(p => p.username))
      }
      if (inSupabaseOnly.length > 0) {
        console.log(`⚠️ ${inSupabaseOnly.length} profiles ONLY in Supabase:`, inSupabaseOnly.map(p => p.username))
      }

      if (inLocalOnly.length === 0 && inSupabaseOnly.length === 0) {
        console.log('✅ All profiles synced!')
      }
    }

    // Command: Test watchlist sync
    (window as any).testWatchlistSync = async () => {
      const userStr = localStorage.getItem('fortuna_square_user')
      if (!userStr) {
        console.log('❌ No user logged in')
        return
      }

      const user = JSON.parse(userStr)
      const { ProfileService } = await import('@/lib/profile-service')

      const watchlist = await ProfileService.getWatchlist(user.id)
      console.log(`⭐ Watchlist (${watchlist.length} items):`)
      watchlist.forEach(item => {
        console.log(`  - ${item.collectionName || 'Unknown'} (${item.collectionAddress})`)
      })
    }

    // Command: Test follow sync
    (window as any).testFollowSync = async () => {
      const userStr = localStorage.getItem('fortuna_square_user')
      if (!userStr) {
        console.log('❌ No user logged in')
        return
      }

      const user = JSON.parse(userStr)
      const { ProfileService } = await import('@/lib/profile-service')

      const following = await ProfileService.getFollowing(user.id)
      const followers = await ProfileService.getFollowers(user.id)
      const counts = await ProfileService.getFollowCounts(user.id)

      console.log('═══════════════════════════════════')
      console.log('👥 FOLLOW STATUS')
      console.log('═══════════════════════════════════')
      console.log(`📊 Following: ${counts.following}`)
      console.log(`📊 Followers: ${counts.followers}`)
      console.log('\nFollowing:', following.map(p => p.username))
      console.log('Followers:', followers.map(p => p.username))
    }
  }

  return null
}
```

### 4.2 CLI Debug Commands

```bash
# Check if profile exists in Supabase
npx tsx scripts/audit-data-integrity.ts

# Run full sync test suite
npx tsx scripts/test-profile-sync.ts

# Compare localStorage vs Supabase
node -e "
const { ProfileService } = require('./lib/profile-service');
const local = ProfileService.getProfiles();
console.log('localStorage profiles:', local.length);
"

# Check Supabase connection
npx tsx scripts/test-user-visibility.ts
```

---

## Section 5: Success Criteria

### 5.1 Per-Test Success Criteria

| Test | Success Criteria |
|------|------------------|
| **Profile Creation Sync** | Profile exists in Supabase with correct username, email, wallet, and OAuth account |
| **Profile Update Sync** | All updates (username, bio, avatar, etc.) appear in Supabase and on all devices |
| **Wallet Linking Sync** | Wallet appears in `profile_wallets` table with correct metadata and type |
| **Follow System Sync** | Follow relationship exists in `profile_follows`, counts correct on both sides |
| **Watchlist Sync** | Collection appears in `profile_watchlist` with metadata, visible on all devices |
| **OAuth Lookup** | Existing profile found via OAuth provider credentials, no duplicate created |
| **Cache Consistency** | localStorage and Supabase have same profiles (with acceptable lag) |
| **Cross-Device Login** | Login on Device B with same OAuth shows same profile, links new wallet |

### 5.2 Overall Suite Success Criteria

**Passing Grade:**
- ✅ All P0 tests pass (100%)
- ✅ 95%+ of P1 tests pass
- ✅ 80%+ of P2 tests pass
- ✅ Zero data integrity errors in audit
- ✅ localStorage vs Supabase mismatch < 5%

**Deployment Blocker:**
- ❌ Any P0 test fails
- ❌ Any data integrity ERROR in audit
- ❌ Duplicate profiles created for same OAuth account
- ❌ Profile updates lost/not synced

---

## Section 6: Verifying Home Page Issue is Resolved

### 6.1 Root Cause Verification

The Home page bug was caused by:
1. ❌ Profile created in localStorage only (not synced to Supabase)
2. ❌ OAuth lookup on Device B failed (profile didn't exist in Supabase)
3. ❌ Device B created duplicate profile instead of finding existing one

### 6.2 Verification Steps

**Test 1: Ensure profile creation always saves to Supabase**

```bash
# Run this test
npx tsx scripts/test-profile-sync.ts

# Expected output:
# ✅ Profile Creation Sync: Profile created and synced successfully
```

**Test 2: Ensure OAuth lookup works correctly**

```typescript
// Browser console test
const testLookup = async () => {
  const { ProfileService } = await import('@/lib/profile-service')

  // Use actual OAuth data from your Google login
  const profile = await ProfileService.getProfileByOAuthProvider(
    'google',
    'YOUR_GOOGLE_SUB_ID' // Get from localStorage after login
  )

  if (profile) {
    console.log('✅ OAuth lookup works:', profile.username)
  } else {
    console.log('❌ OAuth lookup failed - profile not found')
  }
}

testLookup()
```

**Test 3: Cross-device profile visibility**

1. Device A: Sign up with Google
2. Browser console on Device A:
   ```javascript
   const user = JSON.parse(localStorage.getItem('fortuna_square_user'))
   console.log('User ID:', user.id)
   console.log('OAuth Sub:', user.oauthSub) // Add this to localStorage
   ```
3. Device B: Run audit script
   ```bash
   npx tsx scripts/audit-data-integrity.ts
   ```
4. Verify Device B sees the profile in Supabase output

**Test 4: Prevent duplicate profile creation**

1. Device A: Sign up with Google (alice@gmail.com)
2. Device B: Sign up with Google (SAME alice@gmail.com)
3. Expected: Device B should NOT create new profile
4. Verify:
   ```bash
   npx tsx scripts/audit-data-integrity.ts | grep "Duplicate username"
   # Should output: (empty - no duplicates)
   ```

### 6.3 Home Page Issue Resolution Checklist

- [ ] Profile creation calls `createProfileInDatabase()` successfully
- [ ] Profile exists in Supabase `profiles` table
- [ ] OAuth account linked in `profile_oauth_accounts` table
- [ ] Wallet linked in `profile_wallets` table
- [ ] OAuth lookup finds profile on new device login
- [ ] No duplicate profiles created for same OAuth account
- [ ] All test scripts pass (Section 2)
- [ ] Manual cross-device tests pass (Section 3)
- [ ] Data integrity audit shows zero errors
- [ ] `checkProfileSync()` command shows synced = true

**Final Verification:**

```bash
# Run complete test suite
npm run test:sync

# Expected output:
# ✅ Profile Creation Sync: PASS
# ✅ Profile Update Sync: PASS
# ✅ Wallet Linking Sync: PASS
# ✅ Follow System Sync: PASS
# ✅ Watchlist Sync: PASS
# ✅ Cache Consistency: PASS
#
# 📈 Total: 6 | ✅ Passed: 6 | ❌ Failed: 0 | ⚠️ Warnings: 0
# ✅ TEST SUITE PASSED - All data syncs correctly!
```

---

## Appendix: Quick Reference

### Debug Command Reference

| Command | Purpose |
|---------|---------|
| `window.checkProfileSync()` | Compare localStorage vs Supabase for current user |
| `window.syncStatus()` | Show sync status for all profiles |
| `window.pullFromSupabase()` | Pull fresh data from Supabase to localStorage |
| `window.forceSyncToSupabase()` | Push all localStorage profiles to Supabase |
| `window.testWatchlistSync()` | Check watchlist sync status |
| `window.testFollowSync()` | Check follow system sync status |
| `window.nukeAllData()` | Delete ALL data (use with caution!) |

### Test Script Reference

| Script | Purpose |
|--------|---------|
| `npx tsx scripts/test-profile-sync.ts` | Run automated sync tests |
| `npx tsx scripts/audit-data-integrity.ts` | Check data integrity |
| `npx tsx scripts/test-user-visibility.ts` | Test Supabase connection |

### Common Issues & Fixes

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Profile missing on Device B | Not synced to Supabase | Run `forceSyncToSupabase()` |
| Duplicate profiles | OAuth lookup failed | Check `profile_oauth_accounts` table |
| Updates not syncing | `updateProfileInDatabase()` not called | Verify ProfileService calls |
| Watchlist different on devices | Cache stale | Run `pullFromSupabase()` |
| Follow counts wrong | Database constraint violated | Run integrity audit |

---

**End of Comprehensive Sync Testing Plan**
