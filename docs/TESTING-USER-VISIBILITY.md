# Testing Guide: User Visibility on Home Page

## Overview

This guide provides comprehensive testing procedures to diagnose why some users may not be appearing on the Home page.

## Quick Diagnosis Commands

```bash
# 1. Check Supabase database directly
npx tsx scripts/debug-user-visibility.ts

# 2. Run automated tests
npx tsx scripts/test-user-visibility.ts

# 3. Check Supabase connection
npx tsx scripts/test-supabase.ts
```

## The Data Pipeline

Understanding the flow helps identify where issues occur:

```
Supabase Database
    ↓
ProfileService.getAllProfilesFromDatabase()
    ↓
Home Page useEffect (app/page.tsx)
    ↓
setActiveUsers(profiles)
    ↓
activeUsers.map() in JSX
    ↓
Rendered User Cards
```

## Stage-by-Stage Debugging

### Stage 1: Verify Database Contents

**What to check:** How many profiles exist in Supabase?

**Command:**
```bash
npx tsx scripts/debug-user-visibility.ts
```

**Expected output:**
```
✅ Found N profiles in Supabase database
```

**If ZERO profiles:**
- Issue: No users have signed up yet
- Action: Create test accounts via signup flow

**If profiles exist but wrong count:**
- Issue: Database integrity problem
- Action: Check Supabase dashboard directly

### Stage 2: Verify ProfileService Fetching

**What to check:** Does ProfileService correctly fetch and transform data?

**Manual test in Node.js:**
```bash
node
> const { ProfileService } = require('./lib/profile-service')
> ProfileService.getAllProfilesFromDatabase().then(console.log)
```

**Expected output:**
```javascript
[
  {
    id: '...',
    username: 'testuser',
    walletAddress: '0x...',
    wallets: [...],
    // ... other fields
  },
  // ... more profiles
]
```

**If empty array:**
- Issue: ProfileService transformation problem
- Action: Check `lib/profile-service.ts` line 313-381
- Look for: Silent error swallowing, incorrect joins

**If profiles missing:**
- Issue: Filtering or mapping error
- Action: Compare with Stage 1 results
- Identify which profiles were lost

### Stage 3: Verify Frontend State

**What to check:** Is data reaching React component state?

**Browser Console (on Home page):**
```javascript
// Open DevTools Console (F12)
// Paste this code:

// Access the Home page component state
const homePageElement = document.querySelector('main, [class*="page"]')

// Check if profiles are in component state
// (Note: This requires React DevTools extension)
console.log('Check React DevTools for activeUsers state')
```

**With React DevTools:**
1. Open React DevTools tab
2. Find `HomePage` component
3. Inspect `hooks` section
4. Look for `activeUsers` state
5. Verify count matches expected

**If activeUsers is empty:**
- Issue: useEffect not running or failing
- Action: Check browser console for errors
- Check network tab for failed requests

**If activeUsers has data but not rendering:**
- Issue: Rendering logic problem
- Action: Check JSX conditions (lines 459-563)

### Stage 4: Verify Rendering Logic

**What to check:** Are all fetched users being rendered?

**Browser Console:**
```javascript
// Count rendered user cards
const userCards = document.querySelectorAll('[href^="/profile/"]')
console.log(`Rendered user cards: ${userCards.length}`)

// List rendered usernames
Array.from(userCards).forEach(card => {
  const username = card.href.split('/profile/')[1]
  console.log(`- ${username}`)
})
```

**If count is less than expected:**
- Issue: Some profiles filtered out during render
- Action: Check for:
  - Missing `user.username`
  - Missing `user.id`
  - React key conflicts
  - Conditional rendering logic

## Common Issues and Solutions

### Issue 1: No profiles in database

**Symptoms:**
- Empty Home page
- debug script shows 0 profiles

**Solution:**
```bash
# Create test profiles via signup flow
# OR manually insert via Supabase dashboard
```

### Issue 2: ProfileService returns fewer profiles than database

**Symptoms:**
- debug script shows: "Database: 10, Service: 5"
- Data loss in transformation

