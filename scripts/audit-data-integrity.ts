/**
 * Data Integrity Audit Script
 *
 * Audits all user data in Supabase to detect inconsistencies,
 * duplicates, orphaned records, and sync issues.
 */

import { ProfileService } from '../lib/profile-service'
import { getSupabaseClient } from '../lib/supabase'

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
    const primaryWallets = profile.profile_wallets?.filter((w: any) => w.is_primary) || []
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
    profile.profile_oauth_accounts?.forEach((oauth: any) => {
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
    profile.profile_wallets?.forEach((wallet: any) => {
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
    .filter('follower_id', 'eq', 'following_id')

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
