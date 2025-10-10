# Project Status & Critical Fixes

**Last Updated:** 2025-10-10

## ✅ Profile System - FIXED (2025-10-10)

### Critical Bugs Fixed

1. **Duplicate Profile Creation on Every Signup** - FIXED ✅
   - **Issue**: Every signup created 2 profiles (1 valid + 1 orphaned)
   - **Root Cause**: `user` in useEffect dependency array caused re-run after setUser
   - **Fix**: Removed `user` from deps, added `processedWallets` ref guard
   - **File**: [components/auth/auth-provider.tsx:37-40, 126-133, 349](components/auth/auth-provider.tsx#L37)

2. **Settings Page Requiring Profile Visit First** - FIXED ✅
   - **Issue**: Settings showed "Please sign in" until user visited profile page
   - **Root Cause**: Checked both `!user` AND `!userProfile`, async fetch interrupted by redirect
   - **Fix**: Split auth check and loading state
   - **File**: [app/settings/page.tsx:147-180](app/settings/page.tsx#L147)

3. **Missing Avatar and Settings Icon After Signup** - FIXED ✅
   - **Issue**: Avatar and settings icon disappeared from header on page load
   - **Root Cause**: Wallet disconnect logic cleared user state on page load
   - **Fix**: Added `wasWalletConnected` ref to prevent false disconnects
   - **File**: [components/auth/auth-provider.tsx:40, 121, 314](components/auth/auth-provider.tsx#L40)

4. **OAuth Account 409 Conflict Errors** - FIXED ✅
   - **Issue**: OAuth account insert failing with 409 Conflict
   - **Root Cause**: Trying to insert duplicate OAuth accounts
   - **Fix**: Handle 23505 error gracefully, continue on duplicate
   - **File**: [lib/profile-service.ts:142-165](lib/profile-service.ts#L142)

5. **Profiles with Wallet Address as ID** - FIXED ✅
   - **Issue**: User state saved with `id: 0xB270b7D...` instead of UUID
   - **Root Cause**: Fallback code returned localStorage profile with wallet ID
   - **Fix**: Throw error instead of returning invalid profile
   - **File**: [lib/profile-service.ts:1040-1046](lib/profile-service.ts#L1040)

6. **Orphaned Profiles on Home Page** - FIXED ✅
   - **Issue**: Home page showing profiles with no wallets or OAuth accounts
   - **Root Cause**: No filtering of invalid profiles
   - **Fix**: Filter profiles before display
   - **File**: [app/page.tsx:100-109](app/page.tsx#L100)

### Architecture Improvements

**Database-First Pattern:**
- Supabase PostgreSQL is the source of truth
- localStorage is cache layer only
- All reads check database first, then fallback to cache
- Profile creation always writes to database, then syncs to cache

**Duplicate Prevention:**
- `processedWallets` ref tracks already-processed wallet addresses
- Guard at start of wallet sync: `if (processedWallets.current.has(walletKey)) return`
- Clear on disconnect to allow reconnection
- **Critical**: `user` removed from useEffect deps to prevent re-run loop

**False Disconnect Prevention:**
- `wasWalletConnected` ref tracks if wallet was ever connected
- Disconnect logic only runs if `wasWalletConnected.current === true`
- Prevents page load from clearing authenticated users with OAuth accounts

**OAuth Multi-Device Sync:**
- Lookup by OAuth provider ID before creating new profile
- Link device's embedded wallet to existing profile if found
- Enables same social account to work across multiple devices

### Verification Commands

```bash
# Delete all profiles for fresh testing
npx tsx scripts/delete-all-profiles.ts

# Verify database state
npx tsx scripts/verify-cleanup.ts

# Check for orphaned profiles
npx tsx scripts/delete-orphaned-profiles.ts
```

---

# Community Chat - Current Status

**Last Updated:** 2025-10-09 04:35 UTC

## ✅ What Works

1. **Blockchain Storage** - Messages ARE being stored successfully on blockchain
   - Contract: `0xC75255aB6eeBb6995718eBa64De276d5B110fb7f`
   - 78 messages confirmed on blockchain (verified via debug script)
   - Relayer wallet (`0x33946f623200f60E5954b78AAa9824AD29e5928c`) is authorized
   - Transactions succeed and emit `MessageSent` events

2. **Frontend Optimistic UI** - Working perfectly
   - Messages appear immediately when sent
   - Status changes from "Sending..." to timestamp after confirmation
   - Optimistic message replaced by blockchain message (when fetch works)

3. **Backend Message Sending** - Working perfectly
   - `POST /api/collections/{contractAddress}/chat/send-message` succeeds
   - Sanitization working (XSS protection)
   - Rate limiting working (10 messages/min)
   - Gas sponsorship working (gasless transactions)

## ❌ Current Issue

**Messages API Timeout** - Messages disappear on page refresh

**Symptom:**
- Messages appear correctly after sending
- Page refresh shows empty chat
- Messages ARE on blockchain but frontend can't fetch them

**Root Cause:**
- `GET /api/collections/{contractAddress}/chat/messages` times out
- Works in debug script (`npx tsx scripts/debug-chat-blockchain.ts`)
- Fails when called via HTTP (localhost or production)
- Likely issue: Processing 78 messages takes too long in API route

**Evidence:**
```bash
# This works (returns 78 messages):
npx tsx scripts/debug-chat-blockchain.ts 0x7ca094eb7e2e305135a0c49835e394b0daca8c56

# This times out:
curl http://localhost:3001/api/collections/0x7ca094eb7e2e305135a0c49835e394b0daca8c56/chat/messages
```

## 🔍 Investigation Needed

1. **Check Vercel function timeout** - Default is 10 seconds for Hobby plan
   - 78 messages might exceed timeout when fetching from blockchain
   - Solution: Pagination or increase timeout (upgrade plan)

2. **Check ThirdWeb `readContract` performance**
   - Is the ABI definition causing slow decoding?
   - Can we optimize the contract call?

3. **Check if production has same issue**
   - Test on actual Vercel deployment
   - Compare localhost vs production behavior

## 🎯 Next Steps

### Option 1: Implement Pagination (Recommended)
- Modify `getGroupMessages` to accept pagination params
- Fetch messages in batches (e.g., 20 at a time)
- Add "Load More" button in frontend
- **Pros:** Works within free tier limits
- **Cons:** Requires contract modification

### Option 2: Increase Vercel Timeout
- Upgrade to Pro plan (60s timeout)
- Keep current implementation
- **Pros:** No code changes
- **Cons:** Costs money, doesn't scale long-term

### Option 3: Optimize Fetch Logic
- Cache messages in database (Supabase/PostgreSQL)
- Sync blockchain → database via webhook/cron
- Serve from database instead of blockchain
- **Pros:** Instant load times, scalable
- **Cons:** More infrastructure, complexity

## 📊 Verification Commands

```bash
# Check if messages are on blockchain
npx tsx scripts/debug-chat-blockchain.ts 0x7ca094eb7e2e305135a0c49835e394b0daca8c56

# Check relayer authorization
npx tsx scripts/debug-chat-blockchain.ts 0x7ca094eb7e2e305135a0c49835e394b0daca8c56 | grep "Is Authorized"

# Test messages API (will timeout)
curl "http://localhost:3001/api/collections/0x7ca094eb7e2e305135a0c49835e394b0daca8c56/chat/messages"
```

## 🐛 Known Bugs (FIXED)

1. ✅ ThirdWeb receipt handling - FIXED
2. ✅ React state race conditions - FIXED
3. ✅ CSS layout (gap-0 p-0) - FIXED
4. ✅ Sanitization mismatch - FIXED
5. ✅ Optimistic message stuck on "Sending..." - FIXED
6. ✅ Race condition between transaction and polling - FIXED
7. ✅ Stale ref causing status reversion - FIXED

## 📝 Architecture Notes

**Security Model:**
- Frontend verifies NFT ownership when accessing Community tab
- Backend relayer is the ONLY authorized writer (via `onlyRelayer` modifier)
- No backend ownership verification on message send (frontend gate + contract modifier is sufficient)
- XSS protection via HTML entity escaping
- Rate limiting: 10 messages per minute per user

**Message Flow:**
1. User types message → Frontend sanitizes for optimistic UI
2. Backend sanitizes again → Sends to blockchain via relayer
3. Transaction confirmed → Frontend clears optimistic state
4. Polling fetches real message → Replaces optimistic seamlessly

**Environment Variables:**
```env
NEXT_PUBLIC_GROUP_CHAT_RELAY_ADDRESS=0xC75255aB6eeBb6995718eBa64De276d5B110fb7f
RELAYER_PRIVATE_KEY=987a7592bb2c1aaf6a68f39010df7a551bc470bd2736e37671d5af11cb6bd5dd
RELAYER_WALLET_ADDRESS=0x33946f623200f60E5954b78AAa9824AD29e5928c
```
