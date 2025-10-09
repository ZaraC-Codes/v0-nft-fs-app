# User Visibility Testing & Debugging - Complete Summary

## Problem Statement
Some users are not appearing on the Home page (`app/page.tsx`). We need to identify where in the data pipeline the issue occurs.

## Files Created

### 1. Debug Script
**File:** `c:\Users\zarac\v0-nft-fs-app\scripts\debug-user-visibility.ts`

**Purpose:** Comprehensive debugging of the entire data pipeline

**What it does:**
- Stage 1: Direct Supabase query (raw database count)
- Stage 2: Query with wallet joins (check for join issues)
- Stage 3: ProfileService transformation (what React receives)
- Stage 4: Data transformation analysis (detect data loss)
- Stage 5: Frontend filtering check (renderability)

**Run:** `npx tsx scripts/debug-user-visibility.ts`

**Output:** Detailed report showing counts at each stage, identifying where data is lost

### 2. Test Suite
**File:** `c:\Users\zarac\v0-nft-fs-app\scripts\test-user-visibility.ts`

**Purpose:** Automated validation of data quality

**Test suites:**
1. Database connection
2. Profile count consistency
3. Required fields present
4. Wallet associations valid
5. OAuth account linking
6. Date handling
7. Profile sorting
8. Error handling

**Run:** `npx tsx scripts/test-user-visibility.ts`

**Output:** Pass/fail for each test, exit code 0 (success) or 1 (failure)

### 3. Auto-Fix Script
**File:** `c:\Users\zarac\v0-nft-fs-app\scripts\fix-user-visibility.ts`

**Purpose:** Automatically repair common database issues

**Fixes:**
- NULL or empty usernames
- Duplicate usernames
- Profiles without wallet associations (warning only)
- Orphaned OAuth accounts
- Missing updated_at timestamps

**Run:** `npx tsx scripts/fix-user-visibility.ts`

**Output:** Summary of issues found and fixed

### 4. Testing Guide
**File:** `c:\Users\zarac\v0-nft-fs-app\docs\TESTING-USER-VISIBILITY.md`

**Purpose:** Comprehensive manual testing procedures

**Contents:**
- Stage-by-stage debugging instructions
- Common issues and solutions
- Test cases (zero users, one user, many users, etc.)
- Browser console assertions
- Performance testing
- Verification checklist
- Command reference

### 5. Quick Start Guide
**File:** `c:\Users\zarac\v0-nft-fs-app\docs\DEBUG-USER-VISIBILITY-QUICK-START.md`

**Purpose:** Fast troubleshooting for quick wins

**Contents:**
- 4-step debugging process
- Quick diagnosis chart
- Common fixes
- Decision tree
- One-liner diagnostics
- Success criteria

## Data Pipeline Overview

```
┌─────────────────────────────────────────────────────────────┐
│ SUPABASE DATABASE                                           │
│ - profiles table                                            │
│ - profile_wallets table (joined)                            │
│ - profile_oauth_accounts table                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PROFILE SERVICE (lib/profile-service.ts)                    │
│ - getAllProfilesFromDatabase() - Line 313                   │
│ - Joins wallets via Supabase query                          │
│ - Transforms to UserProfile format - Line 340               │
│ - Maps wallet metadata - Line 341-345                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ HOME PAGE COMPONENT (app/page.tsx)                          │
│ - useEffect runs on mount - Line 91                         │
│ - loadProfiles() async function - Line 92                   │
│ - setActiveUsers(profiles) - Line 95                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ REACT STATE                                                 │
│ - activeUsers: UserProfile[]                                │
│ - Updated by setActiveUsers                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ JSX RENDERING (app/page.tsx Line 459-563)                   │
│ - activeUsers.length === 0 → Show "No Testers Yet"         │
│ - activeUsers.map() → Render user cards                     │
│ - Each card needs: user.id, user.username                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ DOM / BROWSER                                               │
│ - User cards visible on page                                │
│ - Each card links to /profile/{username}                    │
└─────────────────────────────────────────────────────────────┘
```

## Where Issues Can Occur

### 1. Database Level
**Symptoms:**
- debug script shows 0 profiles in Stage 1
- No users have signed up yet

**Check:**
```bash
npx tsx scripts/debug-user-visibility.ts | grep "Stage 1"
```

**Fix:**
- Create test accounts via signup flow
- Or check Supabase dashboard for data

