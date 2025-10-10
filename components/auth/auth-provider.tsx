"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { useActiveAccount, useDisconnect } from "thirdweb/react"
import { ProfileService } from "@/lib/profile-service"

interface User {
  id: string
  username: string
  email: string
  avatar?: string
  walletAddress?: string
  isVerified: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const account = useActiveAccount()
  const { disconnect } = useDisconnect()

  // Track processed wallets to prevent duplicate profile creation
  const processedWallets = useRef<Set<string>>(new Set())

  // Track if wallet was ever connected to prevent false disconnect on page load
  const wasWalletConnected = useRef(false)

  useEffect(() => {
    // Load user from localStorage and refresh from database
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem("fortuna_square_user")
        if (!savedUser) {
          console.log("ℹ️ No user found in storage")
          setIsLoading(false)
          return
        }

        const parsedUser = JSON.parse(savedUser)

        // Set cached user immediately for fast UI (optimistic)
        setUser(parsedUser)
        console.log("✅ Loaded user from cache:", parsedUser.username)

        // Then refresh from database to get latest data
        const { ProfileService } = await import("@/lib/profile-service")
        const dbProfile = await ProfileService.getProfileFromDatabase(parsedUser.id)

        if (dbProfile) {
          const updatedUser: User = {
            id: dbProfile.id,
            username: dbProfile.username,
            email: dbProfile.email || "",
            avatar: dbProfile.avatar,
            walletAddress: dbProfile.walletAddress,
            isVerified: dbProfile.verified || false,
          }

          // Update with fresh data from database
          setUser(updatedUser)
          localStorage.setItem("fortuna_square_user", JSON.stringify(updatedUser))
          console.log("✅ Refreshed user from database:", updatedUser.username)
        } else {
          console.warn("⚠️ User in cache but not found in database:", parsedUser.id)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Listen for storage changes to sync user updates across components
  useEffect(() => {
    const handleStorageChange = () => {
      const savedUser = localStorage.getItem("fortuna_square_user")
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        console.log("✅ User synced from storage:", parsedUser.username)
      }
    }

    // Listen for custom event from ProfileProvider
    window.addEventListener("userUpdated", handleStorageChange)

    return () => {
      window.removeEventListener("userUpdated", handleStorageChange)
    }
  }, [])

  // Sync with thirdweb account and create profiles automatically
  useEffect(() => {
    // CRITICAL: Wait for localStorage to load before auto-creating profiles
    if (isLoading) {
      console.log("⏳ Waiting for auth to load before syncing wallet...")
      return
    }

    // Wrap entire wallet sync in async IIFE to support database-first architecture
    ;(async () => {
      if (account?.address) {
        // Mark that wallet is connected
        wasWalletConnected.current = true

        // 🔒 CRITICAL: Guard against duplicate profile creation
        // Check if this wallet is already being processed or was processed
        const walletKey = account.address.toLowerCase()
        if (processedWallets.current.has(walletKey)) {
          console.log("⏭️ Wallet already processed, skipping duplicate creation:", account.address)
          return
        }

        // Mark wallet as being processed
        processedWallets.current.add(walletKey)
        console.log("🔓 Processing wallet for first time:", account.address)

        if (user) {
          // User is logged in - check if this wallet is already linked (DATABASE-FIRST)
          const profile = await ProfileService.getProfileFromDatabase(user.id)
          if (profile) {
            const linkedWallets = ProfileService.getAllWallets(profile)
            const isWalletLinked = linkedWallets.some(w => w.toLowerCase() === account.address.toLowerCase())

            if (!isWalletLinked) {
              // This is a new wallet - link it to the profile
              console.log("🔗 Linking new wallet to profile:", account.address)
              try {
                await ProfileService.linkAdditionalWallet(user.id, account.address)
                console.log("✅ Wallet linked successfully")
              } catch (error) {
                console.error("Failed to link wallet:", error)
              }
            }
          }
        } else {
          // No user logged in - check if wallet has existing profile (DATABASE-FIRST)
          const existingProfile = await ProfileService.getProfileByWalletFromDatabase(account.address)

          if (existingProfile) {
            // Wallet has a profile - log them in
            const walletUser: User = {
              id: existingProfile.id,
              username: existingProfile.username,
              email: existingProfile.email || "",
              avatar: existingProfile.avatar,
              walletAddress: existingProfile.walletAddress,
              isVerified: true,
            }
            setUser(walletUser)
            localStorage.setItem("fortuna_square_user", JSON.stringify(walletUser))
            console.log("✅ Logged in existing wallet user:", existingProfile.username)
          } else {
            // No existing profile found in database
            // Database unique constraints prevent duplicates, so safe to proceed

            // Only auto-create profile for embedded wallets (in-app wallet)
            // External wallets (MetaMask, etc.) require manual linking
            const walletId = (account as any).wallet?.id
            console.log("🔍 Detected wallet ID:", walletId, "Account:", account)

            // ThirdWeb uses "inApp" as the wallet ID for embedded wallets
            // Also check for common external wallet IDs to be certain
            const externalWalletIds = ["io.metamask", "io.rabby", "com.coinbase.wallet", "io.useglyph", "walletConnect"]
            const isExternalWallet = externalWalletIds.includes(walletId)

            // If walletId is undefined or doesn't match known patterns, assume embedded wallet
            // This handles cases where ThirdWeb might use different IDs
            const shouldAutoCreate = !isExternalWallet

            console.log("🔍 Wallet check - isExternal:", isExternalWallet, "shouldAutoCreate:", shouldAutoCreate)

            if (shouldAutoCreate) {
              console.log("✅ Creating profile automatically for connected wallet")

              // Get OAuth profile data and create/link profile (all awaits now work correctly)
              try {
                let oauthData = null
                let userInfo = null

                // Check if this is an embedded wallet with OAuth
                const wallet = (account as any).wallet
                if (wallet && typeof wallet.getUserInfo === 'function') {
                  try {
                    userInfo = await wallet.getUserInfo()
                    console.log("📸 OAuth user info retrieved:", userInfo)
                    oauthData = {
                      provider: userInfo?.provider,
                      profilePicture: userInfo?.profilePicture,
                      email: userInfo?.email,
                      name: userInfo?.name,
                    }
                  } catch (e) {
                    console.log("ℹ️ No OAuth data available (might be email/passkey login)")
                  }
                }

                // ============================================================
                // MULTI-DEVICE PROFILE SYNC - OAuth-based lookup
                // ============================================================
                let profile: any = null

                // If we have OAuth data, look up by provider credentials
                if (oauthData?.provider && userInfo?.sub) {
                  console.log("🔍 Looking up profile by OAuth provider:", oauthData.provider, "ID:", userInfo.sub)

                  profile = await ProfileService.getProfileByOAuthProvider(
                    oauthData.provider,
                    userInfo.sub // OAuth provider's unique user ID
                  )

                  if (profile) {
                    console.log("✅ Found existing profile via OAuth - linking new device wallet")

                    // Link this device's embedded wallet to existing profile
                    await ProfileService.linkWalletToProfileInDatabase(
                      profile.id,
                      account.address,
                      'embedded'
                    )

                    // Sync to localStorage cache
                    await ProfileService.syncProfileToLocalStorage(profile)
                  } else {
                    console.log("🆕 Creating new profile in database with OAuth account")

                    // Generate username
                    let username: string
                    if (oauthData.name) {
                      const baseName = oauthData.name.toLowerCase().replace(/\s+/g, '_')
                      username = baseName + '_' + Date.now().toString().slice(-4)
                    } else if (oauthData.email) {
                      username = ProfileService.generateUsernameFromEmail(oauthData.email)
                    } else {
                      username = ProfileService.generateUsernameFromWallet(account.address)
                    }

                    // Create new profile in Supabase
                    profile = await ProfileService.createProfileInDatabase(
                      username,
                      {
                        provider: oauthData.provider,
                        providerAccountId: userInfo.sub,
                        email: oauthData.email
                      },
                      account.address
                    )

                    // Sync to localStorage cache
                    await ProfileService.syncProfileToLocalStorage(profile)
                  }
                } else {
                  // Fallback: No OAuth data (email/passkey) - use legacy localStorage
                  console.log("⚠️ No OAuth provider detected, using legacy localStorage profile creation")
                  profile = await ProfileService.createProfileFromWallet(
                    account.address,
                    oauthData || undefined
                  )
                }

                const walletUser: User = {
                  id: profile.id,
                  username: profile.username,
                  email: oauthData?.email || "",
                  avatar: profile.avatar,
                  walletAddress: account.address,
                  isVerified: true,
                }
                setUser(walletUser)
                localStorage.setItem("fortuna_square_user", JSON.stringify(walletUser))

                // Force immediate persistence and notify other components
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new Event('storage'))
                }

                console.log("✅ User logged in:", profile.username)
                console.log("✅ Auth state saved with profile ID:", profile.id)

                // Redirect to profile page after successful signup
                // Use setTimeout to ensure localStorage write completes before navigation
                setTimeout(() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = `/profile/${profile.username}`
                  }
                }, 100)
              } catch (error) {
                console.error("❌ Failed to create/sync wallet profile:", error)
                // Show user-friendly error message
                alert("Failed to create profile. Please try again or contact support.")
              }
            } else {
              console.log("⚠️ External wallet detected. Please signup with email/social first, then link your external wallet in Settings.")
            }
          }
        }
      } else if (!account && wasWalletConnected.current) {
        // 🔒 CRITICAL: Only run disconnect logic if wallet was previously connected
        // This prevents false disconnects on page load from clearing authenticated users

        // Wallet disconnected - clear processed wallets so user can reconnect
        processedWallets.current.clear()
        console.log("🔓 Cleared processed wallets on disconnect")

        if (user?.walletAddress) {
          // Wallet disconnected - don't immediately clear user
          // User might have OAuth login even without email
          console.log("⚠️ Wallet disconnected, checking if user has OAuth accounts...")

        try {
          const { ProfileService } = await import("@/lib/profile-service")
          const profile = await ProfileService.getProfileFromDatabase(user.id)

          if (!profile) {
            // Profile doesn't exist in database - clear user
            setUser(null)
            localStorage.removeItem("fortuna_square_user")
            console.log("✅ Cleared user - profile not found in database")
          } else if (!profile.oauthAccounts || profile.oauthAccounts.length === 0) {
            // No OAuth accounts and wallet disconnected - clear user
            setUser(null)
            localStorage.removeItem("fortuna_square_user")
            console.log("✅ Cleared wallet-only user on disconnect")
          } else {
            // User has OAuth accounts - keep logged in
            console.log("✅ Wallet disconnected but user has OAuth account, keeping auth state")
          }
        } catch (error) {
          console.error("❌ Error checking OAuth accounts on disconnect:", error)
          // Don't clear user on error - safer to keep them logged in
        }
        }
      }
    })() // Close async IIFE
  }, [account, isLoading]) // 🔒 REMOVED 'user' to prevent duplicate profile creation

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate login API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate user ID for mock login
      const userId = "user_" + Date.now()

      // ✅ FIXED: Try to find existing profile by email from database (DATABASE-FIRST)
      let profile = await ProfileService.getProfileByEmailFromDatabase(email)

      if (!profile) {
        // Fallback: Check localStorage cache
        const cachedProfile = ProfileService.getProfileByEmail(email)
        if (cachedProfile) {
          console.log("⚠️ Found profile in localStorage, syncing to database...")
          profile = cachedProfile
        } else {
          // Create new profile for email user
          profile = await ProfileService.createProfileFromEmail(userId, "cybernaut", email)
        }
      }

      const mockUser: User = {
        id: profile.id,
        username: profile.username,
        email,
        avatar: profile.avatar || "/cyberpunk-avatar-neon.png",
        isVerified: true,
        walletAddress: profile.walletAddress,
      }

      setUser(mockUser)
      localStorage.setItem("fortuna_square_user", JSON.stringify(mockUser))
    } catch (error) {
      throw new Error("Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (username: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate signup API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate user ID for new signup
      const userId = "user_" + Date.now()

      // Create new profile for signup
      const profile = await ProfileService.createProfileFromEmail(userId, username, email)

      const mockUser: User = {
        id: profile.id,
        username: profile.username,
        email,
        avatar: profile.avatar || "/cyberpunk-avatar-neon.png",
        isVerified: false,
      }

      setUser(mockUser)
      localStorage.setItem("fortuna_square_user", JSON.stringify(mockUser))
    } catch (error) {
      throw new Error("Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    // Disconnect wallet if connected
    if (account) {
      const wallet = (account as any).wallet
      if (wallet) {
        disconnect(wallet)
      }
    }
    setUser(null)
    localStorage.removeItem("fortuna_square_user")
  }

  const connectWallet = async () => {
    // Wallet connection now handled by WalletConnect component and wallet switcher
    console.log("connectWallet called - use WalletConnect component or wallet switcher instead")
  }

  const disconnectWallet = async () => {
    setIsLoading(true)
    try {
      if (account) {
        const wallet = (account as any).wallet
        if (wallet) {
          disconnect(wallet)
        }
      }
      // If user was wallet-only, clear user completely
      if (user && (!user.email || user.email === "")) {
        setUser(null)
        localStorage.removeItem("fortuna_square_user")
        console.log("✅ Cleared wallet-only user on manual disconnect")
      } else if (user) {
        // Keep user but remove wallet address
        const updatedUser = { ...user, walletAddress: undefined }
        setUser(updatedUser)
        localStorage.setItem("fortuna_square_user", JSON.stringify(updatedUser))
        console.log("✅ Kept user account, removed wallet address on manual disconnect")
      }
    } catch (error) {
      console.error("Wallet disconnect failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = (updates: Partial<User>) => {
    if (!user) return

    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem("fortuna_square_user", JSON.stringify(updatedUser))
    console.log("✅ User updated in AuthProvider:", updatedUser.username)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        connectWallet,
        disconnectWallet,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
