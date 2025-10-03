"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { UserProfile, NFTWatchlistItem, UserFollow, ProfileTabData, PortfolioNFT, Treasury } from "@/types/profile"
import { apeChain, apeChainCurtis, sepolia } from "@/lib/thirdweb"
import { useActiveWalletChain } from "thirdweb/react"

interface ProfileContextType {
  userProfile: UserProfile | null
  setUserProfile: (profile: UserProfile | null) => void
  profileTabData: ProfileTabData
  isFollowing: (userId: string) => boolean
  followUser: (userId: string) => Promise<void>
  unfollowUser: (userId: string) => Promise<void>
  addToWatchlist: (nft: Omit<NFTWatchlistItem, 'id' | 'userId' | 'addedAt'>) => Promise<void>
  removeFromWatchlist: (nftId: string) => Promise<void>
  isInWatchlist: (contractAddress: string, tokenId: string) => boolean
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  refreshProfile: () => Promise<void>
  loading: boolean
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

// Mock data for development - replace with real API calls
const mockProfiles: UserProfile[] = [
  {
    id: "mock_crypto_collector",
    username: "crypto_collector",
    email: "collector@example.com",
    bio: "NFT enthusiast and digital art collector. Always looking for the next gem! 🎨✨",
    avatar: "/placeholder.svg",
    coverImage: "/placeholder.svg",
    walletAddress: "0x1234567890123456789012345678901234567890",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date(),
    verified: true,
    followersCount: 1250,
    followingCount: 345,
    isPublic: true,
    showWalletAddress: true,
    showEmail: false,
  },
  {
    id: "2",
    username: "nft_trader",
    email: "trader@example.com",
    bio: "Professional NFT trader and market analyst. Diamond hands 💎🙌",
    avatar: "/placeholder.svg",
    walletAddress: "0x9876543210987654321098765432109876543210",
    createdAt: new Date("2022-11-20"),
    updatedAt: new Date(),
    verified: false,
    followersCount: 890,
    followingCount: 156,
    isPublic: true,
    showWalletAddress: true,
    showEmail: false,
  }
]

const mockWatchlist: NFTWatchlistItem[] = [
  {
    id: "w1",
    userId: "mock_crypto_collector",
    contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
    tokenId: "1234",
    name: "Bored Ape #1234",
    image: "https://picsum.photos/400/400?random=9001",
    collection: "Bored Ape Yacht Club",
    addedAt: new Date("2024-01-15"),
    lastSalePrice: 52.3,
    chainId: apeChainCurtis.id,
    rarity: "2",
    listing: {
      type: "sale",
      sale: {
        price: 45.5,
        lastSalePrice: 52.3,
        seller: "0x1234567890123456789012345678901234567890",
      },
    },
  },
  {
    id: "w2",
    userId: "mock_crypto_collector",
    contractAddress: "0x60E4d786628Fea6478F785A6d7e704777c86a7c6",
    tokenId: "5678",
    name: "Mutant Ape #5678",
    image: "https://picsum.photos/400/400?random=9002",
    collection: "Mutant Ape Yacht Club",
    addedAt: new Date("2024-01-20"),
    lastSalePrice: 8.7,
    chainId: sepolia.id,
    rarity: "3",
    listing: {
      type: "rent",
      rent: {
        pricePerDay: 0.5,
        maxDuration: 30,
        owner: "0x9876543210987654321098765432109876543210",
      },
    },
  },
  {
    id: "w3",
    userId: "mock_crypto_collector",
    contractAddress: "0x23581767a106ae21c074b2276D25e5C3e136a68b",
    tokenId: "3456",
    name: "Moonbirds #3456",
    image: "https://picsum.photos/400/400?random=9003",
    collection: "Moonbirds",
    addedAt: new Date("2024-01-25"),
    lastSalePrice: 15.2,
    chainId: apeChainCurtis.id,
    rarity: "1",
    listing: {
      type: "swap",
      swap: {
        wantedCollection: "0x60E4d786628Fea6478F785A6d7e704777c86a7c6",
        wantedTokenId: null,
        owner: "0x5555555555555555555555555555555555555555",
      },
    },
  },
  {
    id: "w4",
    userId: "mock_crypto_collector",
    contractAddress: "0xED5AF388653567Af2F388E6224dC7C4b3241C544",
    tokenId: "7890",
    name: "Azuki #7890",
    image: "https://picsum.photos/400/400?random=9004",
    collection: "Azuki",
    addedAt: new Date("2024-02-01"),
    lastSalePrice: 7.1,
    chainId: sepolia.id,
  },
  {
    id: "w5",
    userId: "mock_crypto_collector",
    contractAddress: "0x524cAB2ec69124574082676e6F654a18df49A048",
    tokenId: "2468",
    name: "Doodle #2468",
    image: "https://picsum.photos/400/400?random=9005",
    collection: "Doodles",
    addedAt: new Date("2024-02-05"),
    lastSalePrice: 3.8,
    chainId: apeChainCurtis.id,
  },
  {
    id: "w6",
    userId: "mock_crypto_collector",
    contractAddress: "0x1A92f7381B9F03921564a437210bB9396471050C",
    tokenId: "1357",
    name: "Cool Cat #1357",
    image: "https://picsum.photos/400/400?random=9006",
    collection: "Cool Cats NFT",
    addedAt: new Date("2024-02-10"),
    lastSalePrice: 2.4,
    chainId: sepolia.id,
  },
  {
    id: "w7",
    userId: "mock_crypto_collector",
    contractAddress: "0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6",
    tokenId: "9876",
    name: "CryptoPunk #9876",
    image: "https://picsum.photos/400/400?random=9007",
    collection: "CryptoPunks",
    addedAt: new Date("2024-02-12"),
    lastSalePrice: 184.5,
    chainId: apeChainCurtis.id,
  },
  {
    id: "w8",
    userId: "mock_crypto_collector",
    contractAddress: "0x49cF6f5d44E70224e2E23fDcdd2C053F30aDA28B",
    tokenId: "5432",
    name: "Clone X #5432",
    image: "https://picsum.photos/400/400?random=9008",
    collection: "Clone X - X Takashi Murakami",
    addedAt: new Date("2024-02-15"),
    lastSalePrice: 12.6,
    chainId: sepolia.id,
  }
]

const mockPortfolio: PortfolioNFT[] = [
  {
    contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
    tokenId: "9876",
    name: "Bored Ape #9876",
    image: "https://picsum.photos/400/400?random=1",
    collection: "Bored Ape Yacht Club",
    acquiredAt: new Date("2023-12-01"),
    estimatedValue: 45.5,
    rarity: "3",
    lastSalePrice: 42.0,
    chainId: apeChainCurtis.id,
    listing: {
      type: "sale",
      sale: {
        price: 45.5,
        lastSalePrice: 42.0
      }
    }
  },
  {
    contractAddress: "0x23581767a106ae21c074b2276D25e5C3e136a68b",
    tokenId: "1111",
    name: "Moonbirds #1111",
    image: "https://picsum.photos/400/400?random=2",
    collection: "Moonbirds",
    acquiredAt: new Date("2023-11-15"),
    estimatedValue: 12.3,
    rarity: "5",
    lastSalePrice: 11.8,
    chainId: sepolia.id,
    listing: {
      type: "rent",
      rent: {
        pricePerDay: 2.5,
        minDays: 1,
        maxDays: 30
      }
    }
  },
  {
    contractAddress: "0x60E4d786628Fea6478F785A6d7e704777c86a7c6",
    tokenId: "2222",
    name: "Mutant Ape #2222",
    image: "https://picsum.photos/400/400?random=3",
    collection: "Mutant Ape Yacht Club",
    acquiredAt: new Date("2023-10-10"),
    estimatedValue: 8.7,
    rarity: "2",
    lastSalePrice: 8.2,
    chainId: apeChainCurtis.id,
    listing: {
      type: "swap",
      swap: {
        wantedCollection: "CryptoPunks",
        wantedTokenId: "Any",
        wantedTraits: ["Alien", "Laser Eyes", "Any"]
      }
    }
  },
  {
    contractAddress: "0xED5AF388653567Af2F388E6224dC7C4b3241C544",
    tokenId: "3333",
    name: "Azuki #3333",
    image: "https://picsum.photos/400/400?random=4",
    collection: "Azuki",
    acquiredAt: new Date("2023-09-05"),
    estimatedValue: 6.1,
    rarity: "1",
    lastSalePrice: 5.9,
    chainId: sepolia.id,
    listing: {
      type: "none"
    }
  },
  // Bundle NFTs
  {
    contractAddress: "0x1A92f7381B9F03921564a437210bB9396471050C",
    tokenId: "bundle-1",
    name: "Mixed Collection Bundle",
    image: "https://picsum.photos/400/400?random=5",
    collection: "Mixed Collections",
    acquiredAt: new Date("2023-08-01"),
    estimatedValue: 18.0,
    lastSalePrice: 16.5,
    chainId: apeChainCurtis.id,
    isBundle: true,
    bundleCount: 3,
    bundleItems: [
      {
        contractAddress: "0x1A92f7381B9F03921564a437210bB9396471050C",
        tokenId: "1001",
        name: "Cool Cat #1001",
        image: "https://picsum.photos/400/400?random=5001",
        collection: "Cool Cats NFT",
        acquiredAt: new Date("2023-08-01"),
        estimatedValue: 6.0,
        rarity: "2",
        chainId: apeChainCurtis.id
      },
      {
        contractAddress: "0x23581767a106ae21c074b2276D25e5C3e136a68b",
        tokenId: "2001",
        name: "Moonbird #2001",
        image: "https://picsum.photos/400/400?random=5002",
        collection: "Moonbirds",
        acquiredAt: new Date("2023-08-01"),
        estimatedValue: 6.5,
        rarity: "3",
        chainId: apeChainCurtis.id
      },
      {
        contractAddress: "0xED5AF388653567Af2F388E6224dC7C4b3241C544",
        tokenId: "3001",
        name: "Azuki #3001",
        image: "https://picsum.photos/400/400?random=5003",
        collection: "Azuki",
        acquiredAt: new Date("2023-08-01"),
        estimatedValue: 5.5,
        rarity: "1",
        chainId: apeChainCurtis.id
      }
    ],
    listing: {
      type: "sale",
      sale: {
        price: 18.0,
        lastSalePrice: 16.5
      }
    }
  },
  {
    contractAddress: "0x524cAB2ec69124574082676e6F654a18df49A048",
    tokenId: "bundle-2",
    name: "Blue Chip Bundle",
    image: "https://picsum.photos/400/400?random=6",
    collection: "Mixed Collections",
    acquiredAt: new Date("2023-07-15"),
    estimatedValue: 25.8,
    lastSalePrice: 24.2,
    chainId: sepolia.id,
    isBundle: true,
    bundleCount: 5,
    bundleItems: [
      {
        contractAddress: "0x524cAB2ec69124574082676e6F654a18df49A048",
        tokenId: "2001",
        name: "Doodle #2001",
        image: "https://picsum.photos/400/400?random=6001",
        collection: "Doodles",
        acquiredAt: new Date("2023-07-15"),
        estimatedValue: 5.2,
        rarity: "1",
        chainId: sepolia.id
      },
      {
        contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
        tokenId: "4001",
        name: "Bored Ape #4001",
        image: "https://picsum.photos/400/400?random=6002",
        collection: "Bored Ape Yacht Club",
        acquiredAt: new Date("2023-07-15"),
        estimatedValue: 4.8,
        rarity: "2",
        chainId: sepolia.id
      },
      {
        contractAddress: "0x60E4d786628Fea6478F785A6d7e704777c86a7c6",
        tokenId: "5001",
        name: "Mutant Ape #5001",
        image: "https://picsum.photos/400/400?random=6003",
        collection: "Mutant Ape Yacht Club",
        acquiredAt: new Date("2023-07-15"),
        estimatedValue: 5.1,
        rarity: "3",
        chainId: sepolia.id
      },
      {
        contractAddress: "0xED5AF388653567Af2F388E6224dC7C4b3241C544",
        tokenId: "6001",
        name: "Azuki #6001",
        image: "https://picsum.photos/400/400?random=6004",
        collection: "Azuki",
        acquiredAt: new Date("2023-07-15"),
        estimatedValue: 5.4,
        rarity: "2",
        chainId: sepolia.id
      },
      {
        contractAddress: "0x1A92f7381B9F03921564a437210bB9396471050C",
        tokenId: "7001",
        name: "Cool Cat #7001",
        image: "https://picsum.photos/400/400?random=6005",
        collection: "Cool Cats NFT",
        acquiredAt: new Date("2023-07-15"),
        estimatedValue: 5.3,
        rarity: "4",
        chainId: sepolia.id
      }
    ],
    listing: {
      type: "rent",
      rent: {
        pricePerDay: 4.0,
        minDays: 3,
        maxDays: 14
      }
    }
  },
  {
    contractAddress: "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
    tokenId: "bundle-3",
    name: "BAYC Rare Bundle",
    image: "https://picsum.photos/400/400?random=7",
    collection: "Bored Ape Yacht Club",
    acquiredAt: new Date("2023-06-10"),
    estimatedValue: 120.5,
    lastSalePrice: 115.0,
    chainId: apeChainCurtis.id,
    isBundle: true,
    bundleCount: 2,
    bundleItems: [
      {
        contractAddress: "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
        tokenId: "3001",
        name: "Bored Ape #3001",
        image: "https://picsum.photos/400/400?random=7001",
        collection: "Bored Ape Yacht Club",
        acquiredAt: new Date("2023-06-10"),
        estimatedValue: 62.0,
        rarity: "1",
        chainId: apeChainCurtis.id
      },
      {
        contractAddress: "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
        tokenId: "3002",
        name: "Bored Ape #3002",
        image: "https://picsum.photos/400/400?random=7002",
        collection: "Bored Ape Yacht Club",
        acquiredAt: new Date("2023-06-10"),
        estimatedValue: 58.5,
        rarity: "1",
        chainId: apeChainCurtis.id
      }
    ],
    listing: {
      type: "swap",
      swap: {
        wantedCollection: "CryptoPunks",
        wantedTokenId: "Any",
        wantedTraits: ["Zombie", "Any", "Any"]
      }
    }
  }
]

const mockTreasuries: Treasury[] = [
  {
    id: "treasury-1",
    userId: "mock_crypto_collector",
    name: "BAYC Legends",
    description: "Elite group of Bored Ape holders collaborating on blue-chip NFT investments and trading strategies.",
    nfts: mockPortfolio.slice(0, 3),
    isPublic: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date(),
  },
  {
    id: "treasury-2",
    userId: "mock_crypto_collector",
    name: "Crypto Punks Alliance",
    description: "Private Treasury for CryptoPunks collectors focused on rare trait acquisitions.",
    nfts: mockPortfolio.slice(2, 4),
    isPublic: false,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date(),
  },
  {
    id: "treasury-3",
    userId: "mock_crypto_collector",
    name: "Azuki Collective",
    description: "Community Treasury for Azuki holders building the future of digital culture.",
    nfts: mockPortfolio.slice(1, 3),
    isPublic: true,
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date(),
  }
]

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [watchlist, setWatchlist] = useState<NFTWatchlistItem[]>([])
  const [following, setFollowing] = useState<string[]>([])
  const [followers, setFollowers] = useState<string[]>([]) // Track follower IDs
  const [portfolio, setPortfolio] = useState<PortfolioNFT[]>([])
  const [treasuries, setTreasuries] = useState<Treasury[]>([])
  const [loading, setLoading] = useState(false)

