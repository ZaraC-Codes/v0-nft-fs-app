import { UserProfile, WalletMetadata, WalletType } from "@/types/profile"
import { getSupabaseClient } from "./supabase"

export interface CreateProfileParams {
  id: string
  username: string
  email?: string
  walletAddress?: string
}

export interface OAuthAccountData {
  provider: string // 'google', 'facebook', 'twitter', 'discord', 'apple'
  providerAccountId: string // Unique ID from OAuth provider
  email?: string
}

/**
 * Profile Service - Handles user profile creation and management
 */
export class ProfileService {
  private static readonly STORAGE_KEY = "fortuna_square_profiles"

  // ============================================================================
  // SUPABASE METHODS (Cross-device profile sync)
  // ============================================================================

  /**
   * Get profile from Supabase by OAuth provider credentials
   * This is the PRIMARY lookup method for multi-device sync
   */
  static async getProfileByOAuthProvider(
    provider: string,
    providerAccountId: string
  ): Promise<UserProfile | null> {
    try {
      const supabase = getSupabaseClient()

      // Look up OAuth account first
      const { data: oauthAccount, error: oauthError } = await supabase
        .from('profile_oauth_accounts')
        .select('profile_id')
        .eq('provider', provider)
        .eq('provider_account_id', providerAccountId)
        .single()

      if (oauthError || !oauthAccount) {
        console.log('🔍 No existing profile found for OAuth account:', { provider, providerAccountId })
        return null
      }

      // Fetch full profile with wallets
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          profile_wallets (
            wallet_address,
            wallet_type,
            is_primary,
            added_at
          )
        `)
        .eq('id', oauthAccount.profile_id)
        .single()

      if (profileError || !profile) {
        console.error('❌ Error fetching profile:', profileError)
        return null
      }

      // Convert Supabase profile to UserProfile format
      const wallets: WalletMetadata[] = profile.profile_wallets.map((w: any) => ({
        address: w.wallet_address,
        type: w.wallet_type,
        addedAt: new Date(w.added_at)
      }))

      const primaryWallet = profile.profile_wallets.find((w: any) => w.is_primary)

      const userProfile: UserProfile = {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        avatar: profile.avatar,
        bio: profile.bio,
        bannerImage: profile.banner_image,
        twitter: profile.twitter,
        instagram: profile.instagram,
        discord: profile.discord,
        website: profile.website,
        walletAddress: primaryWallet?.wallet_address,
        wallets,
        activeWallet: primaryWallet?.wallet_address,
        linkedWallets: wallets.map(w => w.address),
        verified: profile.is_verified,
        createdAt: new Date(profile.created_at),
        updatedAt: new Date(profile.updated_at),
        followersCount: 0,
        followingCount: 0,
        isPublic: profile.is_public ?? true,
        showWalletAddress: profile.show_wallet_address ?? true,
        showEmail: profile.show_email ?? false
      }

      console.log('✅ Found existing profile via OAuth:', userProfile.username)
      return userProfile
    } catch (error) {
      console.error('❌ Error in getProfileByOAuthProvider:', error)
      return null
    }
  }

  /**
   * Create new profile in Supabase with OAuth account and wallet
   */
  static async createProfileInDatabase(
    username: string,
    oauthData: OAuthAccountData,
    embeddedWalletAddress: string
  ): Promise<UserProfile> {
    try {
      const supabase = getSupabaseClient()

      // 1. Create profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          username,
          email: oauthData.email,
          bio: `Connected via ${oauthData.provider.charAt(0).toUpperCase() + oauthData.provider.slice(1)} 🚀`,
          is_verified: true
        })
        .select()
        .single()

      if (profileError || !profile) {
        throw new Error(`Failed to create profile: ${profileError?.message}`)
      }

      console.log('✅ Created profile in database:', profile.id)

      // 2. Link OAuth account
      const { error: oauthError } = await supabase
        .from('profile_oauth_accounts')
        .insert({
          profile_id: profile.id,
          provider: oauthData.provider,
          provider_account_id: oauthData.providerAccountId,
          email: oauthData.email
        })

      if (oauthError) {
        throw new Error(`Failed to link OAuth account: ${oauthError.message}`)
      }

      console.log('✅ Linked OAuth account:', oauthData.provider)

      // 3. Link embedded wallet
      const { error: walletError } = await supabase
        .from('profile_wallets')
        .insert({
          profile_id: profile.id,
          wallet_address: embeddedWalletAddress,
          wallet_type: 'embedded',
          is_primary: true
        })

      if (walletError) {
        throw new Error(`Failed to link wallet: ${walletError.message}`)
      }

      console.log('✅ Linked embedded wallet:', embeddedWalletAddress)

      // Return UserProfile format
      const userProfile: UserProfile = {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        avatar: profile.avatar,
        bio: profile.bio,
        walletAddress: embeddedWalletAddress,
        wallets: [{
          address: embeddedWalletAddress,
          type: 'embedded',
          addedAt: new Date()
        }],
        activeWallet: embeddedWalletAddress,
        linkedWallets: [embeddedWalletAddress],
        verified: true,
        createdAt: new Date(profile.created_at),
        updatedAt: new Date(profile.updated_at),
        followersCount: 0,
        followingCount: 0,
        isPublic: true,
        showWalletAddress: true,
        showEmail: false
      }

      return userProfile
    } catch (error) {
      console.error('❌ Error in createProfileInDatabase:', error)
      throw error
    }
  }

  /**
   * Link a wallet to an existing profile in Supabase
   */
  static async linkWalletToProfileInDatabase(
    profileId: string,
    walletAddress: string,
    walletType: WalletType = 'embedded'
  ): Promise<void> {
    try {
      const supabase = getSupabaseClient()

      // Check if wallet is already linked
      const { data: existing } = await supabase
        .from('profile_wallets')
        .select('wallet_address')
        .eq('wallet_address', walletAddress)
        .single()

      if (existing) {
        console.log('⚠️ Wallet already linked:', walletAddress)
        return
      }

      // Link wallet
      const { error } = await supabase
        .from('profile_wallets')
        .insert({
          profile_id: profileId,
          wallet_address: walletAddress,
          wallet_type: walletType,
          is_primary: false // Only first embedded wallet is primary
        })

      if (error) {
        throw new Error(`Failed to link wallet: ${error.message}`)
      }

      console.log('✅ Linked wallet to profile in database:', walletAddress)
    } catch (error) {
      console.error('❌ Error in linkWalletToProfileInDatabase:', error)
      throw error
    }
  }

  /**
   * Sync profile from Supabase to localStorage cache
   */
  static async syncProfileToLocalStorage(profile: UserProfile): Promise<void> {
    try {
      const profiles = this.getProfiles()
      const existingIndex = profiles.findIndex(p => p.id === profile.id)

      if (existingIndex >= 0) {
        profiles[existingIndex] = profile
      } else {
        profiles.push(profile)
      }

      this.saveProfiles(profiles)
      console.log('✅ Synced profile to localStorage cache')
    } catch (error) {
      console.error('❌ Error syncing profile to localStorage:', error)
    }
  }

  /**
   * Update profile in Supabase database
   */
  static async updateProfileInDatabase(profileId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const supabase = getSupabaseClient()

      // Map UserProfile fields to Supabase column names
      const dbUpdates: any = {}
      if (updates.username !== undefined) dbUpdates.username = updates.username
      if (updates.email !== undefined) dbUpdates.email = updates.email
      if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar
      if (updates.bio !== undefined) dbUpdates.bio = updates.bio
      if (updates.bannerImage !== undefined) dbUpdates.banner_image = updates.bannerImage
      if (updates.coverImage !== undefined) dbUpdates.banner_image = updates.coverImage // Support both field names

      // Social links - handle both direct fields and socialLinks object
      if (updates.twitter !== undefined) dbUpdates.twitter = updates.twitter
      if (updates.instagram !== undefined) dbUpdates.instagram = updates.instagram
      if (updates.discord !== undefined) dbUpdates.discord = updates.discord
      if (updates.website !== undefined) dbUpdates.website = updates.website

      // Handle socialLinks object from settings page
      if (updates.socialLinks !== undefined) {
        if (updates.socialLinks.twitter !== undefined) dbUpdates.twitter = updates.socialLinks.twitter
        if (updates.socialLinks.instagram !== undefined) dbUpdates.instagram = updates.socialLinks.instagram
        if (updates.socialLinks.discord !== undefined) dbUpdates.discord = updates.socialLinks.discord
        if (updates.socialLinks.website !== undefined) dbUpdates.website = updates.socialLinks.website
        if (updates.socialLinks.telegram !== undefined) dbUpdates.telegram = updates.socialLinks.telegram
        if (updates.socialLinks.github !== undefined) dbUpdates.github = updates.socialLinks.github
      }

      if (updates.verified !== undefined) dbUpdates.is_verified = updates.verified
      if (updates.isPublic !== undefined) dbUpdates.is_public = updates.isPublic
      if (updates.showWalletAddress !== undefined) dbUpdates.show_wallet_address = updates.showWalletAddress
      if (updates.showEmail !== undefined) dbUpdates.show_email = updates.showEmail

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', profileId)

      if (error) {
        throw new Error(`Failed to update profile in database: ${error.message}`)
      }

      console.log('✅ Updated profile in Supabase database:', profileId)
    } catch (error) {
      console.error('❌ Error updating profile in database:', error)
      throw error
    }
  }

  /**
   * Get all profiles from Supabase database
   */
  static async getAllProfilesFromDatabase(): Promise<UserProfile[]> {
    try {
      const supabase = getSupabaseClient()

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          *,
          profile_wallets (
            wallet_address,
            wallet_type,
            is_primary,
            added_at
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch profiles: ${error.message}`)
      }

