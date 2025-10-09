# Quick Start: Debugging User Visibility

**Problem:** Some users are not appearing on the Home page.

**Goal:** Identify exactly where in the pipeline the issue occurs.

## Step 1: Run the Debug Script (2 minutes)

```bash
npx tsx scripts/debug-user-visibility.ts
```

**What it does:**
- Checks Supabase database directly
- Tests ProfileService data fetching
- Identifies data transformation issues
- Compares results at each stage

**Read the output:** Look for any stage where the count drops or errors occur.

## Step 2: Run the Test Suite (1 minute)

```bash
npx tsx scripts/test-user-visibility.ts
```

**What it does:**
- Validates database connection
- Checks data integrity
- Tests required fields
- Verifies wallet associations

**Pass/Fail:** If any test fails, focus on fixing that issue first.

## Step 3: Auto-Fix Common Issues (1 minute)

```bash
npx tsx scripts/fix-user-visibility.ts
```

**What it fixes:**
- NULL or empty usernames
- Duplicate usernames
- Orphaned OAuth accounts
- Missing timestamps

**After running:** Check if issue is resolved.

## Step 4: Check Browser Console (30 seconds)

1. Open Home page: `http://localhost:3000`
2. Open DevTools: Press `F12`
3. Go to Console tab
4. Look for errors (red text)

**Paste this in console:**
```javascript
// Count rendered users
const userCards = document.querySelectorAll('[href^="/profile/"]')
console.log(`Rendered ${userCards.length} user cards`)

// List usernames
Array.from(userCards).forEach(card => {
  const username = card.href.split('/profile/')[1]
  console.log(`- ${username}`)
})
```

**Compare:** Does count match expected?

## Quick Diagnosis Chart

```
Database has N profiles
         ↓
ProfileService returns M profiles
         ↓
React state has K profiles
         ↓
Page renders L user cards

N = M = K = L  → ✅ NO ISSUE (check browser cache, hard refresh)
N > M          → ❌ ProfileService transformation bug
M > K          → ❌ React state not updating (check useEffect)
K > L          → ❌ Rendering logic filtering users (check JSX)
N = 0          → ℹ️  No users in database yet
```

## Common Fixes

### If debug script shows data loss:
```bash
# Check ProfileService for errors
code c:\Users\zarac\v0-nft-fs-app\lib\profile-service.ts +313
```

### If test suite fails on "Required Fields":
```bash
# Run auto-fix
npx tsx scripts/fix-user-visibility.ts
```

### If browser console shows errors:
```bash
# Add logging to Home page
code c:\Users\zarac\v0-nft-fs-app\app\page.tsx +91
```

### If React DevTools shows empty state:
```typescript
// Add to useEffect (line 91 in app/page.tsx)
useEffect(() => {
  console.log('🔍 Loading profiles...')
  async function loadProfiles() {
    try {
      const profiles = await ProfileService.getAllProfilesFromDatabase()
      console.log('✅ Loaded', profiles.length, 'profiles:', profiles)
      setActiveUsers(profiles)
    } catch (error) {
      console.error('❌ Error loading profiles:', error)
    }
  }
  loadProfiles()
}, [])
```

## Decision Tree

**START HERE:**

1. Run debug script → Shows count at each stage

   **All stages show 0?**
   → No users in database yet
   → Create test accounts

   **Stages 1 and 2 show N, Stage 3 shows less?**
   → ProfileService data loss
   → Check `lib/profile-service.ts` line 313-381

   **All stages show N, but page empty?**
   → React rendering issue
   → Check browser console for errors
   → Check React DevTools for state

2. Run test suite → Validates data quality

   **Tests fail?**
   → Run auto-fix script
   → Re-run test suite

   **Tests pass?**
   → Issue is in frontend, not backend
   → Add console.log to useEffect

3. Check browser console → Shows client-side errors

   **Errors present?**
   → Fix the errors
   → Reload page

   **No errors but still empty?**
   → Check React DevTools
   → Verify activeUsers state has data

4. Compare counts → Find where data is lost

   **Database: 10, Service: 10, State: 10, Rendered: 10**
   → No issue! (Try hard refresh Ctrl+Shift+R)

   **Database: 10, Service: 5**
   → ProfileService bug

   **Service: 10, State: 0**
   → useEffect not running or error thrown

   **State: 10, Rendered: 5**
   → Rendering logic filtering users

## Files You May Need to Edit

### Backend Issues:
- `c:\Users\zarac\v0-nft-fs-app\lib\profile-service.ts` - Lines 313-381
- `c:\Users\zarac\v0-nft-fs-app\lib\supabase.ts` - Connection config

### Frontend Issues:
- `c:\Users\zarac\v0-nft-fs-app\app\page.tsx` - Lines 91-107 (useEffect), 459-563 (rendering)

### Database Issues:
- Supabase dashboard → Tables → profiles
- Check for NULL usernames, orphaned records

## One-Liner Diagnostics

```bash
# Count profiles in database
npx tsx scripts/debug-user-visibility.ts | grep "Found.*profiles in Supabase"

# Count what ProfileService returns
npx tsx scripts/debug-user-visibility.ts | grep "ProfileService returned"

# Quick test
npx tsx scripts/test-user-visibility.ts | tail -n 5

# Auto-fix and report
npx tsx scripts/fix-user-visibility.ts | grep "Fixed"
```

## If Nothing Works

1. **Hard refresh browser:** Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. **Clear browser cache:** DevTools → Application → Clear storage
3. **Try incognito mode:** Eliminates caching issues
4. **Restart dev server:** Ctrl+C then `npm run dev`
5. **Check different browser:** Rule out browser-specific bugs

## Still Stuck?

Create a detailed bug report with:

```bash
# Run all diagnostics and save output
npx tsx scripts/debug-user-visibility.ts > debug-output.txt
npx tsx scripts/test-user-visibility.ts >> debug-output.txt

# Attach to issue along with:
# - Browser console screenshot
# - Network tab screenshot (F12 → Network)
# - React DevTools state screenshot
```

## Success Criteria

You've fixed the issue when:

- [ ] Debug script shows same count at all stages
- [ ] Test suite passes all tests
- [ ] Browser console shows no errors
- [ ] React DevTools shows profiles in activeUsers state
- [ ] Home page displays all expected user cards
- [ ] Count in header matches rendered cards

## Quick Win Script

Run all steps at once:

```bash
#!/bin/bash
echo "Step 1: Debug"
npx tsx scripts/debug-user-visibility.ts

echo -e "\nStep 2: Test"
npx tsx scripts/test-user-visibility.ts

echo -e "\nStep 3: Fix"
npx tsx scripts/fix-user-visibility.ts

echo -e "\nStep 4: Re-test"
npx tsx scripts/test-user-visibility.ts

echo -e "\nDone! Check Home page in browser."
```

Save as `debug-all.sh` and run: `bash debug-all.sh`

Or for Windows (PowerShell):

```powershell
Write-Host "Step 1: Debug"
npx tsx scripts/debug-user-visibility.ts

Write-Host "`nStep 2: Test"
npx tsx scripts/test-user-visibility.ts

Write-Host "`nStep 3: Fix"
npx tsx scripts/fix-user-visibility.ts

Write-Host "`nStep 4: Re-test"
npx tsx scripts/test-user-visibility.ts

Write-Host "`nDone! Check Home page in browser."
```

Save as `debug-all.ps1` and run: `.\debug-all.ps1`
