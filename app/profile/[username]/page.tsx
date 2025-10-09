"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileTabs } from "@/components/profile/profile-tabs"
import { UserProfile } from "@/types/profile"
import { ProfileService } from "@/lib/profile-service"
import { useProfile } from "@/components/profile/profile-provider"

// Function to fetch user profile by username
const fetchUserByUsername = async (username: string): Promise<UserProfile | null> => {
  // FIRST: Try to get from Supabase database (PRIMARY source)
  try {
    console.log(`🔍 Looking up profile in database: ${username}`)
    const dbProfile = await ProfileService.getProfileByUsernameFromDatabase(username)
    if (dbProfile) {
      console.log('✅ Found profile in database:', username)
      return dbProfile
    }
    console.log(`⚠️ Profile not found in database: ${username}`)
  } catch (error) {
    console.error("Database lookup failed:", error)
  }

  // FALLBACK: Try localStorage (for backward compatibility)
  try {
    const cachedProfile = ProfileService.getProfileByUsername(username)
    if (cachedProfile) {
      console.log('✅ Found profile in localStorage:', username)
      return cachedProfile
    }
  } catch (error) {
    console.log("localStorage lookup failed:", error)
  }

  // LAST RESORT: Special case for mock demo profile
  if (username === "crypto_collector") {
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      id: "mock_crypto_collector",
      username: "crypto_collector",
      email: "collector@example.com",
      bio: "NFT enthusiast and digital art collector. Always looking for the next gem! 🎨✨",
      avatar: "/placeholder.svg",
      coverImage: "/placeholder.svg",
      walletAddress: "0x2345678901234567890123456789012345678901",
      createdAt: new Date("2023-01-15"),
      updatedAt: new Date(),
      verified: true,
      followersCount: 1250,
      followingCount: 345,
      isPublic: true,
      showWalletAddress: true,
      showEmail: false,
    }
  }

  // All other usernames - no profile found
  console.log(`❌ Profile not found anywhere: ${username}`)
  return null
}

export default function ProfilePage() {
  const params = useParams()
  const username = params.username as string
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { setUserProfile } = useProfile()

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        const userProfile = await fetchUserByUsername(username)

        if (!userProfile) {
          setError("User not found")
        } else {
          setProfile(userProfile)
          // Update the ProfileProvider context with this profile
          setUserProfile(userProfile)
        }
      } catch (err) {
        setError("Failed to load profile")
        console.error("Error loading profile:", err)
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      loadProfile()
    }
  }, [username, setUserProfile])

  if (loading) {
    return (
      <div className="min-h-screen bg-background cyber-grid">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background cyber-grid">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
              <p className="text-muted-foreground mb-4">
                {error || "The user you're looking for doesn't exist."}
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <ProfileHeader profile={profile} />
          <ProfileTabs profile={profile} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