**Solution:**
Check `lib/profile-service.ts` around line 340:
```typescript
const userProfiles: UserProfile[] = profiles.map((profile: any) => {
  // Check for errors in this mapping
  const wallets: WalletMetadata[] = profile.profile_wallets.map((w: any) => ({
    // Ensure profile_wallets exists and is array
```

**Fix:**
```typescript
// Add null checks
const wallets: WalletMetadata[] = (profile.profile_wallets || []).map((w: any) => ({
```

### Issue 3: useEffect not triggering

**Symptoms:**
- ProfileService works in script
- But not in browser

**Solution:**
Check `app/page.tsx` line 91-107:
```typescript
useEffect(() => {
  async function loadProfiles() {
    try {
      const profiles = await ProfileService.getAllProfilesFromDatabase()
      console.log('Loaded profiles:', profiles.length) // Add this
      setActiveUsers(profiles)
    } catch (error) {
      console.error('Failed to load profiles:', error) // Check this
    }
  }
  loadProfiles()
}, []) // Check dependencies
```

**Debug:**
```typescript
// Add more logging
useEffect(() => {
  console.log('Home page mounted, loading profiles...')
  async function loadProfiles() {
    console.log('Calling ProfileService...')
    try {
      const profiles = await ProfileService.getAllProfilesFromDatabase()
      console.log('Received profiles:', profiles)
      setActiveUsers(profiles)
      console.log('State updated with', profiles.length, 'profiles')
    } catch (error) {
      console.error('Error loading profiles:', error)
    }
  }
  loadProfiles()
}, [])
```

### Issue 4: Profiles have missing required fields

**Symptoms:**
- test script shows "Missing required fields"
- Some user cards fail to render

**Solution:**
```sql
-- Find profiles with missing usernames
SELECT id, username, email, created_at
FROM profiles
WHERE username IS NULL OR username = '';

-- Fix them
UPDATE profiles
SET username = 'user_' || substring(id::text, 1, 8)
WHERE username IS NULL OR username = '';
```

### Issue 5: Supabase connection failure

**Symptoms:**
- All scripts fail with connection error
- "Failed to fetch profiles"

**Solution:**
```bash
# Test connection
npx tsx scripts/test-supabase.ts

# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Verify in .env.local
cat .env.local | grep SUPABASE
```

## Test Cases

### Test Case 1: Zero Users
**Setup:** Empty database
**Expected:** "No Testers Yet" message with signup button
**Verify:** No errors in console

### Test Case 2: One User
**Setup:** Create one profile via signup
**Expected:** One user card displays
**Verify:**
- Card shows username
- Card shows wallet address (if available)
- Card links to profile page

### Test Case 3: Multiple Users (Same Auth Method)
**Setup:** Create 5 profiles, all via Google OAuth
**Expected:** All 5 users display
**Verify:**
- All cards render
- Sorted by join date (newest first)
- No duplicates

### Test Case 4: Multiple Users (Mixed Auth Methods)
**Setup:**
- 2 Google OAuth users
- 2 Email/wallet users
- 1 Direct wallet connection
**Expected:** All 5 users display
**Verify:** Auth method doesn't affect display

### Test Case 5: Users with/without Wallets
**Setup:** Some profiles have wallets, some don't
**Expected:** All users display
**Verify:**
- Users with wallets show "green dot" indicator
- Users without wallets still render

### Test Case 6: Users with/without Avatars
**Setup:** Mix of profiles with and without avatar images
**Expected:** All users display
**Verify:**
- Avatar images load correctly
- Fallback initials work for missing avatars

### Test Case 7: Load States
**Setup:** Slow network simulation
**Expected:**
- Loading state shows (if implemented)
- Users appear after load completes
**Verify:** No "flash of empty content"

### Test Case 8: Error States
**Setup:** Supabase connection failure
**Expected:**
- Graceful error handling
- Fallback to localStorage (if available)
- Error message or empty state
**Verify:** No uncaught exceptions

## Browser Console Assertions