      if (!profiles || profiles.length === 0) {
        console.log('ℹ️ No profiles found in database')
        return []
      }

      // Convert Supabase profiles to UserProfile format
      const userProfiles: UserProfile[] = profiles.map((profile: any) => {
        const wallets: WalletMetadata[] = profile.profile_wallets.map((w: any) => ({
          address: w.wallet_address,
          type: w.wallet_type,
          addedAt: new Date(w.added_at)
        }))

        const primaryWallet = profile.profile_wallets.find((w: any) => w.is_primary)

        return {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          avatar: profile.avatar,
          bio: profile.bio,
          bannerImage: profile.banner_image,
          twitter: profile.twitter,
          instagram: profile.instagram,
          discord: profile.discord,
          website: profile.website,
          walletAddress: primaryWallet?.wallet_address,
          wallets,
          activeWallet: primaryWallet?.wallet_address,
          linkedWallets: wallets.map(w => w.address),
          verified: profile.is_verified,
          createdAt: new Date(profile.created_at),
          updatedAt: new Date(profile.updated_at),
          followersCount: 0,
          followingCount: 0,
          isPublic: profile.is_public ?? true,
          showWalletAddress: profile.show_wallet_address ?? true,
          showEmail: profile.show_email ?? false
        }
      })

      console.log(`✅ Fetched ${userProfiles.length} profiles from database`)
      return userProfiles
    } catch (error) {
      console.error('❌ Error fetching profiles from database:', error)
      return []
    }
  }

  // ============================================================================
  // LOCALSTORAGE METHODS (Legacy/cache layer)
  // ============================================================================

  /**
   * Get all profiles from localStorage
   */
  static getProfiles(): UserProfile[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []

      const profiles = JSON.parse(stored)
      // Convert date strings back to Date objects
      return profiles.map((profile: any) => ({
        ...profile,
        createdAt: new Date(profile.createdAt),
        updatedAt: new Date(profile.updatedAt)
      }))
    } catch (error) {
      console.error("Error reading profiles:", error)
      return []
    }
  }

  /**
   * Save profiles to localStorage
   */
  static saveProfiles(profiles: UserProfile[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profiles))
    } catch (error) {
      console.error("Error saving profiles:", error)
    }
  }

  /**
   * Get a profile by ID
   */
  static getProfile(id: string): UserProfile | null {
    const profiles = this.getProfiles()
    return profiles.find(p => p.id === id) || null
  }

  /**
   * Get a profile by wallet address (case-insensitive)
   */
  static getProfileByWallet(walletAddress: string): UserProfile | null {
    if (!walletAddress) return null
    const profiles = this.getProfiles()
    return profiles.find(p =>
      p.walletAddress?.toLowerCase() === walletAddress.toLowerCase()
    ) || null
  }

  /**
   * Get a profile by email
   */
  static getProfileByEmail(email: string): UserProfile | null {
    const profiles = this.getProfiles()
    return profiles.find(p => p.email === email) || null
  }

  /**
   * Get a profile by username
   */
  static getProfileByUsername(username: string): UserProfile | null {
    const profiles = this.getProfiles()
    return profiles.find(p => p.username === username) || null
  }

  /**
   * Check if username is available
   */
  static isUsernameAvailable(username: string, excludeId?: string): boolean {
    const profiles = this.getProfiles()
    return !profiles.some(p => p.username.toLowerCase() === username.toLowerCase() && p.id !== excludeId)
  }

  /**
   * Generate a unique username from wallet address
   */
  static generateUsernameFromWallet(walletAddress: string): string {
    const baseUsername = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`

    // Check if base username is available
    if (this.isUsernameAvailable(baseUsername)) {
      return baseUsername
    }

    // If not available, append a number
    let counter = 1
    let username = `${baseUsername}_${counter}`
    while (!this.isUsernameAvailable(username)) {
      counter++
      username = `${baseUsername}_${counter}`
    }

    return username
  }

  /**
   * Generate a unique username from email
   */
  static generateUsernameFromEmail(email: string): string {
    const baseUsername = email.split('@')[0]

    // Check if base username is available
    if (this.isUsernameAvailable(baseUsername)) {
      return baseUsername
    }

    // If not available, append a number
    let counter = 1
    let username = `${baseUsername}${counter}`
    while (!this.isUsernameAvailable(username)) {
      counter++
      username = `${baseUsername}${counter}`
    }

    return username
  }

  /**
   * Create a new user profile
   */
  static async createProfile(params: CreateProfileParams): Promise<UserProfile> {
    const { id, username, email, walletAddress } = params

    // Check if profile already exists
    const existingProfile = this.getProfile(id)
    if (existingProfile) {
      return existingProfile
    }

    // Check if wallet already has a profile
    if (walletAddress) {
      const walletProfile = this.getProfileByWallet(walletAddress)
      if (walletProfile) {
        return walletProfile
      }
    }

    // Check if email already has a profile
    if (email) {
      const emailProfile = this.getProfileByEmail(email)
      if (emailProfile) {
        return emailProfile
      }
    }

    const now = new Date()
    const profile: UserProfile = {
      id,
      username,
      email,
      walletAddress,
      linkedWallets: walletAddress ? [walletAddress] : [], // Initialize with primary wallet
      activeWallet: walletAddress, // Set as active wallet
      createdAt: now,
      updatedAt: now,
      verified: walletAddress ? true : false, // Auto-verify wallet users
      followersCount: 0,
      followingCount: 0,
      isPublic: true,
      showWalletAddress: true,
      showEmail: false,
      bio: walletAddress
        ? `Welcome to Fortuna Square! Connected with ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
        : "New collector on Fortuna Square - ready to explore the cyberpunk NFT marketplace!",
    }

    // Save the new profile to localStorage
    const profiles = this.getProfiles()
    profiles.push(profile)
    this.saveProfiles(profiles)

    // Also save to Supabase database for multi-device sync
    try {
      await this.createProfileInDatabase(
        profile.username,
        {
          provider: 'email',
          providerAccountId: profile.id,
          email: profile.email
        },
        profile.walletAddress || ''
      )
      console.log("✅ Created new profile and synced to database:", profile.username)
    } catch (error) {
      console.error("⚠️ Failed to sync profile to database:", error)
      // Continue anyway - profile exists in localStorage
    }

    return profile
  }

  /**
   * Update an existing profile
   */
  static async updateProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const profiles = this.getProfiles()
    const profileIndex = profiles.findIndex(p => p.id === id)

    if (profileIndex === -1) {
      return null
    }

    const updatedProfile = {
      ...profiles[profileIndex],
      ...updates,
      updatedAt: new Date()
    }

    profiles[profileIndex] = updatedProfile
    this.saveProfiles(profiles)

    // ✨ NEW: Also update in Supabase database
    try {
      await this.updateProfileInDatabase(id, updates)
    } catch (error) {
      console.error('❌ Failed to sync profile update to database (continuing anyway):', error)
      // Continue even if database update fails - localStorage is updated
    }

    return updatedProfile
  }

  /**
   * Link a wallet address to an existing profile
   */
  static async linkWalletToProfile(profileId: string, walletAddress: string): Promise<UserProfile | null> {
    const profile = this.getProfile(profileId)
    if (!profile) {
      return null
    }

    // Check if wallet is already linked to another profile
    const existingWalletProfile = this.getProfileByWallet(walletAddress)
    if (existingWalletProfile && existingWalletProfile.id !== profileId) {
      throw new Error("Wallet is already linked to another profile")
    }

    return this.updateProfile(profileId, {
      walletAddress,
      verified: true // Auto-verify when wallet is linked
    })
  }

  /**
   * Create profile from wallet connection (embedded wallet from email/social signup)
   */
  static async createProfileFromWallet(
    walletAddress: string,
    oauthData?: {
      provider?: string
      profilePicture?: string
      email?: string
      name?: string
    }
  ): Promise<UserProfile> {
    // Generate username from OAuth name or wallet address
    let username: string
    if (oauthData?.name) {
      // Use OAuth name as base username
      const baseName = oauthData.name.toLowerCase().replace(/\s+/g, '_')
      username = this.isUsernameAvailable(baseName) ? baseName : `${baseName}_${Date.now().toString().slice(-4)}`
    } else if (oauthData?.email) {
      username = this.generateUsernameFromEmail(oauthData.email)
    } else {
      username = this.generateUsernameFromWallet(walletAddress)
    }

    const walletMetadata: WalletMetadata = {
      address: walletAddress,
      type: 'embedded',
      addedAt: new Date()
    }

    const now = new Date()
    const profile: UserProfile = {
      id: walletAddress,
      username,
      email: oauthData?.email,
      avatar: oauthData?.profilePicture, // Auto-populate from OAuth
      walletAddress,
      wallets: [walletMetadata],
      activeWallet: walletAddress,
      oauthProvider: oauthData?.provider as any,
      oauthProfilePicture: oauthData?.profilePicture, // Store original OAuth avatar
      createdAt: now,
      updatedAt: now,
      verified: true,
      followersCount: 0,
      followingCount: 0,
      isPublic: true,
      showWalletAddress: true,
      showEmail: false,
      bio: oauthData?.provider
        ? `Connected via ${oauthData.provider.charAt(0).toUpperCase() + oauthData.provider.slice(1)} 🚀`
        : `Welcome to Fortuna Square! Connected with ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    }

    // Save the new profile to localStorage
    const profiles = this.getProfiles()
    profiles.push(profile)
    this.saveProfiles(profiles)

    // Also save to Supabase database for multi-device sync
    try {
      await this.createProfileInDatabase(
        profile.username,
        {
          provider: oauthData?.provider || 'wallet',
          providerAccountId: profile.id,
          email: oauthData?.email
        },
        walletAddress
      )
      console.log("✅ Created new profile with OAuth data and synced to database:", profile.username)
    } catch (error) {
      console.error("⚠️ Failed to sync profile to database:", error)
      // Continue anyway - profile exists in localStorage
    }

    return profile
  }

  /**
   * Create profile from email signup
   */
  static async createProfileFromEmail(userId: string, username: string, email: string): Promise<UserProfile> {
    // Use provided username, but ensure it's available
    const finalUsername = this.isUsernameAvailable(username)
      ? username
      : this.generateUsernameFromEmail(email)

    return this.createProfile({
      id: userId,
      username: finalUsername,
      email
    })
  }

  /**
   * Link additional wallet to a profile with metadata
   */
  static async linkAdditionalWallet(
    profileId: string,
    walletAddress: string,
    walletType: WalletType = 'metamask'
  ): Promise<UserProfile | null> {
    const profile = this.getProfile(profileId)
    if (!profile) {
      console.error("Profile not found:", profileId)
      return null
    }

    // Check if wallet is already linked to another profile
    const existingWalletProfile = this.getProfileByWallet(walletAddress)
    if (existingWalletProfile && existingWalletProfile.id !== profileId) {
      throw new Error("This wallet is already linked to another profile")
    }

    const wallets = profile.wallets || []
    const linkedWallets = profile.linkedWallets || []

    // Check if wallet is already linked (check both old and new format)
    const isAlreadyLinked =
      wallets.some(w => w.address.toLowerCase() === walletAddress.toLowerCase()) ||
      linkedWallets.some(w => w.toLowerCase() === walletAddress.toLowerCase())

    if (isAlreadyLinked) {
      console.log("Wallet already linked to this profile")
      return profile
    }

    // Add wallet to new wallets array with metadata
    const newWalletMetadata: WalletMetadata = {
      address: walletAddress,
      type: walletType,
      addedAt: new Date()
    }

    const updatedWallets = [...wallets, newWalletMetadata]

    // Also update old linkedWallets for backwards compatibility
    const updatedLinkedWallets = [...linkedWallets, walletAddress]

    // ✨ NEW: Also link wallet in Supabase database
    try {
      await this.linkWalletToProfileInDatabase(profileId, walletAddress, walletType)
    } catch (error) {
      console.error('❌ Failed to link wallet in database (continuing anyway):', error)
      // Continue even if database update fails - localStorage is updated
    }

    return this.updateProfile(profileId, {
      wallets: updatedWallets,
      linkedWallets: updatedLinkedWallets
    })
  }

  /**
   * Unlink wallet from profile
   */
  static async unlinkWallet(profileId: string, walletAddress: string): Promise<UserProfile | null> {
    const profile = this.getProfile(profileId)
    if (!profile) {
      return null
    }

    const linkedWallets = profile.linkedWallets || []

    // Don't allow unlinking if it's the only wallet
    if (linkedWallets.length <= 1) {
      throw new Error("Cannot unlink the only wallet from profile")
    }

    // Don't allow unlinking primary wallet
    if (profile.walletAddress === walletAddress) {
      throw new Error("Cannot unlink primary wallet. Set a different primary wallet first.")
    }

    // Remove wallet from linkedWallets
    const updatedLinkedWallets = linkedWallets.filter(w => w.toLowerCase() !== walletAddress.toLowerCase())

    // If active wallet is being unlinked, switch to primary
    const updates: Partial<UserProfile> = {
      linkedWallets: updatedLinkedWallets
    }

    if (profile.activeWallet?.toLowerCase() === walletAddress.toLowerCase()) {
      updates.activeWallet = profile.walletAddress
    }

    return this.updateProfile(profileId, updates)
  }

  /**
   * Set active wallet for transactions
   */
  static async setActiveWallet(profileId: string, walletAddress: string): Promise<UserProfile | null> {
    const profile = this.getProfile(profileId)
    if (!profile) {
      return null
    }

    const linkedWallets = profile.linkedWallets || []

    // Verify wallet is linked to this profile
    if (!linkedWallets.some(w => w.toLowerCase() === walletAddress.toLowerCase())) {
      throw new Error("Wallet is not linked to this profile")
    }

    return this.updateProfile(profileId, {
      activeWallet: walletAddress
    })
  }

  /**
   * Set primary wallet (displayed on profile)
   */
  static async setPrimaryWallet(profileId: string, walletAddress: string): Promise<UserProfile | null> {
    const profile = this.getProfile(profileId)
    if (!profile) {
      return null
    }

    const linkedWallets = profile.linkedWallets || []

    // Verify wallet is linked to this profile
    if (!linkedWallets.some(w => w.toLowerCase() === walletAddress.toLowerCase())) {
      throw new Error("Wallet is not linked to this profile")
    }

    return this.updateProfile(profileId, {
      walletAddress,
      activeWallet: walletAddress // Also set as active
    })
  }

  /**
   * Get all wallets for a profile
   */
  static getAllWallets(profile: UserProfile): string[] {
    // Use new wallets array with metadata
    if (profile.wallets && profile.wallets.length > 0) {
      return profile.wallets.map(w => w.address)
    }

    // Fallback to legacy linkedWallets for old profiles
    if (profile.linkedWallets && profile.linkedWallets.length > 0) {
      return profile.linkedWallets
    }

    // Final fallback to primary wallet
    return profile.walletAddress ? [profile.walletAddress] : []
  }

  /**
   * Get all profiles (alias for getProfiles)
   */
  static getAllProfiles(): UserProfile[] {
    return this.getProfiles()
  }
  /**
   * Migrate profile to ensure embedded wallet is in wallets array
   */
  static migrateProfileWallets(profile: UserProfile): UserProfile {
    // If profile has walletAddress but no wallets array, create it
    if (profile.walletAddress && (!profile.wallets || profile.wallets.length === 0)) {
      const wallets: WalletMetadata[] = [{
        address: profile.walletAddress,
        type: 'embedded',
        addedAt: profile.createdAt || new Date()
      }]

      return {
        ...profile,
        wallets
      }
    }

    // If profile has walletAddress but it's not in wallets array, add it
    if (profile.walletAddress && profile.wallets) {
      const hasEmbeddedWallet = profile.wallets.some(
        w => w.address.toLowerCase() === profile.walletAddress?.toLowerCase()
      )

      if (!hasEmbeddedWallet) {
        const wallets: WalletMetadata[] = [
          {
            address: profile.walletAddress,
            type: 'embedded',
            addedAt: profile.createdAt || new Date()
          },
          ...profile.wallets
        ]

        return {
          ...profile,
          wallets
        }
      }
    }

    return profile
  }

  // ============================================================================
  // FOLLOW SYSTEM METHODS (Multi-device sync)
  // ============================================================================

  /**
   * Follow a user (sync to Supabase)
   */
  static async followUser(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new Error("You cannot follow yourself")
    }

    try {
      const supabase = getSupabaseClient()

      // Add follow to database
      const { error } = await supabase
        .from('profile_follows')
        .insert({
          follower_id: followerId,
          following_id: followingId
        })

      if (error) {
        // Ignore duplicate key errors (already following)
        if (error.code === '23505') {
          console.log('Already following user')
          return
        }
        throw new Error(`Failed to follow user: ${error.message}`)
      }

      console.log('✅ Followed user in database')
    } catch (error) {
      console.error('❌ Error in followUser:', error)
      throw error
    }
  }

  /**
   * Unfollow a user (sync to Supabase)
   */
  static async unfollowUser(followerId: string, followingId: string): Promise<void> {
    try {
      const supabase = getSupabaseClient()

      // Remove follow from database
      const { error } = await supabase
        .from('profile_follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId)

      if (error) {
        throw new Error(`Failed to unfollow user: ${error.message}`)
      }

      console.log('✅ Unfollowed user in database')
    } catch (error) {
      console.error('❌ Error in unfollowUser:', error)
      throw error
    }
  }

  /**
   * Check if user is following another user
   */
  static async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const supabase = getSupabaseClient()

      const { data, error } = await supabase
        .from('profile_follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found (expected)
        console.error('❌ Error checking follow status:', error)
        return false
      }

      return !!data
    } catch (error) {
      console.error('❌ Error in isFollowing:', error)
      return false
    }
  }

  /**
   * Get followers for a user
   */
  static async getFollowers(userId: string): Promise<UserProfile[]> {
    try {
      const supabase = getSupabaseClient()

      const { data, error } = await supabase
        .from('profile_follows')
        .select(`
          follower_id,
          profiles!profile_follows_follower_id_fkey (
            *,
            profile_wallets (
              wallet_address,
              wallet_type,
              is_primary,
              added_at
            )
          )
        `)
        .eq('following_id', userId)

      if (error) {
        throw new Error(`Failed to get followers: ${error.message}`)
      }

      // Convert to UserProfile format
      const followers: UserProfile[] = (data || []).map((item: any) => {
        const profile = item.profiles
        const wallets: WalletMetadata[] = profile.profile_wallets.map((w: any) => ({
          address: w.wallet_address,
          type: w.wallet_type,
          addedAt: new Date(w.added_at)
        }))

        const primaryWallet = profile.profile_wallets.find((w: any) => w.is_primary)

        return {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          avatar: profile.avatar,
          bio: profile.bio,
          bannerImage: profile.banner_image,
          twitter: profile.twitter,
          instagram: profile.instagram,
          discord: profile.discord,
          website: profile.website,
          verified: profile.is_verified,
          walletAddress: primaryWallet?.wallet_address,
          wallets,
          activeWallet: primaryWallet?.wallet_address,
          linkedWallets: wallets.map(w => w.address),
          createdAt: new Date(profile.created_at),
          updatedAt: new Date(profile.updated_at),
          followersCount: 0,
          followingCount: 0,
          isPublic: profile.is_public ?? true,
          showWalletAddress: profile.show_wallet_address ?? true,
          showEmail: profile.show_email ?? false
        }
      })

      return followers
    } catch (error) {
      console.error('❌ Error in getFollowers:', error)
      return []
    }
  }

  /**
   * Get users that a user is following
   */
  static async getFollowing(userId: string): Promise<UserProfile[]> {
    try {
      const supabase = getSupabaseClient()

      const { data, error } = await supabase
        .from('profile_follows')
        .select(`
          following_id,
          profiles!profile_follows_following_id_fkey (
            *,
            profile_wallets (
              wallet_address,
              wallet_type,
              is_primary,
              added_at
            )
          )
        `)
        .eq('follower_id', userId)

      if (error) {
        throw new Error(`Failed to get following: ${error.message}`)
      }

      // Convert to UserProfile format
      const following: UserProfile[] = (data || []).map((item: any) => {
        const profile = item.profiles
        const wallets: WalletMetadata[] = profile.profile_wallets.map((w: any) => ({
          address: w.wallet_address,
          type: w.wallet_type,
          addedAt: new Date(w.added_at)
        }))

        const primaryWallet = profile.profile_wallets.find((w: any) => w.is_primary)

        return {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          avatar: profile.avatar,
          bio: profile.bio,
          bannerImage: profile.banner_image,
          twitter: profile.twitter,
          instagram: profile.instagram,
          discord: profile.discord,
          website: profile.website,
          verified: profile.is_verified,
          walletAddress: primaryWallet?.wallet_address,
          wallets,
          activeWallet: primaryWallet?.wallet_address,
          linkedWallets: wallets.map(w => w.address),
          createdAt: new Date(profile.created_at),
          updatedAt: new Date(profile.updated_at),
          followersCount: 0,
          followingCount: 0,
          isPublic: profile.is_public ?? true,
          showWalletAddress: profile.show_wallet_address ?? true,
          showEmail: profile.show_email ?? false
        }
      })

      return following
    } catch (error) {
      console.error('❌ Error in getFollowing:', error)
      return []
    }
  }

  /**
   * Get follower and following counts
   */
  static async getFollowCounts(userId: string): Promise<{ followers: number; following: number }> {
    try {
      const supabase = getSupabaseClient()

      const [followersResult, followingResult] = await Promise.all([
        supabase
          .from('profile_follows')
          .select('id', { count: 'exact', head: true })
          .eq('following_id', userId),
        supabase
          .from('profile_follows')
          .select('id', { count: 'exact', head: true })
          .eq('follower_id', userId)
      ])

      return {
        followers: followersResult.count || 0,
        following: followingResult.count || 0
      }
    } catch (error) {
      console.error('❌ Error in getFollowCounts:', error)
      return { followers: 0, following: 0 }
    }
  }

  // ============================================================================
  // WATCHLIST METHODS (Multi-device sync)
  // ============================================================================

  /**
   * Add collection to watchlist (sync to Supabase)
   */
  static async addToWatchlist(
    profileId: string,
    collectionAddress: string,
    chainId: number,
    collectionName?: string,
    collectionImage?: string
  ): Promise<void> {
    try {
      const supabase = getSupabaseClient()

      // Add to database
      const { error } = await supabase
        .from('profile_watchlist')
        .insert({
          profile_id: profileId,
          collection_address: collectionAddress,
          chain_id: chainId,
          collection_name: collectionName,
          collection_image: collectionImage
        })

      if (error) {
        // Ignore duplicate key errors (already in watchlist)
        if (error.code === '23505') {
          console.log('Collection already in watchlist')
          return
        }
        throw new Error(`Failed to add to watchlist: ${error.message}`)
      }

      console.log('✅ Added collection to watchlist in database')
    } catch (error) {
      console.error('❌ Error in addToWatchlist:', error)
      throw error
    }
  }

  /**
   * Remove collection from watchlist (sync to Supabase)
   */
  static async removeFromWatchlist(
    profileId: string,
    collectionAddress: string,
    chainId: number
  ): Promise<void> {
    try {
      const supabase = getSupabaseClient()

      // Remove from database
      const { error } = await supabase
        .from('profile_watchlist')
        .delete()
        .eq('profile_id', profileId)
        .eq('collection_address', collectionAddress)
        .eq('chain_id', chainId)

      if (error) {
        throw new Error(`Failed to remove from watchlist: ${error.message}`)
      }

      console.log('✅ Removed collection from watchlist in database')
    } catch (error) {
      console.error('❌ Error in removeFromWatchlist:', error)
      throw error
    }
  }

  /**
   * Check if collection is in watchlist
   */
  static async isInWatchlist(
    profileId: string,
    collectionAddress: string,
    chainId: number
  ): Promise<boolean> {
    try {
      const supabase = getSupabaseClient()

      const { data, error } = await supabase
        .from('profile_watchlist')
        .select('id')
        .eq('profile_id', profileId)
        .eq('collection_address', collectionAddress)
        .eq('chain_id', chainId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found (expected)
        console.error('❌ Error checking watchlist status:', error)
        return false
      }

      return !!data
    } catch (error) {
      console.error('❌ Error in isInWatchlist:', error)
      return false
    }
  }

  /**
   * Get watchlist for a user
   */
  static async getWatchlist(profileId: string): Promise<Array<{
    collectionAddress: string
    chainId: number
    collectionName?: string
    collectionImage?: string
    addedAt: Date
  }>> {
    try {
      const supabase = getSupabaseClient()

      const { data, error } = await supabase
        .from('profile_watchlist')
        .select('*')
        .eq('profile_id', profileId)
        .order('added_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to get watchlist: ${error.message}`)
      }

      return (data || []).map((item: any) => ({
        collectionAddress: item.collection_address,
        chainId: item.chain_id,
        collectionName: item.collection_name,
        collectionImage: item.collection_image,
        addedAt: new Date(item.added_at)
      }))
    } catch (error) {
      console.error('❌ Error in getWatchlist:', error)
      return []
    }
  }
}