### 2. ProfileService Transformation
**Symptoms:**
- Stage 1 shows N profiles
- Stage 3 shows fewer profiles
- Data loss in transformation

**Check:**
```typescript
// lib/profile-service.ts line 340
const userProfiles: UserProfile[] = profiles.map((profile: any) => {
  const wallets: WalletMetadata[] = profile.profile_wallets.map(...)
  // Check if profile_wallets is null/undefined
```

**Fix:**
```typescript
const wallets: WalletMetadata[] = (profile.profile_wallets || []).map(...)
```

### 3. React State Update
**Symptoms:**
- ProfileService returns N profiles
- React state (activeUsers) is empty
- useEffect not running or throwing error

**Check:**
- Browser console for errors
- React DevTools → HomePage component → hooks → activeUsers

**Fix:**
```typescript
// Add logging to useEffect (app/page.tsx line 91)
useEffect(() => {
  console.log('🔍 useEffect triggered')
  async function loadProfiles() {
    try {
      console.log('📡 Calling ProfileService...')
      const profiles = await ProfileService.getAllProfilesFromDatabase()
      console.log('✅ Received profiles:', profiles)
      setActiveUsers(profiles)
      console.log('✅ State updated')
    } catch (error) {
      console.error('❌ Error:', error)
    }
  }
  loadProfiles()
}, [])
```

### 4. Rendering Logic
**Symptoms:**
- State has N profiles
- Page shows fewer cards
- Some profiles filtered out

**Check:**
```javascript
// Browser console
const cards = document.querySelectorAll('[href^="/profile/"]')
console.log(`Rendered ${cards.length} cards`)
```

**Fix:**
- Check for missing required fields (username, id)
- Check conditional rendering logic (line 459)
- Verify React keys are unique

## Debugging Workflow

### Quick Check (2 minutes)
```bash
# 1. Run debug script
npx tsx scripts/debug-user-visibility.ts

# 2. Look for count drops
# Database: 10 → Service: 10 → State: ? → Rendered: ?
```

### Full Diagnosis (5 minutes)
```bash
# 1. Debug
npx tsx scripts/debug-user-visibility.ts

# 2. Test
npx tsx scripts/test-user-visibility.ts

# 3. Fix
npx tsx scripts/fix-user-visibility.ts

# 4. Verify in browser
# Open http://localhost:3000
# F12 → Console → Check for errors
```

### Deep Dive (15 minutes)
1. Run debug script → Identify which stage fails
2. Run test suite → Validate data quality
3. Add console.log to code → Trace execution
4. Use React DevTools → Inspect state
5. Check Network tab → Verify no failed requests
6. Run auto-fix → Repair database issues
7. Re-test → Confirm fix works

## Test Cases Reference

### Test Case 1: Zero Users
```
Database: 0 profiles
Expected: "No Testers Yet" message
Verify: No errors in console
```

### Test Case 2: One User
```
Database: 1 profile
Expected: 1 user card
Verify: Card shows username and avatar
```

### Test Case 3: Multiple Users
```
Database: 10 profiles
Expected: 10 user cards
Verify: Sorted by join date, newest first
```

### Test Case 4: Mixed Auth Methods
```
Database: 5 profiles (2 OAuth, 2 email, 1 wallet)
Expected: All 5 display
Verify: Auth method doesn't affect display
```

### Test Case 5: Missing Fields
```
Database: 1 profile with no username
Expected: Auto-fixed by fix script
Verify: Username generated and profile shows
```

### Test Case 6: Duplicate Usernames
```
Database: 2 profiles, same username
Expected: Auto-fixed by fix script
Verify: Usernames made unique, both show
```

## Command Cheat Sheet

```bash
# Quick diagnosis
npx tsx scripts/debug-user-visibility.ts

# Run all tests
npx tsx scripts/test-user-visibility.ts

# Auto-fix issues
npx tsx scripts/fix-user-visibility.ts

# Test Supabase connection
npx tsx scripts/test-supabase.ts

# Count profiles directly
npx tsx -e "
const { getSupabaseClient } = require('./lib/supabase');
getSupabaseClient()
  .from('profiles')
  .select('*', { count: 'exact', head: true })
  .then(({ count }) => console.log('Profiles:', count));
"

# Get specific profile
npx tsx -e "
const { ProfileService } = require('./lib/profile-service');
ProfileService.getAllProfilesFromDatabase()
  .then(profiles => {
    const user = profiles.find(p => p.username === 'TARGET_USERNAME');
    console.log(JSON.stringify(user, null, 2));
  });
"
```

