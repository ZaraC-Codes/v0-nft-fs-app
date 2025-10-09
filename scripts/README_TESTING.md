# Testing Scripts README

This directory contains automated test scripts for verifying data sync between localStorage and Supabase.

## Available Scripts

### 1. Profile Sync Test Suite
**File:** `test-profile-sync.ts`
**Run:** `npm run test:sync`

Tests all profile data sync patterns:
- ✅ Profile creation sync (OAuth → Supabase)
- ✅ Profile update sync (all fields)
- ✅ Wallet linking sync (embedded + external)
- ✅ Follow system sync (followers/following)
- ✅ Watchlist sync (add/remove)
- ✅ Cache consistency (localStorage vs Supabase)

**Example Output:**
```
═══════════════════════════════════════════
🧪 COMPREHENSIVE SUPABASE SYNC TEST SUITE
═══════════════════════════════════════════

🧪 Testing Profile Creation Sync...
📝 Creating profile in Supabase...
🔍 Verifying profile in Supabase...
✅ Profile created and synced successfully
🧹 Cleaned up test data

... (more tests)

═══════════════════════════════════════════
📊 TEST RESULTS SUMMARY
═══════════════════════════════════════════

✅ Profile Creation Sync: Profile created and synced successfully
✅ Profile Update Sync: Profile updates synced successfully
✅ Wallet Linking Sync: Both wallets linked successfully
✅ Follow System Sync: Follow relationship synced correctly
✅ Watchlist Sync: Watchlist item synced with metadata
✅ Cache Consistency: All 3 profiles synced between localStorage and Supabase

📈 Total: 6 | ✅ Passed: 6 | ❌ Failed: 0 | ⚠️ Warnings: 0

✅ TEST SUITE PASSED - All data syncs correctly!
```

### 2. Data Integrity Audit
**File:** `audit-data-integrity.ts`
**Run:** `npm run audit:data`

Checks for data corruption and inconsistencies:
- ❌ Profiles without wallets
- ❌ Profiles with multiple primary wallets
- ❌ Duplicate OAuth accounts
- ❌ Duplicate wallet addresses
- ❌ Duplicate usernames
- ❌ Orphaned wallet records
- ❌ Orphaned OAuth account records
- ❌ Self-follow relationships
- ❌ Invalid Ethereum addresses
- ⚠️ Profiles without OAuth accounts (legacy)
- ⚠️ localStorage vs Supabase mismatches

**Example Output:**
```
═══════════════════════════════════════════
🔍 DATA INTEGRITY AUDIT
═══════════════════════════════════════════

🔍 Auditing Profiles...
📊 Found 12 profiles in Supabase

🔍 Auditing Follow Relationships...

🔍 Auditing Watchlist...

🔍 Checking for Orphaned Data...

🔍 Comparing Supabase vs localStorage...
📊 localStorage: 12 profiles
📊 Supabase: 12 profiles

═══════════════════════════════════════════
📊 AUDIT RESULTS
═══════════════════════════════════════════

✅ No integrity issues found!

📈 Total Issues: 0 | ❌ Errors: 0 | ⚠️ Warnings: 0 | ℹ️ Info: 0

✅ Data integrity verified!
```

### 3. Run All Tests
**Run:** `npm run test:all`

Runs both test suite and integrity audit sequentially.

---

## Usage Examples

### Before Committing Code
```bash
npm run test:all
```

### After Deploying to Production
```bash
# Check production database
npm run audit:data
```

### When Debugging Sync Issues
```bash
# Run sync tests to identify which feature is broken
npm run test:sync
```

### Daily Health Check
```bash
# Add to cron job or CI/CD
npm run audit:data || send_alert
```

---

## Exit Codes

Both scripts use standard exit codes:

- **Exit 0** = Success (all tests passed)
- **Exit 1** = Failure (critical issues detected)

This allows integration with CI/CD pipelines:

```yaml
# .github/workflows/test.yml
- name: Test Data Sync
  run: npm run test:all
  # Workflow fails if exit code is 1
```

---

## Troubleshooting

### Test Failures

If tests fail, check:

1. **Supabase Connection:**
   - Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env.local`
   - Run: `npx tsx scripts/test-user-visibility.ts`

2. **Profile Service:**
   - Check `lib/profile-service.ts` for errors
   - Verify all methods call both localStorage AND Supabase

3. **Network Issues:**
   - Check internet connection
   - Verify Supabase project is not paused

### Data Integrity Issues

If audit reports errors:

1. **Duplicate Profiles:**
   - Manually inspect in Supabase dashboard
   - Delete duplicates (keep oldest)

2. **Orphaned Data:**
   - Run cleanup script (TODO: create cleanup script)
   - Or manually delete via Supabase dashboard

3. **Cache Mismatches:**
   - Run `window.pullFromSupabase()` in browser console
   - Or clear localStorage and re-login

---

## Adding New Tests

### To Add a New Test Case

Edit `test-profile-sync.ts`:

```typescript
async function testMyNewFeature() {
  console.log('\n🧪 Testing My New Feature...\n')

  try {
    // 1. Setup test data
    const testProfile = await ProfileService.createProfileInDatabase(...)

    // 2. Perform operation
    await ProfileService.myNewOperation(...)

    // 3. Verify result
    const result = await ProfileService.verifyOperation(...)

    // 4. Assert
    if (result === expected) {
      results.push({
        test: 'My New Feature',
        status: 'PASS',
        message: 'Feature works correctly'
      })
    } else {
      results.push({
        test: 'My New Feature',
        status: 'FAIL',
        message: 'Feature failed',
        details: { expected, actual: result }
      })
    }

    // 5. Cleanup
    await cleanup(testProfile)

  } catch (error) {
    results.push({
      test: 'My New Feature',
      status: 'FAIL',
      message: error.message,
      details: error
    })
  }
}

// Add to runAllTests()
async function runAllTests() {
  // ... existing tests ...
  await testMyNewFeature() // Add here
  // ... print results ...
}
```

### To Add a New Integrity Check

Edit `audit-data-integrity.ts`:

```typescript
async function auditMyNewTable() {
  console.log('\n🔍 Auditing My New Table...\n')

  const supabase = getSupabaseClient()

  // Fetch data
  const { data, error } = await supabase
    .from('my_new_table')
    .select('*')

  if (error) {
    issues.push({
      type: 'ERROR',
      category: 'My New Table',
      message: `Failed to fetch: ${error.message}`
    })
    return
  }

  // Check 1: Some validation
  data.forEach(item => {
    if (!item.required_field) {
      issues.push({
        type: 'ERROR',
        category: 'My New Table',
        message: 'Missing required field',
        affectedData: { id: item.id }
      })
    }
  })

  // Check 2: Another validation
  // ...
}

// Add to runAudit()
async function runAudit() {
  // ... existing audits ...
  await auditMyNewTable() // Add here
  // ... print results ...
}
```

---

## Related Documentation

- **`../COMPREHENSIVE_SYNC_TESTING.md`** - Complete test plan and manual procedures
- **`../TESTING_DELIVERABLE.md`** - Deliverable summary and quick start
- **`../components/debug/sync-debugger.tsx`** - Browser debugging tools

---

## Maintenance

### Weekly
- [ ] Run `npm run test:all` on staging
- [ ] Review any new warnings

### Monthly
- [ ] Run `npm run audit:data` on production
- [ ] Fix any integrity issues
- [ ] Update test cases for new features

### Quarterly
- [ ] Review test coverage
- [ ] Add tests for new features
- [ ] Refactor flaky tests
- [ ] Update documentation

---

**Last Updated:** 2025-10-09
