/**
 * Test script to diagnose environment variable loading
 * Run: npx tsx scripts/test-env-loading.ts
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('🔍 Environment Variable Loading Test')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const envPath = path.resolve(process.cwd(), '.env.local')
console.log('1️⃣ Looking for .env.local at:', envPath)
console.log('   Exists:', fs.existsSync(envPath) ? '✅' : '❌')

if (fs.existsSync(envPath)) {
  console.log('\n2️⃣ Loading .env.local manually...')
  const result = dotenv.config({ path: envPath })

  if (result.error) {
    console.error('   ❌ Error loading:', result.error)
  } else {
    console.log('   ✅ Loaded successfully')
  }
}

console.log('\n3️⃣ Checking environment variables:')
console.log('   NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing')

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('\n4️⃣ Supabase URL value:')
  console.log('   ', process.env.NEXT_PUBLIC_SUPABASE_URL)
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
