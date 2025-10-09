/**
 * Sync Debugger Component
 *
 * Provides browser console commands for debugging Supabase sync issues.
 * Import this component in your root layout to enable debugging commands.
 *
 * Usage: Add `<SyncDebugger />` to app/layout.tsx
 */

'use client'

import { useEffect } from 'react'

export const SyncDebugger = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return

    console.log('🔧 Sync Debugger loaded. Available commands:')
    console.log('  - window.checkProfileSync()')
    console.log('  - window.syncStatus()')
    console.log('  - window.pullFromSupabase()')
    console.log('  - window.forceSyncToSupabase()')
    console.log('  - window.testWatchlistSync()')
    console.log('  - window.testFollowSync()')
    console.log('  - window.nukeAllData() ⚠️')

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
      console.log('📦 localStorage profile:', localProfile)

      // Try to fetch from Supabase
      const supabaseProfiles = await ProfileService.getAllProfilesFromDatabase()
      const supabaseProfile = supabaseProfiles.find(p => p.id === user.id)

      console.log('☁️ Supabase profile:', supabaseProfile)

      if (!supabaseProfile) {
        console.error('❌ Profile NOT FOUND in Supabase - THIS IS THE BUG!')
        console.log('💡 Run window.forceSyncToSupabase() to fix')
        return
      }

      const synced = JSON.stringify(localProfile) === JSON.stringify(supabaseProfile)
      if (synced) {
        console.log('✅ Profiles are synced!')
      } else {
        console.warn('⚠️ Profiles differ:')
        console.log('Differences:', {
          username: localProfile?.username === supabaseProfile?.username ? '✅' : `❌ ${localProfile?.username} vs ${supabaseProfile?.username}`,
          email: localProfile?.email === supabaseProfile?.email ? '✅' : `❌ ${localProfile?.email} vs ${supabaseProfile?.email}`,
          bio: localProfile?.bio === supabaseProfile?.bio ? '✅' : '❌',
          avatar: localProfile?.avatar === supabaseProfile?.avatar ? '✅' : '❌'
        })
      }
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
        } catch (error: any) {
          console.error(`❌ Failed to sync ${profile.username}:`, error.message)
        }
      }

      console.log('✅ Sync complete!')
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

      console.log('💣 Deleting all data...')

      // Delete from Supabase (cascades to wallets, oauth, follows, watchlist)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

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
        console.log('💡 Run window.forceSyncToSupabase() to fix')
      }
      if (inSupabaseOnly.length > 0) {
        console.log(`⚠️ ${inSupabaseOnly.length} profiles ONLY in Supabase:`, inSupabaseOnly.map(p => p.username))
        console.log('💡 Run window.pullFromSupabase() to fix')
      }

      if (inLocalOnly.length === 0 && inSupabaseOnly.length === 0) {
        console.log('✅ All profiles synced!')
      }

      // Show current user
      const userStr = localStorage.getItem('fortuna_square_user')
      if (userStr) {
        const user = JSON.parse(userStr)
        console.log(`\n👤 Current user: ${user.username} (${user.id})`)

        const inSupabase = supabaseProfiles.some(sp => sp.id === user.id)
        if (inSupabase) {
          console.log('✅ Current user exists in Supabase')
        } else {
          console.error('❌ CURRENT USER NOT IN SUPABASE - THIS IS THE BUG!')
          console.log('💡 Run window.forceSyncToSupabase() to fix')
        }
      } else {
        console.log('\n👤 No user logged in')
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

      console.log('⭐ Fetching watchlist from Supabase...')
      const watchlist = await ProfileService.getWatchlist(user.id)

      console.log(`📋 Watchlist (${watchlist.length} items):`)
      if (watchlist.length === 0) {
        console.log('  (empty)')
      } else {
        watchlist.forEach(item => {
          console.log(`  - ${item.collectionName || 'Unknown'} (Chain ${item.chainId})`)
          console.log(`    ${item.collectionAddress}`)
        })
      }
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

      console.log('👥 Fetching follow data from Supabase...')
      const following = await ProfileService.getFollowing(user.id)
      const followers = await ProfileService.getFollowers(user.id)
      const counts = await ProfileService.getFollowCounts(user.id)

      console.log('═══════════════════════════════════')
      console.log('👥 FOLLOW STATUS')
      console.log('═══════════════════════════════════')
      console.log(`📊 Following: ${counts.following}`)
      console.log(`📊 Followers: ${counts.followers}`)

      if (following.length > 0) {
        console.log('\nFollowing:', following.map(p => p.username))
      }
      if (followers.length > 0) {
        console.log('Followers:', followers.map(p => p.username))
      }
    }

    // Command: Measure sync lag
    (window as any).measureSyncLag = async () => {
      const { ProfileService } = await import('@/lib/profile-service')

      console.log('⏱️ Measuring sync lag...')

      const testUpdate = {
        bio: `Sync test at ${Date.now()}`
      }

      const userStr = localStorage.getItem('fortuna_square_user')
      if (!userStr) {
        console.log('❌ No user logged in')
        return
      }

      const user = JSON.parse(userStr)

      // Update localStorage
      const t0 = performance.now()
      ProfileService.updateProfile(user.id, testUpdate)
      const t1 = performance.now()

      console.log(`📦 localStorage update: ${(t1 - t0).toFixed(2)}ms`)

      // Update Supabase
      const t2 = performance.now()
      await ProfileService.updateProfileInDatabase(user.id, testUpdate)
      const t3 = performance.now()

      console.log(`☁️ Supabase update: ${(t3 - t2).toFixed(2)}ms`)
      console.log(`📊 Sync lag: ${((t3 - t2) - (t1 - t0)).toFixed(2)}ms`)
    }

  }, [])

  return null
}
