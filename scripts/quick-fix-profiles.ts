/**
 * QUICK FIX SCRIPT - Profile Data Inconsistencies
 *
 * This script helps diagnose and fix the immediate issue where:
 * - Home page shows wrong profiles
 * - User's actual profile doesn't appear
 * - Multiple profiles exist when there should be only one
 *
 * Run this script to:
 * 1. Check database for all profiles
 * 2. Identify duplicates
 * 3. Optionally delete duplicates
 * 4. Sync correct profile to localStorage
 */

import { getSupabaseClient } from "../lib/supabase"
import * as readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve))
}

async function quickFix() {
  console.log("\n" + "=".repeat(80))
  console.log("QUICK FIX - Profile Data Inconsistencies")
  console.log("=".repeat(80) + "\n")

  const supabase = getSupabaseClient()

  // Step 1: Get all profiles
  console.log("📊 Step 1: Fetching all profiles from database...\n")

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
        is_primary
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("❌ Error fetching profiles:", error)
    rl.close()
    return
  }

  if (!profiles || profiles.length === 0) {
    console.log("⚠️ NO PROFILES FOUND IN DATABASE!")
    console.log("\nThis means:")
    console.log("  - Your profile was never synced to Supabase")
    console.log("  - You need to re-login to create a profile in the database")
    console.log("\nAction: Please logout and login again.")
    rl.close()
    return
  }

  console.log(`✅ Found ${profiles.length} profile(s):\n`)

  profiles.forEach((profile, index) => {
    console.log(`Profile ${index + 1}:`)
    console.log(`  ID: ${profile.id}`)
    console.log(`  Username: ${profile.username}`)
    console.log(`  Email: ${profile.email || 'N/A'}`)
    console.log(`  Avatar: ${profile.avatar ? 'Yes' : 'No'}`)
    console.log(`  Created: ${new Date(profile.created_at).toLocaleString()}`)

    if (profile.profile_wallets && profile.profile_wallets.length > 0) {
      console.log(`  Wallets:`)
      profile.profile_wallets.forEach((w: any) => {
        console.log(`    - ${w.wallet_address} (${w.wallet_type})`)
      })
    }
    console.log("")
  })

  // Step 2: Check for duplicates
  if (profiles.length > 1) {
    console.log("⚠️ WARNING: Multiple profiles detected!\n")

    // Group by wallet
    const walletMap = new Map<string, any[]>()
    profiles.forEach(profile => {
      if (profile.profile_wallets && profile.profile_wallets.length > 0) {
        profile.profile_wallets.forEach((w: any) => {
          const key = w.wallet_address.toLowerCase()
          if (!walletMap.has(key)) {
            walletMap.set(key, [])
          }
          walletMap.get(key)!.push(profile)
        })
      }
    })

    // Find duplicates
    const duplicates: any[] = []
    walletMap.forEach((profs, wallet) => {
      if (profs.length > 1) {
        console.log(`🔴 Duplicate profiles for wallet ${wallet}:`)
        profs.forEach(p => {
          console.log(`  - ${p.username} (ID: ${p.id}, created: ${new Date(p.created_at).toLocaleString()})`)
          duplicates.push({ wallet, profile: p })
        })
        console.log("")
      }
    })

    if (duplicates.length > 0) {
      console.log("💡 RECOMMENDATION: Keep the most recent profile and delete older ones.\n")

      const shouldDelete = await question("Do you want to delete duplicate profiles? (yes/no): ")

      if (shouldDelete.toLowerCase() === 'yes' || shouldDelete.toLowerCase() === 'y') {
        // Group duplicates by wallet
        const toDelete: string[] = []
        walletMap.forEach((profs) => {
          if (profs.length > 1) {
            // Sort by created_at, keep newest
            profs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            const keep = profs[0]
            const remove = profs.slice(1)

            console.log(`\n✅ Keeping: ${keep.username} (${keep.id})`)
            remove.forEach(p => {
              console.log(`❌ Deleting: ${p.username} (${p.id})`)
              toDelete.push(p.id)
            })
          }
        })

        // Delete old profiles
        for (const id of toDelete) {
          const { error: deleteError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id)

          if (deleteError) {
            console.error(`❌ Failed to delete profile ${id}:`, deleteError)
          } else {
            console.log(`✅ Deleted profile ${id}`)
          }
        }

        console.log("\n✅ Cleanup complete!")
      }
    }
  } else {
    console.log("✅ Only 1 profile found - no duplicates!\n")
  }

  // Step 3: Show which profile is correct
  console.log("\n" + "=".repeat(80))
  console.log("FINAL RESULT")
  console.log("=".repeat(80) + "\n")

  const finalProfiles = await supabase
    .from('profiles')
    .select('id, username, email, avatar')
    .order('created_at', { ascending: false })

  if (finalProfiles.data && finalProfiles.data.length > 0) {
    console.log("Your profile in the database:")
    finalProfiles.data.forEach(p => {
      console.log(`  Username: ${p.username}`)
      console.log(`  Email: ${p.email || 'N/A'}`)
      console.log(`  Avatar: ${p.avatar ? 'Set' : 'Not set'}`)
    })

    console.log("\n💡 NEXT STEPS:")
    console.log("  1. Clear localStorage cache in your browser:")
    console.log("     > localStorage.removeItem('fortuna_square_profiles')")
    console.log("  2. Refresh the home page")
    console.log("  3. You should now see your correct profile")
  }

  rl.close()
}

quickFix()
  .then(() => {
    console.log("\n✅ Script complete")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error)
    rl.close()
    process.exit(1)
  })
