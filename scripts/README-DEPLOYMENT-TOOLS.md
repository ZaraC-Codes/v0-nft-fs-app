# Deployment Diagnostic & Fix Tools

This directory contains tools to diagnose and fix Vercel deployment caching issues.

## Tools Created

### 1. verify-deployment.ts
**Purpose:** Diagnose deployment caching issues

**Usage:**
```bash
npx tsx scripts/verify-deployment.ts
```

**What it does:**
- Fetches production HTML from Vercel
- Compares against local and GitHub source code
- Checks for old code patterns (wallet address, "Connected via Wallet")
- Checks for new code patterns (join date, calendar icon)
- Extracts JavaScript bundle hashes
- Verifies git sync status

**Output:**
- Green checkmarks = Everything correct
- Red X marks = Issues found
- Specific recommendations for fixes

---

### 2. force-vercel-rebuild.bat
**Purpose:** Force Vercel to rebuild without cache (Windows)

**Usage:**
```bash
.\scripts\force-vercel-rebuild.bat
```

**What it does:**
1. Clears local `.next` cache folder
2. Clears `node_modules/.cache` folder
3. Creates cache-busting commit with timestamp
4. Pushes to GitHub (triggers Vercel deployment)
5. Provides next steps for manual redeploy

**When to use:**
- After code changes aren't showing on production
- When Vercel keeps using cached builds
- As part of deployment troubleshooting

---

## Quick Reference

### Problem: Production showing old code

**1. Run diagnostic:**
```bash
npx tsx scripts/verify-deployment.ts
```

**2. If shows cache issue:**
```bash
# Option A: Manual (recommended)
# Go to Vercel dashboard → Redeploy → UNCHECK cache → Deploy

# Option B: Automated
.\scripts\force-vercel-rebuild.bat
```

**3. Verify fix:**
```bash
npx tsx scripts/verify-deployment.ts
```

---

## Understanding the Output

### verify-deployment.ts Output Explained

```
📌 Git Status:
  - Current commit: da74596 ✅ (your latest commit)
  - In sync: ✅ YES (local matches GitHub)

💻 Local working directory:
  - Old code pattern: ✅ Not found (good)
  - New code pattern: ✅ FOUND (good)

📄 GitHub main branch:
  - Old code pattern: ✅ Not found (good)
  - New code pattern: ✅ FOUND (good)

📦 Production Build ID: ef7cf1a (changes with each build)

🎨 Content Analysis:
  - Old wallet address pattern: ❌ FOUND (bad - means cache issue)
  - New join date pattern: ✅ FOUND (good)
```

**If you see:**
- All green in local/GitHub but red in production = **CACHE ISSUE**
- Red in local/GitHub = **CODE NOT COMMITTED**
- All green everywhere = **BROWSER CACHE** (hard refresh)

---

## Files Modified

The deployment fix also modified these config files:

### next.config.mjs
Added:
```javascript
generateBuildId: async () => {
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA || 'local';
  return `${commitSha.substring(0, 7)}-${Date.now()}`;
}
```
**Purpose:** Ensures every build has a unique ID (prevents cache reuse)

### vercel.json
Added:
```json
{
  "buildCommand": "npm run clean && npm run build",
  "headers": [...]
}
```
**Purpose:**
- Clears cache before each build
- Sets proper cache control headers

---

## Troubleshooting

### verify-deployment.ts fails to run
```bash
# Make sure tsx is installed
npm install -D tsx

# Or use npx
npx tsx scripts/verify-deployment.ts
```

### force-vercel-rebuild.bat fails
**Error: `.next` folder not found**
- This is OK - script continues

**Error: Git push fails**
- Check you're logged into GitHub
- Verify remote: `git remote -v`
- Try manual push: `git push origin main`

### Still seeing old code after redeploy
1. Check you're on production URL (not preview)
2. Try incognito mode (bypasses browser cache)
3. Check Vercel build logs for errors
4. Run verification script again
5. Contact Vercel support if persists

---

## Prevention Best Practices

1. **Always test in preview first**
   - Create feature branch
   - Let Vercel auto-deploy preview
   - Verify changes work
   - Merge to main

2. **Use deployment checks**
   - Run `verify-deployment.ts` after each deploy
   - Add to CI/CD pipeline

3. **Monitor build logs**
   - Check Vercel dashboard after each deployment
   - Look for "Building without cache" message
   - Verify build completes successfully

4. **Enable notifications**
   - Vercel Settings → Notifications
   - Enable deployment status emails
   - Get immediate feedback on builds

---

## Additional Resources

- [DEPLOYMENT-CACHE-FIX.md](../DEPLOYMENT-CACHE-FIX.md) - Full expert analysis
- [QUICK-FIX-GUIDE.md](../QUICK-FIX-GUIDE.md) - 2-minute fix steps
- [Vercel Deployment Docs](https://vercel.com/docs/deployments/overview)
- [Next.js Build Configuration](https://nextjs.org/docs/app/api-reference/next-config-js)

---

**Created:** 2025-10-09
**Issue:** Vercel serving cached builds despite correct source code
**Status:** RESOLVED with configuration changes + manual redeploy process
