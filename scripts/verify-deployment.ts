/**
 * Deployment Verification Script
 *
 * This script helps diagnose caching issues by:
 * 1. Checking what code is actually deployed
 * 2. Fetching bundle hashes from production
 * 3. Comparing local build vs production
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const PRODUCTION_URL = 'https://v0-nft-marketplace-eight.vercel.app';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/ZaraC-Codes/v0-nft-fs-app/main';

async function fetchProductionHTML() {
  console.log('\n🔍 Fetching production HTML...\n');

  try {
    const response = await fetch(PRODUCTION_URL);
    const html = await response.text();

    // Extract Next.js build ID
    const buildIdMatch = html.match(/"buildId":"([^"]+)"/);
    const buildId = buildIdMatch ? buildIdMatch[1] : 'NOT FOUND';

    console.log(`📦 Production Build ID: ${buildId}`);

    // Check for specific user card patterns
    const hasOldWalletPattern = html.includes('0xB270') || html.includes('Connected via Wallet');
    const hasNewUsernamePattern = html.includes('Joined') && html.includes('calendar');

    console.log(`\n🎨 Content Analysis:`);
    console.log(`  - Old wallet address pattern: ${hasOldWalletPattern ? '❌ FOUND (BAD)' : '✅ Not found'}`);
    console.log(`  - Old "Connected via Wallet" text: ${html.includes('Connected via Wallet') ? '❌ FOUND (BAD)' : '✅ Not found'}`);
    console.log(`  - New join date pattern: ${hasNewUsernamePattern ? '✅ FOUND (GOOD)' : '❌ Not found (BAD)'}`);

    // Extract script sources to check bundle hashes
    const scriptMatches = html.matchAll(/<script[^>]*src="([^"]+)"/g);
    const scripts = Array.from(scriptMatches).map(m => m[1]);

    console.log(`\n📜 Script Bundles (${scripts.length} found):`);
    scripts.slice(0, 10).forEach(script => {
      console.log(`  - ${script}`);
    });

    return { buildId, hasOldWalletPattern, hasNewUsernamePattern, html };
  } catch (error) {
    console.error('❌ Failed to fetch production HTML:', error);
    throw error;
  }
}

async function checkGitHubSource() {
  console.log('\n🔍 Checking GitHub source code...\n');

  try {
    const response = await fetch(`${GITHUB_RAW_BASE}/app/page.tsx`);
    const code = await response.text();

    const hasOldPattern = code.includes('Connected via Wallet') || code.includes('0xB270');
    const hasNewPattern = code.includes('Joined {new Date(user.createdAt)');

    console.log(`📄 GitHub main branch:`);
    console.log(`  - Old code pattern: ${hasOldPattern ? '❌ FOUND (BAD)' : '✅ Not found'}`);
    console.log(`  - New code pattern: ${hasNewPattern ? '✅ FOUND (GOOD)' : '❌ Not found (BAD)'}`);

    return { hasOldPattern, hasNewPattern };
  } catch (error) {
    console.error('❌ Failed to fetch GitHub source:', error);
    throw error;
  }
}

async function checkLocalSource() {
  console.log('\n🔍 Checking local source code...\n');

  try {
    const localPath = join(process.cwd(), 'app', 'page.tsx');
    const code = readFileSync(localPath, 'utf-8');

    const hasOldPattern = code.includes('Connected via Wallet') || code.includes('0xB270');
    const hasNewPattern = code.includes('Joined {new Date(user.createdAt)');

    console.log(`💻 Local working directory:`);
    console.log(`  - Old code pattern: ${hasOldPattern ? '❌ FOUND (BAD)' : '✅ Not found'}`);
    console.log(`  - New code pattern: ${hasNewPattern ? '✅ FOUND (GOOD)' : '❌ Not found (BAD)'}`);

    return { hasOldPattern, hasNewPattern };
  } catch (error) {
    console.error('❌ Failed to read local source:', error);
    throw error;
  }
}

async function checkGitStatus() {
  console.log('\n🔍 Checking Git status...\n');

  try {
    const currentCommit = execSync('git rev-parse HEAD').toString().trim();
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    const remoteCommit = execSync('git rev-parse origin/main').toString().trim();

    console.log(`📌 Git Status:`);
    console.log(`  - Current branch: ${currentBranch}`);
    console.log(`  - Local commit: ${currentCommit.substring(0, 7)}`);
    console.log(`  - Remote commit: ${remoteCommit.substring(0, 7)}`);
    console.log(`  - In sync: ${currentCommit === remoteCommit ? '✅ YES' : '❌ NO'}`);

    // Get commit message
    const commitMsg = execSync('git log -1 --pretty=%B').toString().trim();
    console.log(`  - Latest commit: "${commitMsg}"`);

    return { currentCommit, remoteCommit, inSync: currentCommit === remoteCommit };
  } catch (error) {
    console.error('❌ Failed to check git status:', error);
    throw error;
  }
}

async function diagnose() {
  console.log('🚀 DEPLOYMENT VERIFICATION TOOL');
  console.log('================================\n');

  try {
    // Run all checks
    const [gitStatus, localSource, githubSource, production] = await Promise.all([
      checkGitStatus(),
      checkLocalSource(),
      checkGitHubSource(),
      fetchProductionHTML()
    ]);

    // Summary
    console.log('\n\n📊 DIAGNOSIS SUMMARY');
    console.log('====================\n');

    const allInSync =
      !localSource.hasOldPattern &&
      localSource.hasNewPattern &&
      !githubSource.hasOldPattern &&
      githubSource.hasNewPattern &&
      gitStatus.inSync;

    const productionOutdated =
      production.hasOldWalletPattern ||
      !production.hasNewUsernamePattern;

    if (allInSync && productionOutdated) {
      console.log('🎯 ROOT CAUSE IDENTIFIED:');
      console.log('   Vercel is serving CACHED/OLD build despite correct source code!\n');
      console.log('💡 RECOMMENDED ACTIONS:');
      console.log('   1. Go to Vercel dashboard → Settings → General');
      console.log('   2. Scroll to "Build & Development Settings"');
      console.log('   3. Add to "Build Command": npm run clean && npm run build');
      console.log('   4. OR manually delete deployment cache in Vercel dashboard');
      console.log('   5. Trigger new deployment (Settings → Deployments → Redeploy)');
      console.log('   6. Select "Use existing Build Cache" → UNCHECK');
      console.log('   7. Click "Redeploy"\n');
    } else if (!allInSync) {
      console.log('⚠️  CODE SYNC ISSUE:');
      console.log('   Local and GitHub are not in sync!\n');
      console.log('💡 RECOMMENDED ACTIONS:');
      console.log('   1. Verify all changes are committed: git status');
      console.log('   2. Push to GitHub: git push origin main');
      console.log('   3. Wait for Vercel auto-deployment');
    } else {
      console.log('✅ Everything appears to be in sync!');
      console.log('   If you\'re still seeing old code, try:');
      console.log('   1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)');
      console.log('   2. Clear browser cache completely');
      console.log('   3. Try incognito/private browsing mode');
      console.log('   4. Check if you\'re on a preview URL vs production URL');
    }

    console.log('\n🔗 QUICK LINKS:');
    console.log(`   Production: ${PRODUCTION_URL}`);
    console.log(`   GitHub: https://github.com/ZaraC-Codes/v0-nft-fs-app`);
    console.log(`   Vercel: https://vercel.com/dashboard`);

  } catch (error) {
    console.error('\n❌ Diagnostic failed:', error);
    process.exit(1);
  }
}

// Run diagnostics
diagnose();
