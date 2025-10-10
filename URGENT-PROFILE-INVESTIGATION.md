# 🚨 URGENT: PROFILE DATA INCONSISTENCY INVESTIGATION

**Generated:** 2025-10-09
**Priority:** CRITICAL
**Status:** INVESTIGATION IN PROGRESS

---

## 📋 USER REPORT

### What User Sees

**Screenshot 1 - Home Page:**
- Shows "2 testers on the platform"
- Card 1: Username "Collector4397", Avatar "C", Bio starts with "Welcome to Fortuna Square! NFT enthusiast..."
- Card 2: Username "0xB270...136b", Avatar "0", Bio "Connected via Wallet 🚀"
- **Neither card has a visible avatar image**
- **User claims they are the ONLY user on the app**

**Screenshot 2 - User Profile Page:**
- Username: "Z33Fi" (verified with green checkmark)
- Avatar: Blue circle with pixel art character (Mario-like)
- Bio: "Welcome to Fortuna Square!"
- Wallet: "0xB270...136b"
- **This is the user's actual profile**

### Critical Problems

1. **Profile Mismatch:** Home page shows 2 profiles, but neither matches the user's actual profile ("Z33Fi")
2. **Duplicate/Ghost Profiles:** "Collector4397" and "0xB270...136b" appear, but user is alone
3. **Non-Clickable Cards:** User reports cards don't link to profile pages (despite Link wrappers)
4. **Missing Avatars:** User has custom avatar on profile page, but home page shows generic letters

---

## 🔍 ROOT CAUSE ANALYSIS

### Hypothesis 1: Multiple Profile Creation Bug ✅ MOST LIKELY

**Evidence:**
- `auth-provider.tsx` lines 162-265: Auto-creates profiles for embedded wallets
- `ProfileService.generateUsernameFromWallet()` line 494: Generates "Collector####" usernames
- User might have triggered profile creation multiple times

**How it happens:**
1. User signs up with Google/social → Creates profile in Supabase with generated username "Collector4397"
2. User later customizes username to "Z33Fi" in Settings
3. BUT localStorage cache still has old "Collector4397" profile
4. Home page shows BOTH profiles (stale cache + database)

**Verification:**
```typescript
// In auth-provider.tsx line 229
profile = await ProfileService.createProfileInDatabase(
  username,  // Generated as "Collector####"
  { provider: oauthData.provider, ... },
  account.address
)
```

### Hypothesis 2: localStorage Stale Data ✅ CONTRIBUTING FACTOR

**Evidence:**
- Home page line 95: `const profiles = await ProfileService.getAllProfilesFromDatabase()`
- Lines 99-104: Fallback to localStorage if database fails
- Real-time subscription (lines 111-132) might not be clearing stale cache

**Issue:** If database query fails (timeout, network), falls back to localStorage which contains old data

### Hypothesis 3: Profile Not Synced to Database ⚠️ POSSIBLE

**Evidence:**
- User's "Z33Fi" profile might only exist in localStorage
- If Supabase sync failed during username change, database has "Collector4397" but localStorage has "Z33Fi"

---

## 🔬 INVESTIGATION STEPS

### Step 1: Run Database Investigation Script

```bash
npx tsx scripts/investigate-profile-data.ts
```

**What it does:**
- Queries all profiles in Supabase
- Checks for duplicates (by wallet, email, OAuth account)
- Compares Supabase vs `getAllProfilesFromDatabase()` results
- Identifies where "Collector4397" and "Z33Fi" exist

**Expected output:**
- If "Z33Fi" is in database: Username change worked, localStorage cache issue
- If "Collector4397" is in database but not "Z33Fi": Sync failed
- If BOTH are in database: Duplicate profile bug

### Step 2: Inspect localStorage in Browser

Open the app in browser, then:

**Option A: Use our HTML Inspector**
```bash
# Open this file in browser
start scripts/check-localStorage-browser.html
```

**Option B: Browser Console**
```javascript
// Check current user
const user = localStorage.getItem('fortuna_square_user')
console.log('Current user:', JSON.parse(user))

// Check cached profiles
const profiles = localStorage.getItem('fortuna_square_profiles')
console.log('Cached profiles:', JSON.parse(profiles))
```

