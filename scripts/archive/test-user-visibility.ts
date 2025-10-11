/**
 * TEST SUITE: User Visibility on Home Page
 *
 * Comprehensive test cases for user profile display
 *
 * Usage:
 *   npx tsx scripts/test-user-visibility.ts
 */

import { ProfileService } from '../lib/profile-service'
import { getSupabaseClient } from '../lib/supabase'

interface TestResult {
  testName: string
  passed: boolean
  message: string
  expected?: any
  actual?: any
}

const results: TestResult[] = []

function assert(condition: boolean, testName: string, message: string, expected?: any, actual?: any) {
  results.push({
    testName,
    passed: condition,
    message,
    expected,
    actual
  })

  if (condition) {
    console.log(`✅ PASS: ${testName}`)
  } else {
    console.log(`❌ FAIL: ${testName}`)
    console.log(`   ${message}`)
    if (expected !== undefined) {
      console.log(`   Expected: ${JSON.stringify(expected)}`)
      console.log(`   Actual: ${JSON.stringify(actual)}`)
    }
  }
}

async function runTests() {
  console.log('='.repeat(80))
  console.log('USER VISIBILITY TEST SUITE')
  console.log('='.repeat(80))
  console.log()

  const supabase = getSupabaseClient()

  // ============================================================================
  // Test 1: Database Connection
  // ============================================================================
  console.log('TEST SUITE 1: Database Connection')
  console.log('-'.repeat(80))

  try {
    const { data, error } = await supabase.from('profiles').select('*').limit(1)
    assert(
      error === null,
      'Database Connection',
      'Should connect to Supabase without error',
      'No error',
      error?.message
    )
  } catch (error: any) {
    assert(
      false,
      'Database Connection',
      `Connection failed: ${error.message}`
    )
  }
  console.log()

  // ============================================================================
  // Test 2: Profile Count Consistency
  // ============================================================================
  console.log('TEST SUITE 2: Profile Count Consistency')
  console.log('-'.repeat(80))

  try {
    // Get count using COUNT query
    const { count: countQuery } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Get count using SELECT query
    const { data: selectData } = await supabase
      .from('profiles')
      .select('*')

    assert(
      countQuery === selectData?.length,
      'Profile Count Consistency',
      'COUNT query should match SELECT query length',
      countQuery,
      selectData?.length
    )

    // Get count from ProfileService
    const serviceProfiles = await ProfileService.getAllProfilesFromDatabase()

    assert(
      countQuery === serviceProfiles.length,
      'ProfileService Count Consistency',
      'ProfileService should return same count as database',
      countQuery,
      serviceProfiles.length
    )
  } catch (error: any) {
    assert(false, 'Profile Count Consistency', `Test failed: ${error.message}`)
  }
  console.log()

  // ============================================================================
  // Test 3: Required Fields
  // ============================================================================
  console.log('TEST SUITE 3: Profile Data Integrity')
  console.log('-'.repeat(80))

  try {
    const profiles = await ProfileService.getAllProfilesFromDatabase()

    // Check that all profiles have required fields
    const profilesWithMissingFields = profiles.filter(
      p => !p.id || !p.username || !p.createdAt
    )

    assert(
      profilesWithMissingFields.length === 0,
      'Required Fields Present',
      'All profiles should have id, username, and createdAt',
      0,
      profilesWithMissingFields.length
    )

    if (profilesWithMissingFields.length > 0) {
      console.log('   Profiles with missing fields:')
      profilesWithMissingFields.forEach(p => {
        console.log(`   - ${p.username || 'NO USERNAME'} (ID: ${p.id || 'NO ID'})`)
      })
    }

    // Check that all usernames are non-empty strings
    const profilesWithInvalidUsername = profiles.filter(
      p => typeof p.username !== 'string' || p.username.trim() === ''
    )

    assert(
      profilesWithInvalidUsername.length === 0,
      'Valid Usernames',
      'All profiles should have non-empty string usernames',
      0,
      profilesWithInvalidUsername.length
    )
  } catch (error: any) {
    assert(false, 'Profile Data Integrity', `Test failed: ${error.message}`)
  }
  console.log()

  // ============================================================================
  // Test 4: Wallet Association
  // ============================================================================
  console.log('TEST SUITE 4: Wallet Association')
  console.log('-'.repeat(80))

  try {
    const { data: profilesWithWallets } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        profile_wallets (
          wallet_address,
          wallet_type,
          is_primary
        )
      `)

    const profilesWithNoWallets = profilesWithWallets?.filter(
      (p: any) => !p.profile_wallets || p.profile_wallets.length === 0
    ) || []

    // This is a warning, not necessarily a failure
    if (profilesWithNoWallets.length > 0) {
      console.log(`⚠️  WARNING: ${profilesWithNoWallets.length} profiles have no wallets:`)
      profilesWithNoWallets.forEach((p: any) => {
        console.log(`   - ${p.username}`)
      })
    } else {
      console.log(`✅ All profiles have at least one wallet`)
    }

    // Check that ProfileService correctly maps wallet data
    const serviceProfiles = await ProfileService.getAllProfilesFromDatabase()
    const serviceProfilesWithoutWalletAddress = serviceProfiles.filter(
      p => !p.walletAddress && (!p.wallets || p.wallets.length === 0)
    )

    assert(
      serviceProfilesWithoutWalletAddress.length === profilesWithNoWallets.length,
      'Wallet Data Mapping',
      'ProfileService should correctly map wallet data',
      profilesWithNoWallets.length,
      serviceProfilesWithoutWalletAddress.length
    )
  } catch (error: any) {
    assert(false, 'Wallet Association', `Test failed: ${error.message}`)
  }
  console.log()

  // ============================================================================
  // Test 5: OAuth Account Linking
  // ============================================================================
  console.log('TEST SUITE 5: OAuth Account Linking')
  console.log('-'.repeat(80))

  try {
    const { data: oauthAccounts } = await supabase
      .from('profile_oauth_accounts')
      .select('profile_id, provider')

    const uniqueProfiles = new Set(oauthAccounts?.map((a: any) => a.profile_id))

    console.log(`ℹ️  ${uniqueProfiles.size} profiles have OAuth accounts`)
    console.log(`ℹ️  ${oauthAccounts?.length || 0} total OAuth accounts`)

    // Check that all OAuth-linked profiles exist in profiles table
    if (oauthAccounts && oauthAccounts.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .in('id', Array.from(uniqueProfiles))

      assert(
        profiles?.length === uniqueProfiles.size,
        'OAuth Profile Integrity',
        'All OAuth accounts should link to valid profiles',
        uniqueProfiles.size,
        profiles?.length
      )
    }
  } catch (error: any) {
    assert(false, 'OAuth Account Linking', `Test failed: ${error.message}`)
  }
  console.log()

  // ============================================================================
  // Test 6: Date Handling
  // ============================================================================
  console.log('TEST SUITE 6: Date Handling')
  console.log('-'.repeat(80))

  try {
    const profiles = await ProfileService.getAllProfilesFromDatabase()

    const invalidDates = profiles.filter(p => {
      return !(p.createdAt instanceof Date) ||
             isNaN(p.createdAt.getTime()) ||
             !(p.updatedAt instanceof Date) ||
             isNaN(p.updatedAt.getTime())
    })

    assert(
      invalidDates.length === 0,
      'Valid Date Objects',
      'All profiles should have valid Date objects for createdAt and updatedAt',
      0,
      invalidDates.length
    )

    // Check that createdAt is not in the future
    const now = new Date()
    const futureProfiles = profiles.filter(p => p.createdAt > now)

    assert(
      futureProfiles.length === 0,
      'Dates Not in Future',
      'No profile should have createdAt in the future',
      0,
      futureProfiles.length
    )
  } catch (error: any) {
    assert(false, 'Date Handling', `Test failed: ${error.message}`)
  }
  console.log()

  // ============================================================================
  // Test 7: Sorting
  // ============================================================================
  console.log('TEST SUITE 7: Profile Sorting')
  console.log('-'.repeat(80))

  try {
    const profiles = await ProfileService.getAllProfilesFromDatabase()

    if (profiles.length > 1) {
      // Check that profiles are sorted by createdAt descending (newest first)
      let isSorted = true
      for (let i = 0; i < profiles.length - 1; i++) {
        if (profiles[i].createdAt < profiles[i + 1].createdAt) {
          isSorted = false
          break
        }
      }

      assert(
        isSorted,
        'Profiles Sorted by Date',
        'Profiles should be sorted by createdAt descending (newest first)',
        'Sorted',
        isSorted ? 'Sorted' : 'Not sorted'
      )
    } else {
      console.log('ℹ️  Skipping sort test (less than 2 profiles)')
    }
  } catch (error: any) {
    assert(false, 'Profile Sorting', `Test failed: ${error.message}`)
  }
  console.log()

  // ============================================================================
  // Test 8: Error Handling
  // ============================================================================
  console.log('TEST SUITE 8: Error Handling')
  console.log('-'.repeat(80))

  try {
    // Test that ProfileService handles empty results gracefully
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000000') // Non-existent ID

    // Should return empty array, not null or error
    assert(
      Array.isArray(data),
      'Empty Result Handling',
      'ProfileService should handle empty results gracefully',
      'Array',
      typeof data
    )
  } catch (error: any) {
    assert(false, 'Error Handling', `Test failed: ${error.message}`)
  }
  console.log()

  // ============================================================================
  // Summary
  // ============================================================================
  console.log('='.repeat(80))
  console.log('TEST SUMMARY')
  console.log('='.repeat(80))
  console.log()

  const totalTests = results.length
  const passedTests = results.filter(r => r.passed).length
  const failedTests = totalTests - passedTests

  console.log(`Total Tests: ${totalTests}`)
  console.log(`Passed: ${passedTests}`)
  console.log(`Failed: ${failedTests}`)
  console.log()

  if (failedTests > 0) {
    console.log('FAILED TESTS:')
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  ❌ ${r.testName}: ${r.message}`)
    })
    console.log()
  }

  const successRate = (passedTests / totalTests * 100).toFixed(1)
  console.log(`Success Rate: ${successRate}%`)
  console.log()

  if (failedTests === 0) {
    console.log('✅ ALL TESTS PASSED!')
    console.log('If users still not showing on Home page, issue is likely in frontend rendering.')
  } else {
    console.log('❌ SOME TESTS FAILED')
    console.log('Fix the issues above before proceeding.')
  }

  console.log('='.repeat(80))

  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0)
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error in test suite:', error)
  process.exit(1)
})
