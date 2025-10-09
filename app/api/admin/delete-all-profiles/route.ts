import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function DELETE() {
  try {
    const supabase = getSupabaseClient()

    console.log('🗑️ Deleting all profile data...')

    // Delete profile_wallets first (foreign key constraint)
    const { error: walletsError, count: walletsCount } = await supabase
      .from('profile_wallets')
      .delete({ count: 'exact' })
      .not('wallet_address', 'is', null)

    if (walletsError) {
      console.error('❌ Error deleting wallets:', walletsError)
      return NextResponse.json(
        { error: 'Failed to delete wallets', details: walletsError },
        { status: 500 }
      )
    }

    console.log(`✅ Deleted ${walletsCount} profile_wallets`)

    // Delete all profiles
    const { error: profilesError, count: profilesCount } = await supabase
      .from('profiles')
      .delete({ count: 'exact' })
      .not('id', 'is', null)

    if (profilesError) {
      console.error('❌ Error deleting profiles:', profilesError)
      return NextResponse.json(
        { error: 'Failed to delete profiles', details: profilesError },
        { status: 500 }
      )
    }

    console.log(`✅ Deleted ${profilesCount} profiles`)

    return NextResponse.json({
      success: true,
      walletsDeleted: walletsCount,
      profilesDeleted: profilesCount,
      message: 'All profiles deleted successfully'
    })
  } catch (error) {
    console.error('❌ Error in delete-all-profiles:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
