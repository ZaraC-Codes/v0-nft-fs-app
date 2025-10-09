/**
 * Sync Debugger Component
 *
 * Provides browser console commands for debugging Supabase sync issues.
 * Import this component in your root layout to enable debugging commands.
 *
 * Usage: Add `<SyncDebugger />` to app/layout.tsx (gated for development only)
 */

'use client'

import { useEffect } from 'react'

export const SyncDebugger = () => {
  useEffect(() => {
    // Only run in development or with explicit debug flag
    const isDev = process.env.NODE_ENV === 'development'
    const debugEnabled = typeof window !== 'undefined' &&
                        new URLSearchParams(window.location.search).get('debug') === 'true'

    if (!isDev && !debugEnabled) return
    if (typeof window === 'undefined') return

    // Safe console wrapper to prevent production errors
    const safeLog = (...args: any[]) => {
      try {
        if (typeof console?.log === 'function') {
          console.log(...args)
        }
      } catch (e) {
        // Silently fail - don't break production
      }
    }

    safeLog('🔧 Sync Debugger loaded. Available commands:')
    safeLog('  - window.checkProfileSync()')
    safeLog('  - window.syncStatus()')
    safeLog('  - window.pullFromSupabase()')
    safeLog('  - window.forceSyncToSupabase()')
    safeLog('  - window.testWatchlistSync()')
    safeLog('  - window.testFollowSync()')
    safeLog('  - window.nukeAllData() ⚠️')

    // Command: Check localStorage vs Supabase for current user
    (window as any).checkProfileSync = async () => {
      const userStr = localStorage.getItem('fortuna_square_user')
      if (!userStr) {
        safeLog('❌ No user in localStorage')
        return
      }

      const user = JSON.parse(userStr)
      const { ProfileService } = await import('@/lib/profile-service')

      const localProfile = ProfileService.getProfile(user.id)
      safeLog('📦 localStorage profile:', localProfile)

      // Try to fetch from Supabase
      const supabaseProfiles = await ProfileService.getAllProfilesFromDatabase()
      const supabaseProfile = supabaseProfiles.find(p => p.id === user.id)

      safeLog('☁️ Supabase profile:', supabaseProfile)

      if (!supabaseProfile) {
        safeLog('❌ Profile NOT FOUND in Supabase - THIS IS THE BUG!')
        safeLog('💡 Run window.forceSyncToSupabase() to fix')
        return
      }

      const synced = JSON.stringify(localProfile) === JSON.stringify(supabaseProfile)
      if (synced) {
        safeLog('✅ Profiles are synced!')
      } else {
        safeLog('⚠️ Profiles differ:')
        safeLog('Differences:', {
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

      safeLog(`🔄 Syncing ${localProfiles.length} profiles to Supabase...`)

      for (const profile of localProfiles) {
        try {
          await ProfileService.updateProfileInDatabase(profile.id, profile)
          safeLog(`✅ Synced: ${profile.username}`)
        } catch (error: any) {
          safeLog(`❌ Failed to sync ${profile.username}:`, error.message)
        }
      }

      safeLog('✅ Sync complete!')
    }

    // Command: Pull fresh data from Supabase
    (window as any).pullFromSupabase = async () => {
      const { ProfileService } = await import('@/lib/profile-service')
      const supabaseProfiles = await ProfileService.getAllProfilesFromDatabase()

      safeLog(`☁️ Fetched ${supabaseProfiles.length} profiles from Supabase`)

      // Sync to localStorage
      for (const profile of supabaseProfiles) {
        await ProfileService.syncProfileToLocalStorage(profile)
      }

      safeLog('✅ Synced all Supabase profiles to localStorage')
      safeLog('🔄 Refresh page to see changes')
    }

    // Command: Clear all data (both localStorage AND Supabase)
    (window as any).nukeAllData = async () => {
      const confirmed = confirm('⚠️ This will DELETE ALL profiles from localStorage AND Supabase. Continue?')
      if (!confirmed) return

      const { getSupabaseClient } = await import('@/lib/supabase')
      const supabase = getSupabaseClient()

      safeLog('💣 Deleting all data...')

      // Delete from Supabase (cascades to wallets, oauth, follows, watchlist)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (error) {
        safeLog('❌ Failed to delete from Supabase:', error)
      } else {
        safeLog('☁️ Deleted all profiles from Supabase')
      }

      // Clear localStorage
      localStorage.removeItem('fortuna_square_profiles')
      localStorage.removeItem('fortuna_square_user')

      safeLog('📦 Cleared localStorage')
      safeLog('✅ All data nuked. Refresh to start fresh.')
    }

    // Command: Show sync status
    (window as any).syncStatus = async () => {
      const { ProfileService } = await import('@/lib/profile-service')

      const localProfiles = ProfileService.getProfiles()
      const supabaseProfiles = await ProfileService.getAllProfilesFromDatabase()

      safeLog('═══════════════════════════════════')
      safeLog('📊 SYNC STATUS')
      safeLog('═══════════════════════════════════')
      safeLog(`📦 localStorage: ${localProfiles.length} profiles`)
      safeLog(`☁️ Supabase: ${supabaseProfiles.length} profiles`)

      const inLocalOnly = localProfiles.filter(lp =>
        !supabaseProfiles.some(sp => sp.id === lp.id)
      )
      const inSupabaseOnly = supabaseProfiles.filter(sp =>
        !localProfiles.some(lp => lp.id === sp.id)
      )

      if (inLocalOnly.length > 0) {
        safeLog(`⚠️ ${inLocalOnly.length} profiles ONLY in localStorage:`, inLocalOnly.map(p => p.username))
        safeLog('💡 Run window.forceSyncToSupabase() to fix')
      }
      if (inSupabaseOnly.length > 0) {
        safeLog(`⚠️ ${inSupabaseOnly.length} profiles ONLY in Supabase:`, inSupabaseOnly.map(p => p.username))
        safeLog('💡 Run window.pullFromSupabase() to fix')
      }

      if (inLocalOnly.length === 0 && inSupabaseOnly.length === 0) {
        safeLog('✅ All profiles synced!')
      }

      // Show current user
      const userStr = localStorage.getItem('fortuna_square_user')
      if (userStr) {
        const user = JSON.parse(userStr)
        safeLog(`\n👤 Current user: ${user.username} (${user.id})`)

        const inSupabase = supabaseProfiles.some(sp => sp.id === user.id)
        if (inSupabase) {
          safeLog('✅ Current user exists in Supabase')
        } else {
          safeLog('❌ CURRENT USER NOT IN SUPABASE - THIS IS THE BUG!')
          safeLog('💡 Run window.forceSyncToSupabase() to fix')
        }
      } else {
        safeLog('\n👤 No user logged in')
      }
    }

    // Command: Test watchlist sync
    (window as any).testWatchlistSync = async () => {
      const userStr = localStorage.getItem('fortuna_square_user')
      if (!userStr) {
        safeLog('❌ No user logged in')
        return
      }

      const user = JSON.parse(userStr)
      const { ProfileService } = await import('@/lib/profile-service')

      safeLog('⭐ Fetching watchlist from Supabase...')
      const watchlist = await ProfileService.getWatchlist(user.id)

      safeLog(`📋 Watchlist (${watchlist.length} items):`)
      if (watchlist.length === 0) {
        safeLog('  (empty)')
      } else {
        watchlist.forEach(item => {
          safeLog(`  - ${item.collectionName || 'Unknown'} (Chain ${item.chainId})`)
          safeLog(`    ${item.collectionAddress}`)
        })
      }
    }

    // Command: Test follow sync
    (window as any).testFollowSync = async () => {
      const userStr = localStorage.getItem('fortuna_square_user')
      if (!userStr) {
        safeLog('❌ No user logged in')
        return
      }

      const user = JSON.parse(userStr)
      const { ProfileService } = await import('@/lib/profile-service')

      safeLog('👥 Fetching follow data from Supabase...')
      const following = await ProfileService.getFollowing(user.id)
      const followers = await ProfileService.getFollowers(user.id)
      const counts = await ProfileService.getFollowCounts(user.id)

      safeLog('═══════════════════════════════════')
      safeLog('👥 FOLLOW STATUS')
      safeLog('═══════════════════════════════════')
      safeLog(`📊 Following: ${counts.following}`)
      safeLog(`📊 Followers: ${counts.followers}`)

      if (following.length > 0) {
        safeLog('\nFollowing:', following.map(p => p.username))
      }
      if (followers.length > 0) {
        safeLog('Followers:', followers.map(p => p.username))
      }
    }

    // Command: Measure sync lag
    (window as any).measureSyncLag = async () => {
      const { ProfileService } = await import('@/lib/profile-service')

      safeLog('⏱️ Measuring sync lag...')

      const testUpdate = {
        bio: `Sync test at ${Date.now()}`
      }

      const userStr = localStorage.getItem('fortuna_square_user')
      if (!userStr) {
        safeLog('❌ No user logged in')
        return
      }

      const user = JSON.parse(userStr)

      // Update localStorage
      const t0 = performance.now()
      ProfileService.updateProfile(user.id, testUpdate)
      const t1 = performance.now()

      safeLog(`📦 localStorage update: ${(t1 - t0).toFixed(2)}ms`)

      // Update Supabase
      const t2 = performance.now()
      await ProfileService.updateProfileInDatabase(user.id, testUpdate)
      const t3 = performance.now()

      safeLog(`☁️ Supabase update: ${(t3 - t2).toFixed(2)}ms`)
      safeLog(`📊 Sync lag: ${((t3 - t2) - (t1 - t0)).toFixed(2)}ms`)
    }

  }, [])

  return null
}