## Browser Console Commands

```javascript
// Count rendered users
document.querySelectorAll('[href^="/profile/"]').length

// List usernames
Array.from(document.querySelectorAll('[href^="/profile/"]'))
  .map(el => el.href.split('/profile/')[1])
  .forEach(u => console.log(u))

// Check React state (requires React DevTools)
$r.state // If component selected in DevTools

// Force re-render (if state seems stale)
location.reload()

// Hard refresh (clear cache)
// Windows/Linux: Ctrl+Shift+R
// Mac: Cmd+Shift+R
```

## Expected Results

### Debug Script
```
=================================================================
STAGE 1: Supabase Direct Query: 10 profiles
STAGE 2: Profiles with Wallet Joins: 10 profiles
STAGE 3: ProfileService.getAllProfilesFromDatabase(): 10 profiles
STAGE 4: No data loss detected
STAGE 5: All profiles have valid username and id

SUCCESS: All profiles are being fetched correctly!
=================================================================
```

### Test Suite
```
✅ PASS: Database Connection
✅ PASS: Profile Count Consistency
✅ PASS: Required Fields Present
✅ PASS: Valid Usernames
✅ PASS: Wallet Data Mapping
✅ PASS: OAuth Profile Integrity
✅ PASS: Valid Date Objects
✅ PASS: Profiles Sorted by Date

Total Tests: 8
Passed: 8
Failed: 0
Success Rate: 100.0%

✅ ALL TESTS PASSED!
```

### Browser Console
```
🔍 useEffect triggered
📡 Calling ProfileService...
✅ Received profiles: [Array(10)]
✅ State updated
```

### Home Page
```
Active Testers
10 testers on the platform - Connect and explore together!

[User Card 1]
[User Card 2]
...
[User Card 10]
```

## Success Checklist

- [ ] Debug script shows consistent counts across all stages
- [ ] Test suite passes 100%
- [ ] Auto-fix script reports no issues (or fixes applied)
- [ ] Browser console shows no errors
- [ ] useEffect logs show successful fetch
- [ ] React DevTools shows profiles in activeUsers state
- [ ] Home page displays all user cards
- [ ] Card count matches database count
- [ ] All cards are clickable and link to profiles
- [ ] Sorting is correct (newest first)

## Troubleshooting Tips

1. **Always start with debug script** - Shows exactly where issue is
2. **Check browser console FIRST** - Most issues show errors here
3. **Use React DevTools** - Verify state is updating
4. **Hard refresh matters** - Ctrl+Shift+R clears cache
5. **Test in incognito** - Eliminates extension/cache issues
6. **Check Network tab** - Verify API calls succeed
7. **Add console.log liberally** - Trace execution flow
8. **Run fix script** - Automatically repairs common issues
9. **Compare counts at each stage** - Pinpoint data loss
10. **Read the full error message** - Don't ignore stack traces

## Contact/Escalation

If after running all scripts and following all guides, issue persists:

1. Collect diagnostics:
```bash
npx tsx scripts/debug-user-visibility.ts > diagnostics.txt 2>&1
npx tsx scripts/test-user-visibility.ts >> diagnostics.txt 2>&1
```

2. Take screenshots:
- Home page (empty state)
- Browser console (errors)
- React DevTools (state)
- Network tab (requests)

3. Document:
- Expected behavior
- Actual behavior
- Steps to reproduce
- Environment (browser, OS)

4. Provide all artifacts for deeper investigation

## Related Files

- `app/page.tsx` - Home page component (lines 91-107, 459-563)
- `lib/profile-service.ts` - Data fetching (lines 313-381)
- `lib/supabase.ts` - Database connection
- `supabase/migrations/001_create_profiles_table.sql` - Schema

## Maintenance

These scripts should be run:
- **After schema changes** - Verify data integrity
- **After ProfileService changes** - Ensure no regressions
- **When users report missing profiles** - Quick diagnosis
- **Before deploying** - Validate everything works

## Notes

- All scripts use same Supabase client (consistent results)
- Test suite can be integrated into CI/CD
- Debug script safe to run in production (read-only)
- Fix script modifies data (test first in dev)
- Scripts include error handling (won't crash on issues)
