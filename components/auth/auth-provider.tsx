"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

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
  logout: () => void
  connectWallet: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        // Simulate checking for existing session
        const savedUser = localStorage.getItem("cybernft_user")
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate login API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockUser: User = {
        id: "1",
        username: "cybernaut",
        email,
        avatar: "/cyberpunk-avatar-neon.png",
        isVerified: true,
      }

      setUser(mockUser)
      localStorage.setItem("cybernft_user", JSON.stringify(mockUser))
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

      const mockUser: User = {
        id: "1",
        username,
        email,
        avatar: "/cyberpunk-avatar-neon.png",
        isVerified: false,
      }

      setUser(mockUser)
      localStorage.setItem("cybernft_user", JSON.stringify(mockUser))
    } catch (error) {
      throw new Error("Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("cybernft_user")
  }

  const connectWallet = async () => {
    setIsLoading(true)
    try {
      // Simulate wallet connection
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const walletAddress = "0x742d35Cc6634C0532925a3b8D0C9C0E3C5d5c8E9"

      if (user) {
        const updatedUser = { ...user, walletAddress }
        setUser(updatedUser)
        localStorage.setItem("cybernft_user", JSON.stringify(updatedUser))
      } else {
        const mockUser: User = {
          id: "1",
          username: "wallet_user",
          email: "",
          walletAddress,
          isVerified: true,
        }
        setUser(mockUser)
        localStorage.setItem("cybernft_user", JSON.stringify(mockUser))
      }
    } catch (error) {
      throw new Error("Wallet connection failed")
    } finally {
      setIsLoading(false)
    }
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