**What to check:**
- How many profiles are in `fortuna_square_profiles`?
- Do any match "Collector4397"?
- Do any match "Z33Fi"?
- Do any match "0xB270...136b"?

### Step 3: Run Supabase Queries Directly

**Query 1: Find all profiles**
```sql
SELECT
  p.id,
  p.username,
  p.email,
  p.avatar,
  p.bio,
  p.created_at,
  p.updated_at,
  json_agg(pw.*) as wallets,
  json_agg(poa.*) as oauth_accounts
FROM profiles p
LEFT JOIN profile_wallets pw ON pw.profile_id = p.id
LEFT JOIN profile_oauth_accounts poa ON poa.profile_id = p.id
GROUP BY p.id
ORDER BY p.created_at DESC;
```

**Query 2: Find profiles with wallet 0xB270...136b**
```sql
SELECT
  p.username,
  p.id,
  pw.wallet_address,
  pw.is_primary
FROM profiles p
INNER JOIN profile_wallets pw ON pw.profile_id = p.id
WHERE LOWER(pw.wallet_address) LIKE '%b270%136b%';
```

**Query 3: Check for username history**
```sql
-- Check if "Collector4397" was renamed to "Z33Fi"
SELECT * FROM profiles
WHERE username IN ('Collector4397', 'Z33Fi')
ORDER BY created_at;
```

---

## 🛠️ IMMEDIATE FIXES

### Fix 1: Clear Stale localStorage Cache

**For User to do NOW:**

1. Open browser DevTools (F12)
2. Go to Console tab
3. Run:
```javascript
localStorage.removeItem('fortuna_square_profiles')
console.log('✅ Cleared profiles cache')
```
4. Refresh the page
5. Check if home page now shows correct profile

**Why this works:** Forces fresh fetch from Supabase instead of using stale cache

### Fix 2: Force Profile Sync to Database

**For User to do NOW:**

1. Go to Settings page
2. Make a minor change to bio (add a period, then remove it)
3. Click "Save Changes"
4. This triggers `ProfileService.updateProfileInDatabase()` which syncs to Supabase
5. Refresh home page

### Fix 3: Delete Duplicate Profiles from Supabase

**If investigation reveals duplicate profiles:**

```sql
-- Find duplicates
SELECT
  username,
  COUNT(*) as count,
  string_agg(id::text, ', ') as profile_ids
FROM profiles
GROUP BY username
HAVING COUNT(*) > 1;

-- Delete the older one (keep most recent)
DELETE FROM profiles
WHERE id = 'OLD_PROFILE_ID_HERE'
AND username = 'Collector4397';
```

---

## 🔧 PERMANENT CODE FIXES

### Fix 1: Prevent Duplicate Profile Creation

**File:** `c:\Users\zarac\v0-nft-fs-app\components\auth\auth-provider.tsx`

**Problem:** Lines 121-144 have safeguards, but might not catch all cases

**Solution:** Add stronger duplicate check before creating profile:

```typescript
// BEFORE creating profile (line 214), add:
console.log("🔍 SAFEGUARD: Checking for existing profile in Supabase")
const { data: existingProfiles } = await supabase
  .from('profiles')
  .select('id, username')
  .eq('profile_wallets.wallet_address', account.address)
  .limit(1)

if (existingProfiles && existingProfiles.length > 0) {
  console.log("⚠️ SAFEGUARD: Found existing profile in Supabase, logging in instead")
  const existing = existingProfiles[0]
  const walletUser: User = {
    id: existing.id,
    username: existing.username,
    email: oauthData?.email || "",
    avatar: existing.avatar,
    walletAddress: account.address,
    isVerified: true,
  }
  setUser(walletUser)
  localStorage.setItem("fortuna_square_user", JSON.stringify(walletUser))
  return
}
```

### Fix 2: Clear localStorage Cache on Real-Time Update

**File:** `c:\Users\zarac\v0-nft-fs-app\app\page.tsx`

**Problem:** Real-time subscription (lines 111-132) calls `loadProfiles()` but doesn't clear cache first

