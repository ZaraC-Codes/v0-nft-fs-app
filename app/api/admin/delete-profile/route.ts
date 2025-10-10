import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('id')

    if (!profileId) {
      return NextResponse.json(
        { error: 'Profile ID is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    console.log(`🗑️ Deleting profile ${profileId}...`)

    // Delete profile_oauth_accounts first (foreign key constraint)
    const { error: oauthError, count: oauthCount } = await supabase
      .from('profile_oauth_accounts')
      .delete({ count: 'exact' })
      .eq('profile_id', profileId)

    if (oauthError) {
      console.error('❌ Error deleting OAuth accounts:', oauthError)
      return NextResponse.json(
        { error: 'Failed to delete OAuth accounts', details: oauthError },
        { status: 500 }
      )
    }

    console.log(`✅ Deleted ${oauthCount} OAuth account(s)`)

    // Delete profile_wallets (foreign key constraint)
    const { error: walletsError, count: walletsCount } = await supabase
      .from('profile_wallets')
      .delete({ count: 'exact' })
      .eq('profile_id', profileId)

    if (walletsError) {
      console.error('❌ Error deleting wallets:', walletsError)
      return NextResponse.json(
        { error: 'Failed to delete wallets', details: walletsError },
        { status: 500 }
      )
    }

    console.log(`✅ Deleted ${walletsCount} wallet(s)`)

    // Delete the profile
    const { error: profileError, data: deletedProfile } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId)
      .select()
      .single()

    if (profileError) {
      console.error('❌ Error deleting profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to delete profile', details: profileError },
        { status: 500 }
      )
    }

    console.log(`✅ Deleted profile:`, deletedProfile)

    return NextResponse.json({
      success: true,
      oauthAccountsDeleted: oauthCount,
      walletsDeleted: walletsCount,
      profile: deletedProfile,
      message: `Profile ${profileId} deleted successfully`
    })
  } catch (error) {
    console.error('❌ Error in delete-profile:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
