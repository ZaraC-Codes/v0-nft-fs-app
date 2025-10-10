/**
 * Automated Verification Script for WatchlistToggle Component
 *
 * This script performs automated checks to verify:
 * 1. All WatchlistToggle imports are from the correct source
 * 2. No inline Eye icons used for watchlist functionality
 * 3. No conflicting className overrides that might break icon display
 * 4. Component usage follows expected patterns
 *
 * Run: npx tsx scripts/verify-watchlist-icons.ts
 */

import fs from 'fs'
import path from 'path'
import { glob } from 'glob'

interface VerificationResult {
  passed: boolean
  message: string
  severity: 'info' | 'warning' | 'error'
  file?: string
  line?: number
}

const results: VerificationResult[] = []

function addResult(result: VerificationResult) {
  results.push(result)
  const icon = result.severity === 'error' ? '❌' : result.severity === 'warning' ? '⚠️' : '✅'
  const fileInfo = result.file ? ` (${result.file}${result.line ? `:${result.line}` : ''})` : ''
  console.log(`${icon} ${result.message}${fileInfo}`)
}

async function verifyWatchlistToggleImports() {
  console.log('\n📋 Checking WatchlistToggle imports...\n')

  const tsxFiles = await glob('**/*.tsx', {
    cwd: process.cwd(),
    ignore: ['node_modules/**', '.next/**', 'out/**', 'build/**']
  })

  let importCount = 0
  const correctImportPath = '@/components/profile/add-to-watchlist'

  for (const file of tsxFiles) {
    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n')

    lines.forEach((line, index) => {
      if (line.includes('WatchlistToggle') && line.includes('import')) {
        importCount++

        if (line.includes(correctImportPath)) {
          addResult({
            passed: true,
            message: `Correct WatchlistToggle import`,
            severity: 'info',
            file,
            line: index + 1
          })
        } else if (line.includes('from') && line.includes('add-to-watchlist')) {
          // Relative import, check if it resolves to correct file
          addResult({
            passed: true,
            message: `Relative WatchlistToggle import (verify path manually)`,
            severity: 'warning',
            file,
            line: index + 1
          })
        } else {
          addResult({
            passed: false,
            message: `Unexpected WatchlistToggle import path`,
            severity: 'error',
            file,
            line: index + 1
          })
        }
      }
    })
  }

  console.log(`\n📊 Total WatchlistToggle imports found: ${importCount}\n`)
}

async function verifyNoInlineWatchlistIcons() {
  console.log('\n📋 Checking for inline Eye icons in watchlist contexts...\n')

  const tsxFiles = await glob('**/*.tsx', {
    cwd: process.cwd(),
    ignore: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'components/profile/add-to-watchlist.tsx']
  })

  const watchlistKeywords = ['watchlist', 'watch list', 'add to watch', 'toggle watch']
  let issuesFound = 0

  for (const file of tsxFiles) {
    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n')

    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase()

      // Check for Eye icon usage near watchlist-related code
      if (line.includes('<Eye ') && watchlistKeywords.some(keyword => lowerLine.includes(keyword))) {
        // Check if this is in a comment
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
          return // Skip comments
        }

        issuesFound++
        addResult({
          passed: false,
          message: `Potential inline Eye icon in watchlist context`,
          severity: 'warning',
          file,
          line: index + 1
        })
      }
    })
  }

  if (issuesFound === 0) {
    addResult({
      passed: true,
      message: `No inline Eye icons found in watchlist contexts`,
      severity: 'info'
    })
  }

  console.log(`\n📊 Potential issues found: ${issuesFound}\n`)
}

async function verifyClassNameOverrides() {
  console.log('\n📋 Checking className overrides on WatchlistToggle...\n')

  const tsxFiles = await glob('**/*.tsx', {
    cwd: process.cwd(),
    ignore: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'components/profile/add-to-watchlist.tsx']
  })

  const dangerousClassPatterns = [
    /h-\[[\d.]+\w+\]/,  // Custom height like h-[20px]
    /w-\[[\d.]+\w+\]/,  // Custom width like w-[20px]
    /hidden/,           // Could hide the icon
    /invisible/,        // Could hide the icon
    /opacity-0/,        // Could hide the icon
  ]

  let overrideCount = 0
  let dangerousCount = 0

  for (const file of tsxFiles) {
    const content = fs.readFileSync(file, 'utf-8')

    // Find WatchlistToggle component usage with className
    const watchlistToggleRegex = /<WatchlistToggle[^>]*className=["']([^"']*)["'][^>]*>/g
    let match

    while ((match = watchlistToggleRegex.exec(content)) !== null) {
      const className = match[1]
      overrideCount++

      const lineNumber = content.substring(0, match.index).split('\n').length

      // Check for dangerous patterns
      const hasDangerousPattern = dangerousClassPatterns.some(pattern => pattern.test(className))

      if (hasDangerousPattern) {
        dangerousCount++
        addResult({
          passed: false,
          message: `Potentially problematic className override: "${className}"`,
          severity: 'warning',
          file,
          line: lineNumber
        })
      } else {
        addResult({
          passed: true,
          message: `Safe className override: "${className}"`,
          severity: 'info',
          file,
          line: lineNumber
        })
      }
    }
  }

  console.log(`\n📊 className overrides: ${overrideCount} total, ${dangerousCount} potentially problematic\n`)
}