  // Get the active wallet chain (supports mainnet and testnet)
  const activeChain = useActiveWalletChain()
  const chainId = activeChain?.id || apeChain.id // Default to mainnet

  // Determine if this is the demo profile
  const isDemoProfile = userProfile?.username === "crypto_collector"

  // Calculate dynamic follower/following lists
  const followingUsers = mockProfiles.filter(p => following.includes(p.id))
  const followerUsers = mockProfiles.filter(p => followers.includes(p.id))

  const profileTabData: ProfileTabData = {
    portfolio: isDemoProfile ? mockPortfolio : portfolio,
    treasuries: isDemoProfile ? mockTreasuries : treasuries,
    watchlist: isDemoProfile ? mockWatchlist : watchlist,
    following: followingUsers,
    followers: followerUsers,
  }

  // Update profile counts dynamically whenever they change
  useEffect(() => {
    if (userProfile && !isDemoProfile) {
      const newFollowingCount = following.length
      const newFollowersCount = followers.length

      // Only update if counts have actually changed
      if (
        userProfile.followingCount !== newFollowingCount ||
        userProfile.followersCount !== newFollowersCount
      ) {
        setUserProfile(prev => prev ? {
          ...prev,
          followingCount: newFollowingCount,
          followersCount: newFollowersCount,
        } : null)
      }
    }
  }, [following.length, followers.length, isDemoProfile])

