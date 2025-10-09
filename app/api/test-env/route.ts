import { NextResponse } from "next/server"

/**
 * Test API route to check if environment variables are loaded
 * GET /api/test-env
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const thirdwebClientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID

  const allPresent = Boolean(supabaseUrl && supabaseKey && thirdwebClientId)

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 ENVIRONMENT VARIABLES CHECK')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ SET' : '❌ UNDEFINED'}`)
  console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? '✅ SET' : '❌ UNDEFINED'}`)
  console.log(`NEXT_PUBLIC_THIRDWEB_CLIENT_ID: ${thirdwebClientId ? '✅ SET' : '❌ UNDEFINED'}`)
  console.log(`All Supabase env keys: ${Object.keys(process.env).filter(key => key.includes('SUPABASE')).join(', ')}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  return NextResponse.json({
    success: allPresent,
    message: allPresent
      ? '✅ All required environment variables are loaded'
      : '❌ Some environment variables are missing',
    envVars: {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'UNDEFINED',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'UNDEFINED',
      NEXT_PUBLIC_THIRDWEB_CLIENT_ID: thirdwebClientId ? `${thirdwebClientId.substring(0, 10)}...` : 'UNDEFINED',
    },
    allSupabaseEnvKeys: Object.keys(process.env).filter(key => key.includes('SUPABASE')),
    timestamp: new Date().toISOString(),
  })
}