async function verifyComponentStructure() {
  console.log('\n📋 Verifying WatchlistToggle component structure...\n')

  const componentPath = 'components/profile/add-to-watchlist.tsx'

  if (!fs.existsSync(componentPath)) {
    addResult({
      passed: false,
      message: `WatchlistToggle component file not found`,
      severity: 'error',
      file: componentPath
    })
    return
  }

  const content = fs.readFileSync(componentPath, 'utf-8')

  // Check for required elements
  const requiredElements = [
    { pattern: /export function WatchlistToggle/, name: 'WatchlistToggle export' },
    { pattern: /from ["']lucide-react["']/, name: 'lucide-react import' },
    { pattern: /<Eye/, name: 'Eye icon usage' },
    { pattern: /aria-label=/, name: 'aria-label attribute' },
    { pattern: /aria-pressed=/, name: 'aria-pressed attribute' },
    { pattern: /className.*h-\d+.*w-\d+/, name: 'Responsive sizing' },
    { pattern: /fill-current/, name: 'Fill current for active state' },
    { pattern: /transition/, name: 'Transition animations' },
  ]

  requiredElements.forEach(({ pattern, name }) => {
    if (pattern.test(content)) {
      addResult({
        passed: true,
        message: `✓ ${name} present`,
        severity: 'info'
      })
    } else {
      addResult({
        passed: false,
        message: `✗ ${name} missing or incorrect`,
        severity: 'error',
        file: componentPath
      })
    }
  })
}

async function checkUsagePatterns() {
  console.log('\n📋 Checking WatchlistToggle usage patterns...\n')

  const cardFiles = [
    'components/nft/cards/IndividualNFTCard.tsx',
    'components/nft/cards/BundleNFTCard.tsx',
    'components/nft/cards/RentalWrapperNFTCard.tsx'
  ]

  for (const file of cardFiles) {
    if (!fs.existsSync(file)) {
      addResult({
        passed: false,
        message: `Card component file not found`,
        severity: 'warning',
        file
      })
      continue
    }

    const content = fs.readFileSync(file, 'utf-8')

    // Check for proper positioning
    if (content.includes('absolute') && content.includes('top-') && content.includes('right-')) {
      addResult({
        passed: true,
        message: `Proper absolute positioning in card`,
        severity: 'info',
        file
      })
    } else {
      addResult({
        passed: false,
        message: `Missing or incorrect positioning`,
        severity: 'warning',
        file
      })
    }

    // Check for z-index
    if (content.includes('z-50') || content.includes('z-40')) {
      addResult({
        passed: true,
        message: `Proper z-index for stacking`,
        severity: 'info',
        file
      })
    } else {
      addResult({
        passed: false,
        message: `Missing z-index, may have stacking issues`,
        severity: 'warning',
        file
      })
    }

    // Check for required props
    const requiredProps = ['contractAddress', 'tokenId', 'name', 'collection', 'chainId']
    const missingProps = requiredProps.filter(prop => !content.includes(`${prop}=`))

    if (missingProps.length === 0) {
      addResult({
        passed: true,
        message: `All required props passed`,
        severity: 'info',
        file
      })
    } else {
      addResult({
        passed: false,
        message: `Missing props: ${missingProps.join(', ')}`,
        severity: 'error',
        file
      })
    }
  }
}

async function generateReport() {
  console.log('\n' + '='.repeat(80))
  console.log('📊 VERIFICATION SUMMARY')
  console.log('='.repeat(80) + '\n')

  const errorCount = results.filter(r => r.severity === 'error' && !r.passed).length
  const warningCount = results.filter(r => r.severity === 'warning' && !r.passed).length
  const passedCount = results.filter(r => r.passed).length

  console.log(`✅ Passed:   ${passedCount}`)
  console.log(`⚠️  Warnings: ${warningCount}`)
  console.log(`❌ Errors:   ${errorCount}`)
  console.log()

  if (errorCount === 0 && warningCount === 0) {
    console.log('🎉 All automated checks passed! ✨')
    console.log('📝 Proceed with manual testing using WATCHLIST_ICON_TEST_PLAN.md')
  } else if (errorCount === 0) {
    console.log('⚠️  Some warnings detected. Review them before proceeding.')
    console.log('📝 Manual testing may still be required.')
  } else {
    console.log('❌ Critical errors detected. Fix these before proceeding to manual tests.')
  }

  console.log('\n' + '='.repeat(80) + '\n')
}

async function main() {
  console.log('🔍 WatchlistToggle Component Verification Script')
  console.log('================================================\n')
  console.log('This script verifies the WatchlistToggle component is correctly')
  console.log('implemented and used consistently across the codebase.\n')

  try {
    await verifyComponentStructure()
    await verifyWatchlistToggleImports()
    await verifyNoInlineWatchlistIcons()
    await verifyClassNameOverrides()
    await checkUsagePatterns()
    await generateReport()

    // Exit with appropriate code
    const hasErrors = results.some(r => r.severity === 'error' && !r.passed)
    process.exit(hasErrors ? 1 : 0)

  } catch (error) {
    console.error('❌ Verification failed with error:', error)
    process.exit(1)
  }
}

main()
