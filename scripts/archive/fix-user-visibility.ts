/**
 * AUTO-FIX SCRIPT: User Visibility Issues
 *
 * Automatically fixes common issues that prevent users from displaying
 *
 * Usage:
 *   npx tsx scripts/fix-user-visibility.ts
 */

import { getSupabaseClient } from '../lib/supabase'

interface FixResult {
  issue: string
  fixed: boolean
  details: string
  affectedCount?: number
}

const fixes: FixResult[] = []

async function runFixes() {
  console.log('='.repeat(80))
  console.log('USER VISIBILITY AUTO-FIX')
  console.log('='.repeat(80))
  console.log()

  const supabase = getSupabaseClient()

  // ============================================================================
  // Fix 1: Profiles with NULL or empty usernames
  // ============================================================================
  console.log('FIX 1: Checking for profiles with invalid usernames...')

  try {
    const { data: invalidUsernames, error } = await supabase
      .from('profiles')
      .select('id, username, email, created_at')
      .or('username.is.null,username.eq.')

    if (error) {
      fixes.push({
        issue: 'Invalid Usernames',
        fixed: false,
        details: `Error checking: ${error.message}`
      })
      console.log(`❌ Error: ${error.message}`)
    } else if (invalidUsernames && invalidUsernames.length > 0) {
      console.log(`Found ${invalidUsernames.length} profiles with invalid usernames`)

      // Fix each profile
      let fixedCount = 0
      for (const profile of invalidUsernames) {
        // Generate username from email or ID
        const newUsername = profile.email
          ? profile.email.split('@')[0] + '_' + profile.id.slice(0, 4)
          : 'user_' + profile.id.slice(0, 8)

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ username: newUsername })
          .eq('id', profile.id)

        if (!updateError) {
          console.log(`✅ Fixed: ${profile.id} → ${newUsername}`)
          fixedCount++
        } else {
          console.log(`❌ Failed to fix ${profile.id}: ${updateError.message}`)
        }
      }

      fixes.push({
        issue: 'Invalid Usernames',
        fixed: true,
        details: `Fixed ${fixedCount} out of ${invalidUsernames.length} profiles`,
        affectedCount: fixedCount
      })
    } else {
      console.log('✅ No invalid usernames found')
      fixes.push({
        issue: 'Invalid Usernames',
        fixed: true,
        details: 'No issues found'
      })
    }
  } catch (error: any) {
    console.log(`❌ Exception: ${error.message}`)
    fixes.push({
      issue: 'Invalid Usernames',
      fixed: false,
      details: `Exception: ${error.message}`
    })
  }
  console.log()

  // ============================================================================
  // Fix 2: Profiles without wallet associations
  // ============================================================================
  console.log('FIX 2: Checking for profiles without wallets...')

  try {
    const { data: profiles } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        profile_wallets (wallet_address)
      `)

    const profilesWithoutWallets = profiles?.filter(
      (p: any) => !p.profile_wallets || p.profile_wallets.length === 0
    ) || []

    if (profilesWithoutWallets.length > 0) {
      console.log(`⚠️  Found ${profilesWithoutWallets.length} profiles without wallets:`)
      profilesWithoutWallets.forEach((p: any) => {
        console.log(`   - ${p.username} (${p.id})`)
      })
      console.log()
      console.log('ℹ️  This is not an error, but these profiles won\'t have wallet indicators')

      fixes.push({
        issue: 'Profiles Without Wallets',
        fixed: true,
        details: `${profilesWithoutWallets.length} profiles have no wallets (not an error)`,
        affectedCount: profilesWithoutWallets.length
      })
    } else {
      console.log('✅ All profiles have wallets')
      fixes.push({
        issue: 'Profiles Without Wallets',
        fixed: true,
        details: 'All profiles have wallets'
      })
    }
  } catch (error: any) {
    console.log(`❌ Exception: ${error.message}`)
    fixes.push({
      issue: 'Profiles Without Wallets',
      fixed: false,
      details: `Exception: ${error.message}`
    })
  }
  console.log()

  // ============================================================================
  // Fix 3: Duplicate usernames
  // ============================================================================
  console.log('FIX 3: Checking for duplicate usernames...')

  try {
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('id, username, created_at')
      .order('created_at', { ascending: true })

    if (allProfiles) {
      const usernameCount = new Map<string, number>()
      const duplicates: any[] = []

      allProfiles.forEach(profile => {
        const count = usernameCount.get(profile.username) || 0
        usernameCount.set(profile.username, count + 1)
        if (count > 0) {
          duplicates.push(profile)
        }
      })

      if (duplicates.length > 0) {
        console.log(`Found ${duplicates.length} profiles with duplicate usernames`)

        let fixedCount = 0
        for (const profile of duplicates) {
          const newUsername = `${profile.username}_${profile.id.slice(0, 4)}`

          const { error: updateError } = await supabase
            .from('profiles')
            .update({ username: newUsername })
            .eq('id', profile.id)

          if (!updateError) {
            console.log(`✅ Fixed duplicate: ${profile.username} → ${newUsername}`)
            fixedCount++
          } else {
            console.log(`❌ Failed to fix ${profile.id}: ${updateError.message}`)
          }
        }

        fixes.push({
          issue: 'Duplicate Usernames',
          fixed: true,
          details: `Fixed ${fixedCount} out of ${duplicates.length} duplicates`,
          affectedCount: fixedCount
        })
      } else {
        console.log('✅ No duplicate usernames found')
        fixes.push({
          issue: 'Duplicate Usernames',
          fixed: true,
          details: 'No duplicates found'
        })
      }
    }
  } catch (error: any) {
    console.log(`❌ Exception: ${error.message}`)
    fixes.push({
      issue: 'Duplicate Usernames',
      fixed: false,
      details: `Exception: ${error.message}`
    })
  }
  console.log()

  // ============================================================================
  // Fix 4: Orphaned OAuth accounts
  // ============================================================================
  console.log('FIX 4: Checking for orphaned OAuth accounts...')

  try {
    const { data: oauthAccounts } = await supabase
      .from('profile_oauth_accounts')
      .select('id, profile_id, provider')

    if (oauthAccounts && oauthAccounts.length > 0) {
      const profileIds = [...new Set(oauthAccounts.map(a => a.profile_id))]

      const { data: validProfiles } = await supabase
        .from('profiles')
        .select('id')
        .in('id', profileIds)

      const validProfileIds = new Set(validProfiles?.map(p => p.id))
      const orphanedAccounts = oauthAccounts.filter(
        a => !validProfileIds.has(a.profile_id)
      )

      if (orphanedAccounts.length > 0) {
        console.log(`Found ${orphanedAccounts.length} orphaned OAuth accounts`)

        let deletedCount = 0
        for (const account of orphanedAccounts) {
          const { error: deleteError } = await supabase
            .from('profile_oauth_accounts')
            .delete()
            .eq('id', account.id)

          if (!deleteError) {
            console.log(`✅ Deleted orphaned ${account.provider} account`)
            deletedCount++
          } else {
            console.log(`❌ Failed to delete ${account.id}: ${deleteError.message}`)
          }
        }

        fixes.push({
          issue: 'Orphaned OAuth Accounts',
          fixed: true,
          details: `Deleted ${deletedCount} out of ${orphanedAccounts.length} orphaned accounts`,
          affectedCount: deletedCount
        })
      } else {
        console.log('✅ No orphaned OAuth accounts found')
        fixes.push({
          issue: 'Orphaned OAuth Accounts',
          fixed: true,
          details: 'No orphaned accounts found'
        })
      }
    } else {
      console.log('ℹ️  No OAuth accounts in database')
      fixes.push({
        issue: 'Orphaned OAuth Accounts',
        fixed: true,
        details: 'No OAuth accounts to check'
      })
    }
  } catch (error: any) {
    console.log(`❌ Exception: ${error.message}`)
    fixes.push({
      issue: 'Orphaned OAuth Accounts',
      fixed: false,
      details: `Exception: ${error.message}`
    })
  }
  console.log()

  // ============================================================================
  // Fix 5: Missing updated_at timestamps
  // ============================================================================
  console.log('FIX 5: Checking for missing updated_at timestamps...')

  try {
    const { data: profilesWithoutUpdated } = await supabase
      .from('profiles')
      .select('id, username, created_at, updated_at')
      .is('updated_at', null)

    if (profilesWithoutUpdated && profilesWithoutUpdated.length > 0) {
      console.log(`Found ${profilesWithoutUpdated.length} profiles with missing updated_at`)

      let fixedCount = 0
      for (const profile of profilesWithoutUpdated) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ updated_at: profile.created_at })
          .eq('id', profile.id)

        if (!updateError) {
          console.log(`✅ Fixed updated_at for ${profile.username}`)
          fixedCount++
        } else {
          console.log(`❌ Failed to fix ${profile.id}: ${updateError.message}`)
        }
      }

      fixes.push({
        issue: 'Missing updated_at',
        fixed: true,
        details: `Fixed ${fixedCount} out of ${profilesWithoutUpdated.length} profiles`,
        affectedCount: fixedCount
      })
    } else {
      console.log('✅ All profiles have updated_at timestamps')
      fixes.push({
        issue: 'Missing updated_at',
        fixed: true,
        details: 'All timestamps present'
      })
    }
  } catch (error: any) {
    console.log(`❌ Exception: ${error.message}`)
    fixes.push({
      issue: 'Missing updated_at',
      fixed: false,
      details: `Exception: ${error.message}`
    })
  }
  console.log()

  // ============================================================================
  // Summary
  // ============================================================================
  console.log('='.repeat(80))
  console.log('FIX SUMMARY')
  console.log('='.repeat(80))
  console.log()

  fixes.forEach(fix => {
    const icon = fix.fixed ? '✅' : '❌'
    console.log(`${icon} ${fix.issue}`)
    console.log(`   ${fix.details}`)
    if (fix.affectedCount !== undefined) {
      console.log(`   Affected: ${fix.affectedCount} profiles`)
    }
    console.log()
  })

  const allFixed = fixes.every(f => f.fixed)
  const totalAffected = fixes.reduce((sum, f) => sum + (f.affectedCount || 0), 0)

  if (allFixed && totalAffected > 0) {
    console.log(`✅ Fixed ${totalAffected} issues across ${fixes.length} checks`)
    console.log()
    console.log('Next steps:')
    console.log('1. Run: npx tsx scripts/debug-user-visibility.ts')
    console.log('2. Refresh Home page in browser')
    console.log('3. Check if all users now appear')
  } else if (allFixed && totalAffected === 0) {
    console.log('✅ No issues found - database is healthy!')
    console.log()
    console.log('If users still not showing, issue is likely:')
    console.log('- Frontend rendering logic')
    console.log('- React state management')
    console.log('- Browser caching (try hard refresh)')
  } else {
    console.log('❌ Some fixes failed')
    console.log('Review errors above and fix manually')
  }

  console.log('='.repeat(80))
}

// Run the fixes
runFixes().catch(error => {
  console.error('Fatal error in fix script:', error)
  process.exit(1)
})