### Assertion 1: State Update
```javascript
// After page load
window.addEventListener('load', () => {
  setTimeout(() => {
    // Check if profiles loaded
    const profileCards = document.querySelectorAll('[href^="/profile/"]')
    console.assert(
      profileCards.length > 0,
      'No profile cards found on page!'
    )
  }, 2000)
})
```

### Assertion 2: Data Consistency
```javascript
// Count should match across sources
const renderedCount = document.querySelectorAll('[href^="/profile/"]').length
const statedCount = parseInt(
  document.querySelector('p.text-muted-foreground')?.textContent?.match(/(\d+)/)?.[0] || '0'
)

console.assert(
  renderedCount === statedCount,
  `Mismatch: Rendered ${renderedCount}, Stated ${statedCount}`
)
```

### Assertion 3: Required Fields
```javascript
// All cards should have username
const cards = document.querySelectorAll('[href^="/profile/"]')
cards.forEach((card, index) => {
  const username = card.querySelector('h3')?.textContent
  console.assert(
    username && username.length > 0,
    `Card ${index} missing username`
  )
})
```

## Performance Testing

### Test: Large User Count
**Setup:** 100+ profiles in database
**Expected:** Page loads in < 2 seconds
**Verify:**
```javascript
performance.mark('profiles-start')
// ... page loads ...
performance.mark('profiles-end')
performance.measure('profiles-load', 'profiles-start', 'profiles-end')
console.log(performance.getEntriesByName('profiles-load'))
```

### Test: Network Simulation
```bash
# Chrome DevTools → Network tab → Throttling
# Set to "Slow 3G"
# Reload page
# Verify: Loading states work correctly
```

## Verification Checklist

Before marking as "fixed", verify:

- [ ] debug script shows correct count in all stages
- [ ] test script passes all tests
- [ ] Browser console shows no errors
- [ ] All test cases pass
- [ ] Performance is acceptable
- [ ] Works on different browsers
- [ ] Works with different auth methods
- [ ] Works with edge cases (no avatar, no wallet, etc.)
- [ ] Loading states work
- [ ] Error states work

## Quick Reference

### Files to Check
- `c:\Users\zarac\v0-nft-fs-app\app\page.tsx` (lines 91-107, 459-563)
- `c:\Users\zarac\v0-nft-fs-app\lib\profile-service.ts` (lines 313-381)
- `c:\Users\zarac\v0-nft-fs-app\lib\supabase.ts`

### Key Functions
- `ProfileService.getAllProfilesFromDatabase()` - Fetches from Supabase
- `loadProfiles()` in useEffect - Triggers fetch on mount
- `setActiveUsers(profiles)` - Updates React state
- `activeUsers.map()` - Renders user cards

### Important Variables
- `activeUsers` - React state containing profiles array
- `profiles` - Database query result
- `userProfiles` - Transformed ProfileService result

### Supabase Tables
- `profiles` - Main user data
- `profile_wallets` - Linked wallets
- `profile_oauth_accounts` - OAuth connections

## Debugging Commands Reference

```bash
# Full pipeline debug
npx tsx scripts/debug-user-visibility.ts

# Automated tests
npx tsx scripts/test-user-visibility.ts

# Test Supabase connection
npx tsx scripts/test-supabase.ts

# Check specific profile
node -e "
const { ProfileService } = require('./lib/profile-service');
ProfileService.getAllProfilesFromDatabase()
  .then(profiles => {
    const user = profiles.find(p => p.username === 'TARGET_USERNAME');
    console.log(JSON.stringify(user, null, 2));
  });
"

# Count profiles in database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM profiles;"
```

## Next Steps After Diagnosis

### If backend issue found:
1. Fix ProfileService query/transformation
2. Run test script to verify
3. Test in browser

### If frontend issue found:
1. Add console.log to useEffect
2. Check React DevTools
3. Verify state updates
4. Check render conditions

### If database issue found:
1. Fix data integrity in Supabase
2. Run migrations if needed
3. Verify with debug script

### If no issue found:
1. Document expected vs actual behavior
2. Get screenshots/recordings
3. Check for caching issues (hard refresh)
4. Test in incognito mode
5. Test on different device/browser
