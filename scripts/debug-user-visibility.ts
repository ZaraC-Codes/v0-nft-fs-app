/**
 * DEBUG SCRIPT: User Visibility on Home Page
 *
 * This script verifies the entire data pipeline for user profiles:
 * 1. Checks how many profiles exist in Supabase
 * 2. Tests ProfileService.getAllProfilesFromDatabase()
 * 3. Simulates what the Home page component sees
 * 4. Identifies any filtering or transformation issues
 *
 * Usage:
 *   npx tsx scripts/debug-user-visibility.ts
 */

import { ProfileService } from '../lib/profile-service'
import { getSupabaseClient } from '../lib/supabase'

interface DebugResult {
  stage: string
  success: boolean
  count: number
  data?: any[]
  error?: string
  notes?: string[]
}

async function debugUserVisibility() {
  console.log('='.repeat(80))
  console.log('USER VISIBILITY DEBUG REPORT')
  console.log('='.repeat(80))
  console.log()

  const results: DebugResult[] = []

  // ============================================================================
  // STAGE 1: Direct Supabase Query
  // ============================================================================
  console.log('STAGE 1: Checking Supabase Database Directly')
  console.log('-'.repeat(80))

  try {
    const supabase = getSupabaseClient()
    const { data: profiles, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (error) {
      results.push({
        stage: 'Supabase Direct Query',
        success: false,
        count: 0,
        error: error.message
      })
      console.error('❌ Error querying Supabase:', error.message)
    } else {
      results.push({
        stage: 'Supabase Direct Query',
        success: true,
        count: count || profiles?.length || 0,
        data: profiles,
        notes: [
          `Found ${count} total profiles in database`,
          `Returned ${profiles?.length} profiles in result`
        ]
      })

      console.log(`✅ Found ${count} profiles in Supabase database`)
      console.log(`✅ Retrieved ${profiles?.length} profiles`)
      console.log()

      if (profiles && profiles.length > 0) {
        console.log('Sample profiles:')
        profiles.slice(0, 5).forEach((profile: any, index: number) => {
          console.log(`  ${index + 1}. ${profile.username} (ID: ${profile.id})`)
          console.log(`     Email: ${profile.email || 'N/A'}`)
          console.log(`     Created: ${profile.created_at}`)
          console.log(`     Verified: ${profile.is_verified}`)
          console.log()
        })

        if (profiles.length > 5) {
          console.log(`  ... and ${profiles.length - 5} more profiles`)
          console.log()
        }
      }
    }
  } catch (error: any) {
    results.push({
      stage: 'Supabase Direct Query',
      success: false,
      count: 0,
      error: error.message
    })
    console.error('❌ Exception in Supabase query:', error.message)
  }

  // ============================================================================
  // STAGE 2: Query with Wallet Joins
  // ============================================================================
  console.log('STAGE 2: Checking Profiles with Wallet Joins')
  console.log('-'.repeat(80))

  try {
    const supabase = getSupabaseClient()
    const { data: profilesWithWallets, error } = await supabase
      .from('profiles')
      .select(`
        *,
        profile_wallets (
          wallet_address,
          wallet_type,
          is_primary,
          added_at
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      results.push({
        stage: 'Profiles with Wallet Joins',
        success: false,
        count: 0,
        error: error.message
      })
      console.error('❌ Error querying with joins:', error.message)
    } else {
      results.push({
        stage: 'Profiles with Wallet Joins',
        success: true,
        count: profilesWithWallets?.length || 0,
        data: profilesWithWallets
      })

      console.log(`✅ Retrieved ${profilesWithWallets?.length} profiles with wallet data`)
      console.log()

      if (profilesWithWallets && profilesWithWallets.length > 0) {
        // Check for profiles without wallets
        const profilesWithoutWallets = profilesWithWallets.filter(
          (p: any) => !p.profile_wallets || p.profile_wallets.length === 0
        )

        if (profilesWithoutWallets.length > 0) {
          console.log(`⚠️  WARNING: ${profilesWithoutWallets.length} profiles have NO wallets:`)
          profilesWithoutWallets.forEach((profile: any) => {
            console.log(`  - ${profile.username} (ID: ${profile.id})`)
          })
          console.log()
        }

        // Check for profiles with multiple wallets
        const profilesWithMultipleWallets = profilesWithWallets.filter(
          (p: any) => p.profile_wallets && p.profile_wallets.length > 1
        )

        if (profilesWithMultipleWallets.length > 0) {
          console.log(`📊 ${profilesWithMultipleWallets.length} profiles have multiple wallets`)
          console.log()
        }
      }
    }
  } catch (error: any) {
    results.push({
      stage: 'Profiles with Wallet Joins',
      success: false,
      count: 0,
      error: error.message
    })
    console.error('❌ Exception in wallet join query:', error.message)
  }

  // ============================================================================
  // STAGE 3: ProfileService.getAllProfilesFromDatabase()
  // ============================================================================
  console.log('STAGE 3: Testing ProfileService.getAllProfilesFromDatabase()')
  console.log('-'.repeat(80))

  try {
    const profiles = await ProfileService.getAllProfilesFromDatabase()

    results.push({
      stage: 'ProfileService.getAllProfilesFromDatabase()',
      success: true,
      count: profiles.length,
      data: profiles,
      notes: [
        'This is what the Home page component should receive',
        `Returned ${profiles.length} profiles`
      ]
    })

    console.log(`✅ ProfileService returned ${profiles.length} profiles`)
    console.log()

    if (profiles.length > 0) {
      console.log('Profiles returned to Home page:')
      profiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. ${profile.username}`)
        console.log(`     ID: ${profile.id}`)
        console.log(`     Wallet: ${profile.walletAddress || 'N/A'}`)
        console.log(`     # of Wallets: ${profile.wallets?.length || 0}`)
        console.log(`     Verified: ${profile.verified}`)
        console.log(`     Created: ${profile.createdAt.toISOString()}`)
        console.log()
      })
    } else {
      console.log('⚠️  WARNING: ProfileService returned ZERO profiles!')
      console.log()
    }
  } catch (error: any) {
    results.push({
      stage: 'ProfileService.getAllProfilesFromDatabase()',
      success: false,
      count: 0,
      error: error.message
    })
    console.error('❌ Error in ProfileService:', error.message)
    console.error('Stack trace:', error.stack)
  }

  // ============================================================================
  // STAGE 4: Check for Data Transformation Issues
  // ============================================================================
  console.log('STAGE 4: Analyzing Data Transformation')
  console.log('-'.repeat(80))

  const stage1Result = results.find(r => r.stage === 'Supabase Direct Query')
  const stage3Result = results.find(r => r.stage === 'ProfileService.getAllProfilesFromDatabase()')

  if (stage1Result?.success && stage3Result?.success) {
    const dbCount = stage1Result.count
    const serviceCount = stage3Result.count

    if (dbCount !== serviceCount) {
      console.log(`❌ DATA LOSS DETECTED!`)
      console.log(`   Database has ${dbCount} profiles`)
      console.log(`   ProfileService returned ${serviceCount} profiles`)
      console.log(`   ${dbCount - serviceCount} profiles were lost in transformation!`)
      console.log()

      // Try to identify which profiles were lost
      if (stage1Result.data && stage3Result.data) {
        const dbIds = new Set(stage1Result.data.map((p: any) => p.id))
        const serviceIds = new Set(stage3Result.data.map((p: any) => p.id))

        const lostProfiles = stage1Result.data.filter(
          (p: any) => !serviceIds.has(p.id)
        )

        if (lostProfiles.length > 0) {
          console.log('Lost profiles:')
          lostProfiles.forEach((profile: any) => {
            console.log(`  - ${profile.username} (ID: ${profile.id})`)
          })
          console.log()
        }
      }
    } else {
      console.log(`✅ No data loss detected`)
      console.log(`   Both stages report ${dbCount} profiles`)
      console.log()
    }
  }

  // ============================================================================
  // STAGE 5: Check for Render Filtering
  // ============================================================================
  console.log('STAGE 5: Checking for Frontend Filtering Issues')
  console.log('-'.repeat(80))

  if (stage3Result?.success && stage3Result.data) {
    const profiles = stage3Result.data

    // Check for profiles that might not render
    const profilesWithoutUsername = profiles.filter((p: any) => !p.username)
    const profilesWithEmptyUsername = profiles.filter((p: any) => p.username === '')
    const profilesWithoutId = profiles.filter((p: any) => !p.id)

    if (profilesWithoutUsername.length > 0) {
      console.log(`❌ ${profilesWithoutUsername.length} profiles have NO username (won't render)`)
    }

    if (profilesWithEmptyUsername.length > 0) {
      console.log(`❌ ${profilesWithEmptyUsername.length} profiles have EMPTY username (won't render)`)
    }

    if (profilesWithoutId.length > 0) {
      console.log(`❌ ${profilesWithoutId.length} profiles have NO id (won't render)`)
    }

    if (
      profilesWithoutUsername.length === 0 &&
      profilesWithEmptyUsername.length === 0 &&
      profilesWithoutId.length === 0
    ) {
      console.log(`✅ All profiles have valid username and id`)
      console.log(`   All ${profiles.length} profiles should render on Home page`)
    }
    console.log()
  }

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('='.repeat(80))
  console.log('SUMMARY')
  console.log('='.repeat(80))
  console.log()

  results.forEach((result, index) => {
    const icon = result.success ? '✅' : '❌'
    console.log(`${icon} ${result.stage}: ${result.count} profiles`)
    if (result.error) {
      console.log(`   Error: ${result.error}`)
    }
    if (result.notes) {
      result.notes.forEach(note => console.log(`   - ${note}`))
    }
    console.log()
  })

  // ============================================================================
  // RECOMMENDATIONS
  // ============================================================================
  console.log('='.repeat(80))
  console.log('RECOMMENDATIONS')
  console.log('='.repeat(80))
  console.log()

  const allStagesSuccessful = results.every(r => r.success)
  const stage1Count = results.find(r => r.stage === 'Supabase Direct Query')?.count || 0
  const finalCount = results.find(r => r.stage === 'ProfileService.getAllProfilesFromDatabase()')?.count || 0

  if (!allStagesSuccessful) {
    console.log('❌ ISSUE: Some stages failed')
    console.log('   Action: Check error messages above and fix database connection or query issues')
    console.log()
  } else if (stage1Count === 0) {
    console.log('ℹ️  INFO: No profiles in database yet')
    console.log('   Action: Create test profiles using the signup flow')
    console.log()
  } else if (finalCount < stage1Count) {
    console.log('❌ ISSUE: Data loss in ProfileService transformation')
    console.log('   Action: Check ProfileService.getAllProfilesFromDatabase() for filtering logic')
    console.log('   Look for: try-catch blocks that might be swallowing errors')
    console.log()
  } else if (finalCount === stage1Count && finalCount > 0) {
    console.log('✅ SUCCESS: All profiles are being fetched correctly!')
    console.log('   Next: If users still not showing on Home page, check:')
    console.log('   1. React component state updates')
    console.log('   2. useEffect dependencies')
    console.log('   3. Browser console for client-side errors')
    console.log()
  }

  console.log('='.repeat(80))
  console.log('END OF REPORT')
  console.log('='.repeat(80))
}

// Run the debug script
debugUserVisibility().catch(error => {
  console.error('Fatal error in debug script:', error)
  process.exit(1)
})
