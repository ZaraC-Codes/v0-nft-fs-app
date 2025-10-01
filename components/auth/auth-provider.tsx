"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useActiveAccount, useConnect, useDisconnect } from "thirdweb/react"
import { createWallet } from "thirdweb/wallets"
import { client, apeChainCurtis } from "@/lib/thirdweb"
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
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    // Load user from localStorage on initial mount
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem("fortuna_square_user")
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser)
          setUser(parsedUser)
          console.log("✅ Loaded user from storage:", parsedUser.username, "has wallet:", !!parsedUser.walletAddress)
        } else {
          console.log("ℹ️ No user found in storage")
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

    if (account?.address) {
      if (user) {
        // User is logged in - check if this wallet is already linked
        const profile = ProfileService.getProfile(user.id)
        if (profile) {
          const linkedWallets = ProfileService.getAllWallets(profile)
          const isWalletLinked = linkedWallets.some(w => w.toLowerCase() === account.address.toLowerCase())

          if (!isWalletLinked) {
            // This is a new wallet - link it to the profile
            console.log("🔗 Linking new wallet to profile:", account.address)
            ProfileService.linkAdditionalWallet(user.id, account.address).then(() => {
              console.log("✅ Wallet linked successfully")
            }).catch(error => {
              console.error("Failed to link wallet:", error)
            })
          }
        }
      } else {
        // No user logged in - check if wallet has existing profile
        const existingProfile = ProfileService.getProfileByWallet(account.address)

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
          // SAFEGUARD: Double-check no profile exists before creating
          // Check both primary wallet and linked wallets
          const allProfiles = ProfileService.getAllProfiles()
          const profileWithWallet = allProfiles.find(p => {
            const wallets = ProfileService.getAllWallets(p)
            return wallets.some(w => w.toLowerCase() === account.address.toLowerCase())
          })

          if (profileWithWallet) {
            // Found existing profile with this wallet - log them in instead
            console.log("⚠️ SAFEGUARD: Found existing profile with this wallet, logging in instead of creating duplicate")
            const walletUser: User = {
              id: profileWithWallet.id,
              username: profileWithWallet.username,
              email: profileWithWallet.email || "",
              avatar: profileWithWallet.avatar,
              walletAddress: profileWithWallet.walletAddress,
              isVerified: true,
            }
            setUser(walletUser)
            localStorage.setItem("fortuna_square_user", JSON.stringify(walletUser))
            console.log("✅ Logged in existing user (safeguard):", profileWithWallet.username)
            return
          }

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
            ProfileService.createProfileFromWallet(account.address).then(profile => {
              const walletUser: User = {
                id: profile.id,
                username: profile.username,
                email: "",
                avatar: profile.avatar,
                walletAddress: account.address,
                isVerified: true,
              }
              setUser(walletUser)
              localStorage.setItem("fortuna_square_user", JSON.stringify(walletUser))
              console.log("✅ Created wallet user:", profile.username)
            }).catch(error => {
              console.error("Failed to create wallet profile:", error)
            })
          } else {
            console.log("⚠️ External wallet detected. Please signup with email/social first, then link your external wallet in Settings.")
          }
        }
      }
    } else if (!account && user?.walletAddress) {
      // Wallet disconnected, clear user if it was wallet-only
      if (!user.email || user.email === "") {
        setUser(null)
        localStorage.removeItem("fortuna_square_user")
        console.log("✅ Cleared wallet-only user on disconnect")
      } else {
        // Keep user account even if wallet disconnected (they have email/social login)
        console.log("✅ Wallet disconnected but user has email login")
      }
    }
  }, [account, user, isLoading])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate login API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate user ID for mock login
      const userId = "user_" + Date.now()

      // Try to find existing profile by email
      let profile = ProfileService.getProfileByEmail(email)

      if (!profile) {
        // Create new profile for email user
        profile = await ProfileService.createProfileFromEmail(userId, "cybernaut", email)
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
      await disconnect()
    }
    setUser(null)
    localStorage.removeItem("fortuna_square_user")
  }

  const connectWallet = async () => {
    setIsLoading(true)
    try {
      const wallet = createWallet("io.metamask")
      await connect({ wallet, client, chain: apeChainCurtis })
    } catch (error) {
      console.error("Wallet connection failed:", error)
      throw new Error("Wallet connection failed")
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = async () => {
    setIsLoading(true)
    try {
      await disconnect()
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
