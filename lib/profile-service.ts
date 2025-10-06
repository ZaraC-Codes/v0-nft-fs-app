import { UserProfile, WalletMetadata, WalletType } from "@/types/profile"

export interface CreateProfileParams {
  id: string
  username: string
  email?: string
  walletAddress?: string
}

/**
 * Profile Service - Handles user profile creation and management
 */
export class ProfileService {
  private static readonly STORAGE_KEY = "fortuna_square_profiles"

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
   * Get a profile by wallet address
   */
  static getProfileByWallet(walletAddress: string): UserProfile | null {
    const profiles = this.getProfiles()
    return profiles.find(p => p.walletAddress === walletAddress) || null
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

    // Save the new profile
    const profiles = this.getProfiles()
    profiles.push(profile)
    this.saveProfiles(profiles)

    console.log("✅ Created new profile:", profile.username)
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

    // Save the new profile
    const profiles = this.getProfiles()
    profiles.push(profile)
    this.saveProfiles(profiles)

    console.log("✅ Created new profile with OAuth data:", profile.username, "Provider:", oauthData?.provider)
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
    return profile.linkedWallets || (profile.walletAddress ? [profile.walletAddress] : [])
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
}