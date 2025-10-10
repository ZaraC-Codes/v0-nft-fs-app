import { getSupabaseClient } from '../lib/supabase'

async function checkOrphans() {
  const supabase = getSupabaseClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, created_at')
    .order('created_at', { ascending: false })

  console.log('Total profiles:', profiles?.length || 0, '\n')

  if (!profiles) return

  for (const p of profiles) {
    const { data: wallets } = await supabase
      .from('wallets')
      .select('address, type')
      .eq('profile_id', p.id)

    const { data: oauth } = await supabase
      .from('oauth_accounts')
      .select('provider')
      .eq('profile_id', p.id)

    console.log(p.username, '(', p.id.slice(0, 8), '...)')
    console.log('  Wallets:', wallets?.length || 0)
    if (wallets && wallets.length > 0) {
      wallets.forEach(w => console.log('    -', w.address.slice(0, 10), '...', w.address.slice(-4), `(${w.type})`))
    }
    console.log('  OAuth:', oauth?.length || 0)
    if (!wallets?.length && !oauth?.length) {
      console.log('  ⚠️ ORPHANED PROFILE!')
    }
    console.log('')
  }
}

checkOrphans()
