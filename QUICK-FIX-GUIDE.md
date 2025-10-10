# QUICK FIX GUIDE - Vercel Cache Issue

**Problem:** Production showing old code despite correct GitHub commits
**Cause:** Vercel using cached build
**Solution:** Force rebuild without cache

---

## FASTEST SOLUTION (2 minutes)

### Step 1: Go to Vercel Dashboard
https://vercel.com/dashboard

### Step 2: Find Your Project
Look for: `v0-nft-marketplace-eight`

### Step 3: Redeploy Without Cache
1. Click "Deployments" tab
2. Find latest deployment (should show commit `da74596`)
3. Click three dots (...) on the right
4. Click "Redeploy"
5. **CRITICAL:** UNCHECK "Use existing Build Cache"
6. Click "Redeploy" button

### Step 4: Wait & Verify
1. Watch build complete (~2-3 minutes)
2. Open production in **incognito mode**: https://v0-nft-marketplace-eight.vercel.app
3. Check user cards show:
   - Username (NOT wallet address)
   - "Joined [month year]" (NOT "Connected via Wallet")
   - Working Follow button (NOT alert)

---

## VERIFY THE FIX

Run this command:
```bash
npx tsx scripts/verify-deployment.ts
```

Should show all green checkmarks.

---

## IF THAT DOESN'T WORK

Try automated force rebuild:
```bash
.\scripts\force-vercel-rebuild.bat
```

Then follow Step 3 above.

---

## PREVENT FUTURE ISSUES

We've added configuration to prevent this:
- `next.config.mjs` - Unique build IDs
- `vercel.json` - Cache control headers

These files are ready to commit for long-term prevention.

---

## EMERGENCY CONTACT

If nothing works, contact Vercel support:
- Project: v0-nft-marketplace-eight
- Issue: Build cache persisting despite redeploy
- Commit: da74596

Include output from: `npx tsx scripts/verify-deployment.ts`