**Solution:**

```typescript
// Line 123, BEFORE loadProfiles(), add:
.on('postgres_changes', ..., (payload) => {
  console.log('Profile updated, clearing cache and refreshing:', payload)
  localStorage.removeItem('fortuna_square_profiles') // ← ADD THIS
  loadProfiles()
})
```

### Fix 3: Remove localStorage Fallback (Force Database)

**File:** `c:\Users\zarac\v0-nft-fs-app\app\page.tsx`

**Problem:** Lines 99-104 fallback to localStorage hides database issues

**Solution:** Remove fallback, show error instead:

```typescript
// REPLACE lines 93-106 with:
async function loadProfiles() {
  try {
    const profiles = await ProfileService.getAllProfilesFromDatabase()
    setActiveUsers(profiles)
  } catch (error) {
    console.error('Failed to load profiles from database:', error)
    // DON'T fallback to localStorage - show error to user
    setActiveUsers([])
    // Optionally show toast notification
  }
}
```

### Fix 4: Make Cards Fully Clickable

**File:** `c:\Users\zarac\v0-nft-fs-app\app\page.tsx`

**Problem:** Lines 500-609 - Follow button might be preventing card click

**Solution:** Stop event propagation on Follow button (already done at line 565-566, verify it's working):

```typescript
// Line 564-566 should have:
onClick={async (e) => {
  e.preventDefault()     // ← Should prevent Link navigation
  e.stopPropagation()    // ← Should stop event bubbling
  // ... follow logic
}}
```

**Additional check:** Ensure Link wrapper covers entire card (line 501):

```typescript
<Link href={`/profile/${user.username}`} key={user.id} className="block w-full">
  {/* ← Add className="block w-full" */}
```

### Fix 5: Display User Avatar Correctly

**File:** `c:\Users\zarac\v0-nft-fs-app\app\page.tsx`

**Problem:** Lines 507-517 check `user.avatar` but might not get it from database

**Verification needed:** Is `avatar` field being fetched in `getAllProfilesFromDatabase()`?

**Check:** `c:\Users\zarac\v0-nft-fs-app\lib\profile-service.ts` line 380:
```typescript
avatar: profile.avatar,  // ← Should be here
```

**Solution:** If avatar is null, check if user uploaded one but it's not synced:

```typescript
// Line 507, change condition:
{user.avatar && user.avatar !== '' ? (
  <img
    src={user.avatar}
    alt={user.username}
    className="w-16 h-16 rounded-full object-cover border-2 border-primary/50"
    onError={(e) => {
      // Fallback to letter avatar if image fails to load
      e.currentTarget.style.display = 'none'
      e.currentTarget.nextElementSibling?.classList.remove('hidden')
    }}
  />
) : (
  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-white">
    {user.username[0].toUpperCase()}
  </div>
)}
```

### Fix 6: Redirect New Users to Profile Page

**File:** `c:\Users\zarac\v0-nft-fs-app\components\auth\auth-provider.tsx`

**Problem:** After signup/login, user stays on current page

**Solution:** Add redirect after profile creation (line 261):

```typescript
// Line 261, AFTER setUser(), add:
setUser(walletUser)
localStorage.setItem("fortuna_square_user", JSON.stringify(walletUser))
console.log("✅ User logged in:", profile.username)

// ← ADD THIS:
// Redirect to profile page on first login
const isFirstLogin = !localStorage.getItem(`profile_visited_${profile.id}`)
if (isFirstLogin) {
  localStorage.setItem(`profile_visited_${profile.id}`, 'true')
  window.location.href = `/profile/${profile.username}`
}
```

---

## 📊 EXPECTED RESULTS AFTER FIXES

### Database Query Results

**Expected count:** 1 profile (if user is alone)

**Profile data:**
- Username: "Z33Fi" (or "Collector4397" if rename failed)
- Wallet: 0xB270...136b
- Avatar: URL to pixel art image
- OAuth account linked

### Home Page Display

**After fix:**
- Shows 1 profile card (the user's own profile)
- Card is clickable → links to `/profile/Z33Fi`
- Avatar displays correctly (pixel art image)
- Bio shows custom text

### Profile Page Display

**Should already work:**
- Shows "Z33Fi" username
- Shows pixel art avatar
- Shows correct bio

---

## ✅ TESTING CHECKLIST

After implementing fixes, test:

- [ ] Clear localStorage completely
- [ ] Logout and login again
- [ ] Verify only 1 profile in Supabase
- [ ] Home page shows 1 profile card
- [ ] Card is clickable
- [ ] Card links to correct profile page
- [ ] Avatar displays on both home and profile pages
- [ ] Bio displays correctly
- [ ] Follow button works without blocking card click
- [ ] Real-time updates work (edit profile in Settings, see update on home page)
- [ ] New login redirects to profile page

---

## 🚨 CRITICAL QUESTIONS FOR USER

Please run these commands and report results:

### 1. Database Profile Count
```bash
npx tsx scripts/investigate-profile-data.ts
```

**Question:** How many profiles does it find? What are the usernames?

### 2. localStorage Cache Check

Open browser console and run:
```javascript
console.log('User:', JSON.parse(localStorage.getItem('fortuna_square_user')))
console.log('Profiles:', JSON.parse(localStorage.getItem('fortuna_square_profiles')))
```

**Question:** What usernames appear in the profiles array?

### 3. After Clearing Cache

Run:
```javascript
localStorage.removeItem('fortuna_square_profiles')
```
Then refresh the page.

**Question:** Does the home page now show the correct profile?

---

## 📝 NOTES FOR DEVELOPERS

### Why "Collector4397" Appears

The username is auto-generated in `profile-service.ts` line 494:
```typescript
static generateUsernameFromWallet(walletAddress: string): string {
  const randomNumber = Math.floor(Math.random() * 10000)
  const baseUsername = `Collector${randomNumber}`  // ← Here
  // ...
}
```

This happens when:
1. User signs up with social/email
2. OAuth doesn't provide a username
3. System generates "Collector####" temporarily
4. User is supposed to customize it in Settings

**The bug:** If the user customizes username, the old "Collector####" profile might still exist in:
- localStorage cache (not cleared)
- Supabase database (duplicate created instead of updated)

### Why "0xB270...136b" Appears

This looks like a wallet address being used as a username. Check if:
1. Another profile was created with the wallet address as the username
2. System fell back to using wallet address when username generation failed
3. User has 2 devices/browsers with different profiles

**Location to check:** `auth-provider.tsx` line 226:
```typescript
username = ProfileService.generateUsernameFromWallet(account.address)
```

If `generateUsernameFromWallet` fails or returns wallet address, this happens.

---

## 🔗 RELATED FILES

- `c:\Users\zarac\v0-nft-fs-app\app\page.tsx` (Home page)
- `c:\Users\zarac\v0-nft-fs-app\lib\profile-service.ts` (Profile CRUD)
- `c:\Users\zarac\v0-nft-fs-app\components\auth\auth-provider.tsx` (Auth + profile creation)
- `c:\Users\zarac\v0-nft-fs-app\app\profile\[username]\page.tsx` (Profile page)
- `c:\Users\zarac\v0-nft-fs-app\scripts\investigate-profile-data.ts` (Investigation script)
- `c:\Users\zarac\v0-nft-fs-app\scripts\check-localStorage-browser.html` (Browser inspector)

---

## 🎯 IMMEDIATE ACTION ITEMS

### For User (RIGHT NOW):

1. **Clear localStorage cache:**
   ```javascript
   localStorage.removeItem('fortuna_square_profiles')
   ```
2. **Refresh home page** - Does it show correct profile now?
3. **Run investigation script:**
   ```bash
   npx tsx scripts/investigate-profile-data.ts
   ```
4. **Report results** from script output

### For Developer (NEXT):

1. **Review investigation script output**
2. **Query Supabase directly** to see actual database state
3. **Identify which profile is correct** (Z33Fi or Collector4397)
4. **Delete duplicate profiles** from database if found
5. **Implement code fixes** listed above
6. **Test thoroughly** using checklist

---

**Last Updated:** 2025-10-09
**Status:** Awaiting investigation results from user
