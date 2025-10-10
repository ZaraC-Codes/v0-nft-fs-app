# Profile Creation Bug Fixes

**Date:** 2025-10-09
**Status:** ✅ Fixed
**Priority:** CRITICAL

## Summary

Fixed critical bugs in profile creation that were causing duplicate profiles and invalid user IDs (wallet addresses instead of UUIDs).

## Root Causes Identified

### Bug 1: 409 Conflict in OAuth Account Insert

**Location:** `lib/profile-service.ts:143-154`

**Problem:**
- `createProfileInDatabase` was trying to insert into `profile_oauth_accounts` even when OAuth data was incomplete (empty provider/providerAccountId)
- When OAuth account already existed, it would return 409 Conflict
- This caused entire profile creation to fail via throw

**Evidence:**
```
✅ Created profile in database: 752dbfa0-07e4-4012-bc8f-9513981d18c8
hpcwfcrytbjlbnmsmtge.supabase.co/rest/v1/profile_oauth_accounts:1 Failed: 409 Conflict
❌ Error in createProfileInDatabase
```

**Fix:**
- Only insert into `profile_oauth_accounts` if `provider` AND `providerAccountId` are non-empty
- Handle 409 Conflict gracefully (code 23505) - log warning and continue
- Only throw error for other OAuth errors

**Code Changes:**
```typescript
// Before:
const { error: oauthError } = await supabase
  .from('profile_oauth_accounts')
  .insert({ ... })

if (oauthError) {
  throw new Error(`Failed to link OAuth account: ${oauthError.message}`)
}

// After:
if (oauthData.provider && oauthData.providerAccountId) {
  const { error: oauthError } = await supabase
    .from('profile_oauth_accounts')
    .insert({ ... })

  if (oauthError) {
    if (oauthError.code === '23505') {
      console.log('⚠️ OAuth account already exists (409 Conflict) - continuing...')
    } else {
      throw new Error(`Failed to link OAuth account: ${oauthError.message}`)
    }
  }
}
```

---

### Bug 2: Returning Profile with Wallet Address as ID

**Location:** `lib/profile-service.ts:1040-1046`

**Problem:**
- When `createProfileInDatabase` failed, `createProfileFromWallet` would return localStorage profile
- localStorage profile had `id: walletAddress` (e.g., `0xB270b7D2AD432958b55822E17e6b2d05c1ab136b`)
- This invalid ID got saved to user state
- Profile provider detected non-UUID ID and cleared auth state

**Evidence:**
```
✅ Auth state saved with profile ID: 0xB270b7D2AD432958b55822E17e6b2d05c1ab136b ❌ WRONG!
❌ Invalid user ID format (not UUID). Clearing stale auth state.
```

**Fix:**
- Never return profile with wallet address as ID
- If database sync fails, throw error instead of returning localStorage profile
- Caller must handle error properly (show user-friendly message)

**Code Changes:**
```typescript
// Before:
try {
  const dbProfile = await this.createProfileInDatabase(...)
  // ... update localStorage ...
  return dbProfile
} catch (error) {
  console.error("⚠️ Failed to sync profile to database:", error)
  return profile  // ❌ This has id: walletAddress
}

// After:
try {
  const dbProfile = await this.createProfileInDatabase(...)
  // ... update localStorage ...
  return dbProfile
} catch (error) {
  console.error("❌ Failed to sync profile to database:", error)
  // ❌ CRITICAL: Never return profile with wallet address as ID
  throw new Error(`Failed to create profile in database: ${error.message}`)
}
```

---

### Bug 3: No Redirect After Signup

**Location:** `components/auth/auth-provider.tsx:276-278`

**Problem:**
- After successful profile creation, user stayed on signup modal
- No feedback to user that signup succeeded
- Confusing UX - user didn't know what to do next

**Fix:**
- Add redirect to `/profile/[username]` after successful signup
- Use `setTimeout` to ensure localStorage write completes before navigation
- Show error alert if signup fails

**Code Changes:**
```typescript
// Before:
console.log("✅ User logged in:", profile.username)
// TODO: Redirect to profile page after successful signup

// After:
console.log("✅ User logged in:", profile.username)

// Redirect to profile page after successful signup
setTimeout(() => {
  if (typeof window !== 'undefined') {
    window.location.href = `/profile/${profile.username}`
  }
}, 100)
```

---

### Bug 4: Avatar Update Race Condition

**Location:** `components/profile/profile-provider.tsx:710-714`

**Problem:**
- `userUpdated` event was dispatched immediately after localStorage write
- Event sometimes fired before localStorage write completed
- AuthProvider would read stale data from localStorage

**Fix:**
- Use `setTimeout(..., 0)` to defer event dispatch until after localStorage write
- Ensures localStorage operation completes before event fires

**Code Changes:**
```typescript
// Before:
localStorage.setItem("fortuna_square_user", JSON.stringify(updatedUser))
window.dispatchEvent(new Event("userUpdated"))  // ❌ Too fast

// After:
localStorage.setItem("fortuna_square_user", JSON.stringify(updatedUser))
setTimeout(() => {
  window.dispatchEvent(new Event("userUpdated"))  // ✅ Deferred
}, 0)
```

---

### Bug 5: Duplicate Profile in Database

**Location:** Database

**Problem:**
- Profile `752dbfa0-07e4-4012-bc8f-9513981d18c8` was created but then errored on OAuth insert
- User got logged out due to invalid ID
- Duplicate/orphaned profile left in database

**Fix:**
- Created cleanup script: `scripts/cleanup-duplicate-profile.ts`
- Deletes all associated records (OAuth accounts, wallets, profile)

