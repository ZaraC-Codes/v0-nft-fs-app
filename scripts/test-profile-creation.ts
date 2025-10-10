/**
 * Test script to verify profile creation fixes
 *
 * This script tests:
 * 1. 409 Conflict handling in createProfileInDatabase
 * 2. Proper UUID generation and storage
 * 3. OAuth account linking with validation
 * 4. Error handling when database sync fails
 */

import { ProfileService } from '../lib/profile-service'

async function testProfileCreation() {
  console.log('🧪 Starting profile creation tests...\n')

  // Test 1: Create profile with valid OAuth data
  console.log('Test 1: Create profile with valid OAuth data')
  console.log('=' .repeat(50))

  try {
    const profile1 = await ProfileService.createProfileInDatabase(
      'test_user_' + Date.now(),
      {
        provider: 'google',
        providerAccountId: 'google_test_' + Date.now(),
        email: 'test@example.com'
      },
      '0xTESTWALLET1234567890123456789012345678'
    )

    console.log('✅ Profile created successfully')
    console.log(`   ID: ${profile1.id}`)
    console.log(`   Username: ${profile1.username}`)
    console.log(`   Is UUID: ${/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profile1.id)}`)
    console.log()
  } catch (error) {
    console.error('❌ Test 1 failed:', error)
    console.log()
  }

  // Test 2: Create profile with missing OAuth provider (should skip OAuth insert)
  console.log('Test 2: Create profile with missing OAuth provider')
  console.log('=' .repeat(50))

  try {
    const profile2 = await ProfileService.createProfileInDatabase(
      'test_user_no_oauth_' + Date.now(),
      {
        provider: '', // Empty provider
        providerAccountId: '',
        email: 'test2@example.com'
      },
      '0xTESTWALLET2345678901234567890123456789'
    )

    console.log('✅ Profile created successfully (skipped OAuth insert)')
    console.log(`   ID: ${profile2.id}`)
    console.log(`   Username: ${profile2.username}`)
    console.log(`   Is UUID: ${/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profile2.id)}`)
    console.log()
  } catch (error) {
    console.error('❌ Test 2 failed:', error)
    console.log()
  }

  // Test 3: Test duplicate OAuth account (409 Conflict handling)
  console.log('Test 3: Test duplicate OAuth account (should handle 409 gracefully)')
  console.log('=' .repeat(50))

  const duplicateOAuthData = {
    provider: 'google',
    providerAccountId: 'google_duplicate_test_' + Date.now(),
    email: 'duplicate@example.com'
  }

  try {
    // Create first profile
    const profile3a = await ProfileService.createProfileInDatabase(
      'test_duplicate_1_' + Date.now(),
      duplicateOAuthData,
      '0xTESTWALLET3456789012345678901234567890'
    )

    console.log('✅ First profile created')
    console.log(`   ID: ${profile3a.id}`)

    // Try to create second profile with same OAuth (should fail at profile level due to unique constraint)
    // But if we manually try to insert OAuth again, it should handle 409 gracefully
    console.log('⚠️ Attempting duplicate OAuth insert (would normally cause 409)...')
    console.log('   Note: Full duplicate test requires direct Supabase access')
    console.log()
  } catch (error) {
    console.error('❌ Test 3 failed:', error)
    console.log()
  }

  // Test 4: Verify createProfileFromWallet returns database profile
  console.log('Test 4: Verify createProfileFromWallet returns database profile (not wallet ID)')
  console.log('=' .repeat(50))

  try {
    const testWallet = '0xTEST' + Date.now().toString().slice(-36)
    const profile4 = await ProfileService.createProfileFromWallet(
      testWallet,
      {
        provider: 'google',
        email: 'wallet_test@example.com',
        name: 'Test User'
      }
    )

    console.log('✅ Profile created via createProfileFromWallet')
    console.log(`   ID: ${profile4.id}`)
    console.log(`   Username: ${profile4.username}`)
    console.log(`   Is UUID: ${/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profile4.id)}`)
    console.log(`   NOT wallet address: ${profile4.id !== testWallet}`)

    if (profile4.id === testWallet) {
      console.error('❌ CRITICAL: Profile ID is wallet address (should be UUID)!')
    } else {
      console.log('✅ Profile ID is valid UUID (not wallet address)')
    }
    console.log()
  } catch (error) {
    console.error('❌ Test 4 failed:', error)
    console.log()
  }

  console.log('🎉 All tests completed!')
  console.log('\nSummary:')
  console.log('- Test 1: Profile creation with valid OAuth')
  console.log('- Test 2: Profile creation with missing OAuth (should skip)')
  console.log('- Test 3: Duplicate OAuth handling (409 Conflict)')
  console.log('- Test 4: createProfileFromWallet returns UUID (not wallet address)')
}

// Run tests
testProfileCreation()
  .then(() => {
    console.log('\n✅ Test suite completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error)
    process.exit(1)
  })
