# Profile Creation Fixes - Quick Reference

**Date:** 2025-10-09
**Status:** ✅ Ready to Deploy

---

## What Was Fixed

5 critical bugs in profile creation causing duplicate profiles and invalid user IDs.

---

## Quick Actions

### 1. Run Cleanup Script (FIRST!)

```bash
npx tsx scripts/cleanup-duplicate-profile.ts
```

This deletes duplicate profile: `752dbfa0-07e4-4012-bc8f-9513981d18c8`

### 2. Run Tests

```bash
npx tsx scripts/test-profile-creation.ts
```

Verify all 4 tests pass.

### 3. Commit Changes

```bash
git add .
git commit -F COMMIT_MESSAGE.txt
```

### 4. Deploy

```bash
# Push to production
git push origin main

# Or deploy via Vercel
vercel --prod
```

---

## Files Changed

| File | Lines | Change |
|------|-------|--------|
| `lib/profile-service.ts` | 142-165 | Fix 409 Conflict handling |
| `lib/profile-service.ts` | 1015-1046 | Never return wallet ID |
| `components/auth/auth-provider.tsx` | 276-287 | Add redirect + error handling |
| `components/profile/profile-provider.tsx` | 710-715 | Fix race condition |
| `scripts/cleanup-duplicate-profile.ts` | NEW | Database cleanup |
| `scripts/test-profile-creation.ts` | NEW | Test suite |
| `docs/PROFILE_CREATION_FIXES.md` | NEW | Documentation |

---

## Expected Console Output (After Fix)

```
✅ Created profile in database: a1b2c3d4-e5f6-7890-abcd-ef1234567890
✅ Linked OAuth account: google
✅ Linked embedded wallet: 0x1234...5678
✅ User logged in: username123
✅ Auth state saved with profile ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Key Check:** Profile ID should be UUID format, NOT wallet address!

---

## Verification Checklist

- [ ] Cleanup script ran successfully
- [ ] All 4 tests pass
- [ ] Git commit created with proper message
- [ ] Changes deployed to production
- [ ] Monitor logs for 24 hours after deployment
- [ ] No new duplicate profiles created
- [ ] User signup success rate normal

---

## Troubleshooting

### Users Report Being Logged Out

**Expected Behavior:**
- Users with invalid profile IDs (wallet addresses) will be logged out
- This is intentional - forces recreation with valid UUID
- Users can simply log in again

### Duplicate Profiles Still Appearing

**Check:**
1. Cleanup script ran successfully?
2. OAuth provider/providerAccountId validation working?
3. Database constraints in place?

**Solution:**
```bash
# Re-run cleanup script
npx tsx scripts/cleanup-duplicate-profile.ts

# Check for other duplicates
# Query database for profiles with wallet address as ID
```

### Profile Creation Failing

**Check Console:**
- Look for `Failed to create profile in database` error
- Check OAuth provider and providerAccountId are valid
- Verify Supabase connection

**Solution:**
- Check Supabase credentials in .env
- Verify database tables exist
- Check network connection

---

## Rollback Plan

If critical issues:

```bash
# Revert changes
git revert [commit-hash]

# Deploy rollback
git push origin main
```

**Note:** Users with invalid IDs will still be logged out (this is good).

---

## Support

Questions? Check:
1. `docs/PROFILE_CREATION_FIXES.md` - Full documentation
2. Console logs - Look for error messages
3. Test suite - Run to verify fixes

---

**Last Updated:** 2025-10-09
**Quick Start:** Run cleanup script → Run tests → Commit → Deploy → Monitor