**Usage:**
```bash
npx tsx scripts/cleanup-duplicate-profile.ts
```

---

## Verification Steps

### 1. Run Cleanup Script

Delete the duplicate profile from database:

```bash
npx tsx scripts/cleanup-duplicate-profile.ts
```

Expected output:
```
🧹 Starting cleanup of duplicate profile...
📋 Profile ID to delete: 752dbfa0-07e4-4012-bc8f-9513981d18c8
✅ Deleted OAuth accounts
✅ Deleted associated wallets
✅ Deleted profile
🎉 Cleanup completed successfully!
```

### 2. Run Test Suite

Verify all fixes work correctly:

```bash
npx tsx scripts/test-profile-creation.ts
```

Expected output:
```
Test 1: Create profile with valid OAuth
✅ Profile created successfully
   Is UUID: true

Test 2: Create profile with missing OAuth provider
✅ Profile created successfully (skipped OAuth insert)
   Is UUID: true

Test 3: Test duplicate OAuth account
✅ First profile created
   Note: Full duplicate test requires direct Supabase access

Test 4: Verify createProfileFromWallet returns database profile
✅ Profile created via createProfileFromWallet
   Is UUID: true
   NOT wallet address: true
✅ Profile ID is valid UUID (not wallet address)

🎉 All tests completed!
```

### 3. Manual Testing

1. **Clear browser storage:**
   ```javascript
   localStorage.clear()
   ```

2. **Connect wallet with OAuth (Google/Facebook/etc.):**
   - Click "Connect Wallet"
   - Choose email/social login method
   - Complete OAuth flow

3. **Verify console logs:**
   ```
   ✅ Created profile in database: [UUID]
   ✅ Linked OAuth account: google
   ✅ Linked embedded wallet: [address]
   ✅ User logged in: [username]
   ✅ Auth state saved with profile ID: [UUID]  ← Should be UUID, not wallet address
   ```

4. **Verify redirect:**
   - Should automatically redirect to `/profile/[username]`
   - Profile page should load correctly

5. **Verify profile in database:**
   ```sql
   SELECT id, username, email FROM profiles WHERE username = '[your_test_username]';
   -- Should return 1 row with valid UUID
   ```

---

## Files Changed

1. **lib/profile-service.ts**
   - Lines 142-165: Fix 409 Conflict handling in OAuth insert
   - Lines 1015-1046: Never return profile with wallet address as ID

2. **components/auth/auth-provider.tsx**
   - Lines 276-287: Add redirect after signup + error handling

3. **components/profile/profile-provider.tsx**
   - Lines 710-715: Fix avatar update race condition

4. **scripts/cleanup-duplicate-profile.ts** (NEW)
   - Database cleanup script for duplicate profile

5. **scripts/test-profile-creation.ts** (NEW)
   - Test suite to verify all fixes

---

## Migration Guide

### For Existing Users with Invalid Profile IDs

If users already have invalid profile IDs (wallet addresses instead of UUIDs), they will be automatically logged out on next page load due to UUID validation in `profile-provider.tsx:1178-1184`.

**User experience:**
1. User loads app
2. Profile provider detects invalid ID format
3. Clears auth state
4. User sees login screen
5. User logs in again
6. New valid profile created with UUID

**Console output:**
```
❌ Invalid user ID format (not UUID). Clearing stale auth state. 0xB270b7D2AD432958b55822E17e6b2d05c1ab136b
```

### Database Cleanup

Run the cleanup script to remove duplicate/invalid profiles:

```bash
npx tsx scripts/cleanup-duplicate-profile.ts
```

---

## Future Improvements

### Recommended Enhancements

1. **Add retry logic for database operations:**
   - Implement exponential backoff for transient failures
   - Better handling of network errors

2. **Add database transaction support:**
   - Wrap profile + OAuth + wallet inserts in transaction
   - Ensure atomic creation (all-or-nothing)

3. **Improve error messages:**
   - Show user-friendly error dialogs instead of alerts
   - Add specific error codes for better debugging

4. **Add profile creation monitoring:**
   - Log all profile creation attempts to analytics
   - Track success/failure rates
   - Alert on high failure rates

5. **Add database migration for existing invalid profiles:**
   - Script to find all profiles with wallet address IDs
   - Migrate them to proper UUIDs
   - Update all related records

---

## Testing Checklist

- [x] Fix 1: 409 Conflict handled gracefully
- [x] Fix 2: Never return profile with wallet ID
- [x] Fix 3: Redirect after signup works
- [x] Fix 4: Avatar update race condition fixed
- [x] Fix 5: Cleanup script removes duplicate profile
- [x] Test suite passes all tests
- [x] Manual testing completed
- [ ] Run cleanup script in production
- [ ] Monitor error rates after deployment

---

## Deployment Notes

### Pre-deployment

1. Backup production database
2. Run cleanup script to remove duplicates
3. Verify test suite passes

### Post-deployment

1. Monitor error logs for profile creation failures
2. Check user signup success rate
3. Verify no new duplicate profiles created
4. Monitor user complaints about login issues

### Rollback Plan

If issues occur:

1. Revert code changes via git:
   ```bash
   git revert [commit-hash]
   ```

2. Users with invalid IDs will still be logged out (this is good - forces recreation)

3. No data loss - all valid profiles preserved

---

## Support

For issues or questions:

- Check console logs for error messages
- Run test suite to verify fixes
- Review this document for troubleshooting steps
- Contact development team with error details

---

**Last Updated:** 2025-10-09
**Author:** Project Manager (Claude Agent)
**Status:** ✅ Ready for deployment
