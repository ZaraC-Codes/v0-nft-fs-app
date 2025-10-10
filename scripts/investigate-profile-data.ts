/**
 * URGENT INVESTIGATION SCRIPT
 *
 * This script investigates the critical data inconsistencies reported by the user.
 *
 * USER REPORT:
 * - Home page shows 2 testers: "Collector4397" and "0xB270...136b"
 * - User's actual profile is "Z33Fi" with pixel art avatar
 * - None of the home page profiles match the user's actual profile
 * - User claims to be the ONLY user on the app
 *
 * INVESTIGATION TASKS:
 * 1. Query Supabase for ALL profiles
 * 2. Check localStorage cache
 * 3. Identify where "Collector4397" comes from
 * 4. Find the "Z33Fi" profile
 * 5. Check for duplicate profiles
 * 6. Verify data source consistency
 */

import { getSupabaseClient } from "../lib/supabase"
import { ProfileService } from "../lib/profile-service"

async function investigateProfileData() {
  console.log("\n" + "=".repeat(80))
  console.log("CRITICAL DATA INCONSISTENCY INVESTIGATION")
  console.log("=".repeat(80) + "\n")

  const supabase = getSupabaseClient()

  // ============================================================================
  // 1. QUERY SUPABASE DATABASE
  // ============================================================================
  console.log("\n📊 STEP 1: QUERYING SUPABASE DATABASE")
  console.log("-".repeat(80))

  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        email,
        avatar,
        bio,
        created_at,
        updated_at,
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
      .order('created_at', { ascending: false })

    if (error) {
      console.error("❌ Error querying Supabase:", error)
      return
    }

    console.log(`\n✅ Found ${profiles?.length || 0} profiles in Supabase:\n`)

    if (profiles && profiles.length > 0) {
      profiles.forEach((profile, index) => {
        console.log(`Profile ${index + 1}:`)
        console.log(`  ID: ${profile.id}`)
        console.log(`  Username: ${profile.username}`)
        console.log(`  Email: ${profile.email || 'N/A'}`)
        console.log(`  Avatar: ${profile.avatar ? 'Yes' : 'No'}`)
        console.log(`  Bio: ${profile.bio?.substring(0, 50)}...`)
        console.log(`  Created: ${new Date(profile.created_at).toLocaleString()}`)
        console.log(`  Updated: ${new Date(profile.updated_at).toLocaleString()}`)

        console.log(`  Wallets:`)
        if (profile.profile_wallets && profile.profile_wallets.length > 0) {
          profile.profile_wallets.forEach((wallet: any) => {
            console.log(`    - ${wallet.wallet_address} (${wallet.wallet_type}, primary: ${wallet.is_primary})`)
          })
        } else {
          console.log(`    - None`)
        }

        console.log(`  OAuth Accounts:`)
        if (profile.profile_oauth_accounts && profile.profile_oauth_accounts.length > 0) {
          profile.profile_oauth_accounts.forEach((oauth: any) => {
            console.log(`    - ${oauth.provider} (${oauth.email || 'no email'})`)
          })
        } else {
          console.log(`    - None`)
        }
        console.log("")
      })
    } else {
      console.log("⚠️ NO PROFILES FOUND IN SUPABASE DATABASE!")
    }

    // ============================================================================
    // 2. CHECK FOR SPECIFIC PROFILES
    // ============================================================================
    console.log("\n🔍 STEP 2: LOOKING FOR SPECIFIC PROFILES")
    console.log("-".repeat(80))

    const collector4397 = profiles?.find(p => p.username === 'Collector4397')
    const z33fi = profiles?.find(p => p.username === 'Z33Fi')
    const walletProfile = profiles?.find(p =>
      p.profile_wallets?.some((w: any) => w.wallet_address?.toLowerCase().includes('b270'))
    )

    console.log(`\n"Collector4397" profile: ${collector4397 ? '✅ FOUND' : '❌ NOT FOUND'}`)
    if (collector4397) {
      console.log(`  Created: ${new Date(collector4397.created_at).toLocaleString()}`)
      console.log(`  Bio: ${collector4397.bio}`)
    }

    console.log(`\n"Z33Fi" profile: ${z33fi ? '✅ FOUND' : '❌ NOT FOUND'}`)
    if (z33fi) {
      console.log(`  Created: ${new Date(z33fi.created_at).toLocaleString()}`)
      console.log(`  Avatar: ${z33fi.avatar || 'None'}`)
      console.log(`  Bio: ${z33fi.bio}`)
    }

    console.log(`\n"0xB270...136b" wallet profile: ${walletProfile ? '✅ FOUND' : '❌ NOT FOUND'}`)
    if (walletProfile) {
      console.log(`  Username: ${walletProfile.username}`)
      console.log(`  Created: ${new Date(walletProfile.created_at).toLocaleString()}`)
    }

    // ============================================================================
    // 3. CHECK FOR DUPLICATES
    // ============================================================================
    console.log("\n🔍 STEP 3: CHECKING FOR DUPLICATE PROFILES")
    console.log("-".repeat(80))

    if (profiles && profiles.length > 0) {
      // Group by wallet address
      const walletGroups = new Map<string, any[]>()
      profiles.forEach(profile => {
        if (profile.profile_wallets && profile.profile_wallets.length > 0) {
          profile.profile_wallets.forEach((wallet: any) => {
            const addr = wallet.wallet_address.toLowerCase()
            if (!walletGroups.has(addr)) {
              walletGroups.set(addr, [])
            }
            walletGroups.get(addr)!.push(profile)
          })
        }
      })

      console.log(`\nWallet Address Groups:`)
      walletGroups.forEach((profiles, wallet) => {
        if (profiles.length > 1) {
          console.log(`\n⚠️ DUPLICATE DETECTED - Wallet ${wallet} has ${profiles.length} profiles:`)
          profiles.forEach(p => {
            console.log(`  - ${p.username} (ID: ${p.id})`)
          })
        }
      })

      // Group by email
      const emailGroups = new Map<string, any[]>()
      profiles.forEach(profile => {
        if (profile.email) {
          const email = profile.email.toLowerCase()
          if (!emailGroups.has(email)) {
            emailGroups.set(email, [])
          }
          emailGroups.get(email)!.push(profile)
        }
      })

      console.log(`\nEmail Groups:`)
      emailGroups.forEach((profiles, email) => {
        if (profiles.length > 1) {
          console.log(`\n⚠️ DUPLICATE DETECTED - Email ${email} has ${profiles.length} profiles:`)
          profiles.forEach(p => {
            console.log(`  - ${p.username} (ID: ${p.id})`)
          })
        }
      })

      // Group by OAuth account
      const oauthGroups = new Map<string, any[]>()
      profiles.forEach(profile => {
        if (profile.profile_oauth_accounts && profile.profile_oauth_accounts.length > 0) {
          profile.profile_oauth_accounts.forEach((oauth: any) => {
            const key = `${oauth.provider}:${oauth.provider_account_id}`
            if (!oauthGroups.has(key)) {
              oauthGroups.set(key, [])
            }
            oauthGroups.get(key)!.push(profile)
          })
        }
      })

      console.log(`\nOAuth Account Groups:`)
      oauthGroups.forEach((profiles, key) => {
        if (profiles.length > 1) {
          console.log(`\n⚠️ DUPLICATE DETECTED - OAuth ${key} has ${profiles.length} profiles:`)
          profiles.forEach(p => {
            console.log(`  - ${p.username} (ID: ${p.id})`)
          })
        }
      })
    }

    // ============================================================================
    // 4. TEST getAllProfilesFromDatabase() FUNCTION
    // ============================================================================
    console.log("\n🔍 STEP 4: TESTING ProfileService.getAllProfilesFromDatabase()")
    console.log("-".repeat(80))

    const serviceProfiles = await ProfileService.getAllProfilesFromDatabase()
    console.log(`\n✅ ProfileService returned ${serviceProfiles.length} profiles:\n`)

    serviceProfiles.forEach((profile, index) => {
      console.log(`Profile ${index + 1}:`)
      console.log(`  Username: ${profile.username}`)
      console.log(`  ID: ${profile.id}`)
      console.log(`  Avatar: ${profile.avatar ? 'Yes' : 'No'}`)
      console.log(`  Bio: ${profile.bio?.substring(0, 50)}...`)
      console.log(`  Followers: ${profile.followersCount}`)
      console.log(`  Following: ${profile.followingCount}`)
      console.log("")
    })

    // ============================================================================
    // 5. COMPARISON: DIRECT QUERY VS SERVICE METHOD
    // ============================================================================
    console.log("\n🔍 STEP 5: COMPARING DATA SOURCES")
    console.log("-".repeat(80))

    console.log(`\nDirect Supabase query: ${profiles?.length || 0} profiles`)
    console.log(`ProfileService method:  ${serviceProfiles.length} profiles`)

    if ((profiles?.length || 0) !== serviceProfiles.length) {
      console.log("\n⚠️ MISMATCH DETECTED! Data source inconsistency!")
    } else {
      console.log("\n✅ Profile counts match")
    }

    // Check if all profiles from service are in database
    const dbUsernames = new Set(profiles?.map(p => p.username) || [])
    const serviceUsernames = new Set(serviceProfiles.map(p => p.username))

    const inServiceNotInDb = Array.from(serviceUsernames).filter(u => !dbUsernames.has(u))
    const inDbNotInService = Array.from(dbUsernames).filter(u => !serviceUsernames.has(u))

    if (inServiceNotInDb.length > 0) {
      console.log(`\n⚠️ Profiles in service but NOT in database:`)
      inServiceNotInDb.forEach(u => console.log(`  - ${u}`))
    }

    if (inDbNotInService.length > 0) {
      console.log(`\n⚠️ Profiles in database but NOT in service:`)
      inDbNotInService.forEach(u => console.log(`  - ${u}`))
    }

    // ============================================================================
    // 6. SUMMARY & RECOMMENDATIONS
    // ============================================================================
    console.log("\n" + "=".repeat(80))
    console.log("SUMMARY & RECOMMENDATIONS")
    console.log("=".repeat(80) + "\n")

    console.log("KEY FINDINGS:\n")

    if (profiles && profiles.length === 0) {
      console.log("🚨 CRITICAL: No profiles found in Supabase database!")
      console.log("   This means the home page is showing cached/stale data from localStorage.")
      console.log("\n   RECOMMENDATION:")
      console.log("   - Clear localStorage cache")
      console.log("   - User should re-login to create fresh profile in Supabase")
    } else if (profiles && profiles.length === 1) {
      console.log("✅ GOOD: Only 1 profile in database (as expected)")
      console.log(`   Profile: ${profiles[0].username}`)
      console.log("\n   But home page shows 2 profiles. This indicates:")
      console.log("   - localStorage has stale data")
      console.log("   - OR the frontend is not properly filtering the logged-in user")
      console.log("\n   RECOMMENDATION:")
      console.log("   - Check app/page.tsx line 95 - getAllProfilesFromDatabase() call")
      console.log("   - Verify real-time subscription is working (line 112-127)")
      console.log("   - Clear localStorage and test again")
    } else if (profiles && profiles.length > 1) {
      console.log("⚠️ WARNING: Multiple profiles in database")
      console.log(`   Count: ${profiles.length}`)
      console.log("\n   This could indicate:")
      console.log("   - User accidentally created multiple accounts")
      console.log("   - Duplicate profile creation bug")
      console.log("   - Testing artifacts")
      console.log("\n   RECOMMENDATION:")
      console.log("   - Identify which profile is the real one")
      console.log("   - Delete duplicates from Supabase")
      console.log("   - Add duplicate prevention in auth-provider.tsx")
    }

    if (!z33fi && (collector4397 || walletProfile)) {
      console.log("\n🚨 CRITICAL: User's profile 'Z33Fi' NOT FOUND in database!")
      console.log("   But 'Collector4397' or wallet profile exists.")
      console.log("\n   This indicates:")
      console.log("   - User might have multiple browser profiles/devices")
      console.log("   - Profile was created in localStorage but not synced to Supabase")
      console.log("   - User needs to re-login to sync profile to database")
    }

    console.log("\n" + "=".repeat(80))

  } catch (error) {
    console.error("❌ Investigation failed:", error)
  }
}

// Run investigation
investigateProfileData()
  .then(() => {
    console.log("\n✅ Investigation complete")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n❌ Investigation failed:", error)
    process.exit(1)
  })
