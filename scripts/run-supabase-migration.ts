import * as dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'

dotenv.config({ path: '.env.local' })

import { getSupabaseClient } from '../lib/supabase'

async function runMigration() {
  console.log('🚀 Running Supabase profile migration...')

  const supabase = getSupabaseClient()

  // Read the migration SQL file
  const migrationPath = join(__dirname, '../supabase/migrations/001_create_profiles_table.sql')
  const migrationSQL = readFileSync(migrationPath, 'utf-8')

  // Split by semicolons and execute each statement
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  console.log(`📝 Executing ${statements.length} SQL statements...`)

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    console.log(`\n[${i + 1}/${statements.length}] Executing statement...`)
    console.log(statement.substring(0, 100) + '...')

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement })

      if (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error)

        // Try alternative method using raw query
        console.log('Trying alternative method...')
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: statement })
        })

        if (!response.ok) {
          console.error(`❌ Alternative method also failed`)
          console.error('Statement:', statement)
          console.error('You may need to run this SQL manually in Supabase SQL Editor')
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully (alternative method)`)
        }
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`)
      }
    } catch (err) {
      console.error(`❌ Exception executing statement ${i + 1}:`, err)
      console.error('Statement:', statement)
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Migration complete!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\nPlease verify the tables were created:')
  console.log('1. Go to Supabase Dashboard → SQL Editor')
  console.log('2. Run: SELECT * FROM profiles;')
  console.log('3. Run: SELECT * FROM profile_wallets;')
  console.log('\nIf tables do not exist, copy the SQL from:')
  console.log('supabase/migrations/001_create_profiles_table.sql')
  console.log('And paste it into the Supabase SQL Editor manually.')
}

runMigration().catch(console.error)