  const isFollowing = (userId: string): boolean => {
    return following.includes(userId)
  }

  const followUser = async (userId: string): Promise<void> => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setFollowing(prev => [...prev, userId])
      // Count will be updated automatically by useEffect
    } catch (error) {
      console.error("Failed to follow user:", error)
    } finally {
      setLoading(false)
    }
  }

  const unfollowUser = async (userId: string): Promise<void> => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setFollowing(prev => prev.filter(id => id !== userId))
      // Count will be updated automatically by useEffect
    } catch (error) {
      console.error("Failed to unfollow user:", error)
    } finally {
      setLoading(false)
    }
  }

  const addToWatchlist = async (nft: Omit<NFTWatchlistItem, 'id' | 'userId' | 'addedAt'>): Promise<void> => {
    if (!userProfile) return

    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      const newItem: NFTWatchlistItem = {
        ...nft,
        id: `w${Date.now()}`,
        userId: userProfile.id,
        addedAt: new Date(),
      }
      setWatchlist(prev => [...prev, newItem])
    } catch (error) {
      console.error("Failed to add to watchlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromWatchlist = async (nftId: string): Promise<void> => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      // nftId can be either the actual item.id or contractAddress-tokenId format
      setWatchlist(prev => prev.filter(item => {
        const compositeId = `${item.contractAddress}-${item.tokenId}`
        return item.id !== nftId && compositeId !== nftId
      }))
    } catch (error) {
      console.error("Failed to remove from watchlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const isInWatchlist = (contractAddress: string, tokenId: string): boolean => {
    return watchlist.some(item =>
      item.contractAddress === contractAddress && item.tokenId === tokenId
    )
  }

  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    console.log("🔄 updateProfile called with:", Object.keys(updates))

    if (!userProfile) {
      console.error("❌ No userProfile available")
      return
    }

    // Don't update demo profile
    if (isDemoProfile) {
      console.log("❌ Cannot update demo profile")
      return
    }

    const usernameChanged = updates.username && updates.username !== userProfile.username
    console.log("Username changed?", usernameChanged)

    setLoading(true)
    console.log("🔄 Loading state set to true")

    try {
      // Import ProfileService dynamically
      const { ProfileService } = await import("@/lib/profile-service")

      // Update in ProfileService (localStorage)
      console.log("🔄 Calling ProfileService.updateProfile...")
      const updatedProfile = await ProfileService.updateProfile(userProfile.id, updates)

      if (updatedProfile) {
        // Update local state
        setUserProfile(updatedProfile)
        console.log("✅ Profile updated successfully:", updatedProfile.username)

        // Update AuthProvider user if username or avatar changed
        if (typeof window !== 'undefined') {
          const savedUser = localStorage.getItem("fortuna_square_user")
          if (savedUser) {
            const user = JSON.parse(savedUser)
            const userUpdates: any = {}
            if (updates.username) userUpdates.username = updates.username
            if (updates.avatar) userUpdates.avatar = updates.avatar

            if (Object.keys(userUpdates).length > 0) {
              const updatedUser = { ...user, ...userUpdates }
              localStorage.setItem("fortuna_square_user", JSON.stringify(updatedUser))
              console.log("✅ Synced user data to AuthProvider")

              // Dispatch custom event to notify AuthProvider of changes
              window.dispatchEvent(new Event("userUpdated"))
            }
          }
        }

        // Reset loading state before potential reload
        console.log("✅ Setting loading to false")
        setLoading(false)

        // Only reload if username changed (affects URL routing)
        // This happens AFTER successful save and loading reset
        if (usernameChanged) {
          console.log("🔄 Username changed, reloading page...")
          setTimeout(() => {
            window.location.href = `/profile/${updatedProfile.username}`
          }, 200)
        }
      } else {
        console.error("❌ No updated profile returned")
        setLoading(false)
      }
    } catch (error) {
      console.error("❌ Failed to update profile:", error)
      setLoading(false)
      throw error
    }
  }

  // Fetch real NFTs from all linked wallets (for non-demo profiles)
  useEffect(() => {
    const fetchWalletNFTs = async () => {
      if (!userProfile || isDemoProfile) return

      // Get all wallets to fetch from
      const { ProfileService } = await import("@/lib/profile-service")
      const allWallets = ProfileService.getAllWallets(userProfile)

      if (allWallets.length === 0) return

      // Import portfolio cache
      const { portfolioCache } = await import("@/lib/portfolio-cache")

      // Check cache first (stale-while-revalidate)
      const { data: cachedData, shouldRefresh } = portfolioCache.get(allWallets)

      if (cachedData) {
        console.log(`📦 Loading portfolio from cache (${cachedData.length} NFTs)`)
        setPortfolio(cachedData)
        setLoading(false)

        // If data is fresh, we're done!
        if (!shouldRefresh) {
          console.log(`✅ Portfolio cache is fresh, no refresh needed`)
          return
        }

        // If data is stale, continue to fetch in background
        console.log(`🔄 Portfolio cache is stale, fetching fresh data in background...`)
      } else {
        // No cache, show loading state
        setLoading(true)
      }

      try {
        console.log(`Fetching NFTs from ${allWallets.length} linked wallet(s):`, allWallets)

        // Fetch NFTs from all wallets in parallel
        const fetchPromises = allWallets.map(async (walletAddress) => {
          try {
            const response = await fetch(`/api/wallet-nfts?address=${walletAddress}&chainId=${chainId}`)

            if (!response.ok) {
              console.warn(`Failed to fetch NFTs for ${walletAddress}:`, response.statusText)
              return []
            }

            const data = await response.json()
            console.log(`Fetched ${data.nfts?.length || 0} NFTs for wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`)

            // Map the NFT data to our PortfolioNFT format with owner wallet
            const nfts = await Promise.all((data.nfts || []).map(async (nft: any) => {
              // Import bundle utilities dynamically
              const { BUNDLE_CONTRACT_ADDRESSES, getBundleMetadata, getBundleAccountAddress } = await import("@/lib/bundle")
              const { bundlePreviewCache } = await import("@/lib/bundle-preview-cache")
              const { client, apeChain, apeChainCurtis } = await import("@/lib/thirdweb")

              // Determine which chain to use (mainnet or testnet)
              const nftChain = chainId === apeChain.id ? apeChain : apeChainCurtis

              // Check if this is a bundle NFT
              const bundleNFTAddress = BUNDLE_CONTRACT_ADDRESSES[chainId]?.bundleNFT?.toLowerCase()
              const isBundleNFT = nft.contractAddress.toLowerCase() === bundleNFTAddress

              // Base NFT data
              const baseNFT = {
                contractAddress: nft.contractAddress,
                tokenId: nft.tokenId,
                name: nft.name || `Token #${nft.tokenId}`,
                image: nft.image,
                collection: nft.collectionName || 'Unknown Collection',
                chainId: nft.chainId || chainId,
                acquiredAt: new Date(),
                estimatedValue: 0,
                rarity: undefined,
                lastSalePrice: undefined,
                listing: { type: "none" as const },
                ownerWallet: walletAddress,
                isBundle: false,
              }

              // If it's a bundle NFT, fetch bundle metadata and preview images
              if (isBundleNFT) {
                try {
                  console.log(`📦 Detected bundle NFT: ${nft.tokenId}`)

                  // Fetch bundle metadata
                  const bundleMetadata = await getBundleMetadata(client, nftChain, nft.tokenId)

                  if (bundleMetadata) {
                    console.log(`✅ Bundle metadata fetched:`, bundleMetadata)

                    // Try to parse thumbnails from NFT metadata (tokenURI)
                    let previewImages: Array<{ image: string; name: string; tokenId: string }> = []

                    // Check if NFT has metadata property (from ThirdWeb)
                    if (nft.metadata) {
                      try {
                        // ThirdWeb returns metadata as object
                        const metadata = typeof nft.metadata === 'string' ? JSON.parse(nft.metadata) : nft.metadata

                        if (metadata.properties?.thumbnails && Array.isArray(metadata.properties.thumbnails)) {
                          previewImages = metadata.properties.thumbnails
                          console.log(`✅ Loaded ${previewImages.length} thumbnails from bundle metadata`)
                        }
                      } catch (parseError) {
                        console.warn(`⚠️ Could not parse bundle metadata:`, parseError)
                      }
                    }

                    // Fallback: If no thumbnails in metadata, use cached or fetch from TBA
                    if (previewImages.length === 0) {
                      previewImages = bundlePreviewCache.get(nft.contractAddress, nft.tokenId) || []

                      // Last resort: fetch from TBA (only if no cache)
                      if (previewImages.length === 0) {
                        try {
                          const tbaAddress = await getBundleAccountAddress(client, nftChain, nft.tokenId)
                          console.log(`📍 Fetching preview images from TBA as fallback: ${tbaAddress}`)

                          const response = await fetch(`/api/wallet-nfts?address=${tbaAddress}&chainId=${nft.chainId || chainId}`)

                          if (response.ok) {
                            const data = await response.json()
                            previewImages = (data.nfts || []).slice(0, 3).map((item: any) => ({
                              image: item.image || "/placeholder.svg",
                              name: item.name || `Token #${item.tokenId}`,
                              tokenId: item.tokenId,
                            }))

                            bundlePreviewCache.set(nft.contractAddress, nft.tokenId, previewImages)
                            console.log(`✅ Cached ${previewImages.length} preview images from TBA`)
                          }
                        } catch (previewError) {
                          console.error(`❌ Error fetching TBA preview images:`, previewError)
                        }
                      }
                    }

                    return {
                      ...baseNFT,
                      isBundle: true,
                      bundleCount: bundleMetadata.itemCount,
                      name: bundleMetadata.name || baseNFT.name,
                      image: nft.image, // Use cover image from metadata
                      bundlePreviewImages: previewImages,
                    }
                  }
                } catch (error) {
                  console.error(`❌ Error fetching bundle metadata for token ${nft.tokenId}:`, error)
                }
              }

              return baseNFT
            }))

            return nfts
          } catch (error) {
            console.error(`Error fetching NFTs for ${walletAddress}:`, error)
            return []
          }
        })

        const allNFTs = await Promise.all(fetchPromises)
        let combinedNFTs = allNFTs.flat()

        // Fetch marketplace listings and merge with NFT data
        try {
          const { getAllListings } = await import("@/lib/marketplace")
          const listings = await getAllListings()
          console.log(`📋 Fetched ${listings.length} marketplace listings`)

          // Create a map of listings by contract + tokenId
          const listingMap = new Map()
          listings.forEach((listing: any) => {
            const key = `${listing.nftContract.toLowerCase()}-${listing.tokenId.toString()}`
            // Only include active listings
            if (listing.active) {
              listingMap.set(key, listing)
            }
          })

          // Merge listings into NFTs
          combinedNFTs = combinedNFTs.map(nft => {
            const key = `${nft.contractAddress.toLowerCase()}-${nft.tokenId}`
            const listing = listingMap.get(key)

            if (listing) {
              const priceInEth = Number(listing.pricePerToken) / 1e18
              return {
                ...nft,
                listing: {
                  type: "sale" as const,
                  listingId: listing.listingId,
                  sale: {
                    price: priceInEth,
                    lastSalePrice: nft.lastSalePrice,
                    seller: listing.seller
                  }
                }
              }
            }

            return nft
          })

          console.log(`✅ Merged ${listingMap.size} active listings with NFT data`)
        } catch (error) {
          console.error("Failed to fetch marketplace listings:", error)
        }

        console.log(`✅ Total NFTs fetched from all wallets: ${combinedNFTs.length}`)

        // Cache the fresh portfolio data
        const { portfolioCache } = await import("@/lib/portfolio-cache")
        portfolioCache.set(allWallets, combinedNFTs)
        console.log(`💾 Cached portfolio with ${combinedNFTs.length} NFTs`)

        setPortfolio(combinedNFTs)
      } catch (error) {
        console.error("Failed to fetch wallet NFTs:", error)
        // Don't overwrite cached data on error if we already have it
        if (!cachedData) {
          setPortfolio([])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchWalletNFTs()
  }, [userProfile?.id, userProfile?.linkedWallets, isDemoProfile])

  // Refresh profile from ProfileService
  const refreshProfile = async () => {
    if (!userProfile || isDemoProfile) return

    try {
      const { ProfileService } = await import("@/lib/profile-service")
      const updatedProfile = ProfileService.getProfile(userProfile.id)

      if (updatedProfile) {
        setUserProfile(updatedProfile)
        console.log("✅ Profile refreshed from ProfileService")
      }
    } catch (error) {
      console.error("Failed to refresh profile:", error)
    }
  }

  // Auto-initialize profile from current logged-in user
  useEffect(() => {
    const loadUserProfile = async () => {
      if (typeof window === 'undefined') return

      // Get current logged-in user from AuthProvider
      const savedUser = localStorage.getItem("fortuna_square_user")
      if (!savedUser) {
        setUserProfile(null)
        return
      }

      try {
        const user = JSON.parse(savedUser)
        const { ProfileService } = await import("@/lib/profile-service")

        // Load profile by user ID
        const profile = ProfileService.getProfile(user.id)

        if (profile) {
          setUserProfile(profile)
          console.log("✅ Auto-loaded userProfile for:", profile.username)
        } else {
          console.warn("⚠️ User logged in but no profile found:", user.id)
        }
      } catch (error) {
        console.error("Failed to load user profile:", error)
      }
    }

    loadUserProfile()

    // Listen for user changes from AuthProvider
    const handleUserUpdated = () => {
      loadUserProfile()
    }

    window.addEventListener("userUpdated", handleUserUpdated)
    window.addEventListener("storage", handleUserUpdated)

    return () => {
      window.removeEventListener("userUpdated", handleUserUpdated)
      window.removeEventListener("storage", handleUserUpdated)
    }
  }, [])

  return (
    <ProfileContext.Provider value={{
      userProfile,
      setUserProfile,
      profileTabData,
      isFollowing,
      followUser,
      unfollowUser,
      addToWatchlist,
      removeFromWatchlist,
      isInWatchlist,
      updateProfile,
      refreshProfile,
      loading,
    }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
}