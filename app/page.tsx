"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ClearStorageButton } from "@/components/debug/clear-storage"
import { apeChain, sepolia, CHAIN_METADATA } from "@/lib/thirdweb"
import { ChainBadge } from "@/components/ui/chain-badge"
import { ProfileService } from "@/lib/profile-service"
import {
  ArrowRight,
  TrendingUp,
  Package,
  Crown,
  ChevronRight,
  ChevronLeft,
  Globe,
  Filter,
  CheckCircle,
  ArrowLeftRight,
  Calendar
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [sortBy, setSortBy] = useState("nfts")
  const [selectedChain, setSelectedChain] = useState<"all" | number>("all")
  const [activeUsers, setActiveUsers] = useState<any[]>([])

  // Real ApeChain Collections - Top 4 by volume/popularity
  const featuredCollections = [
    {
      name: "Gs on Ape",
      slug: "gs-on-ape",
      image: "https://img.reservoir.tools/images/v2/apechain/khnv7QtJSsXhx7z5lxeoZ%2BmzCCQGhdyVqrJE1owET60HbyBkWWTaY21CXMSoiGCmcgYw%2Bcd%2BAar2SvDz%2FjghdmVXHZIkRerllKXYROZFSzfoSIPVzVfZUAkUJQ66rEUW8Y4ZiC%2Bejmjp%2BPbbJ8Tei8xYX%2Fk4H5r9OPp8lBsN8iGA51FqLezPvR3u%2BYyogGpzUT03ggnVTyz2BQkvEALHyQ%3D%3D",
      description: "Top ApeChain collection with strong community and high trading volume.",
      floorPrice: "933 APE",
      volume24h: "High volume",
      totalSupply: "5,555",
      verified: true,
      chainId: apeChain.id
    },
    {
      name: "Gobs on Ape",
      slug: "gobs-on-ape",
      image: "https://img.reservoir.tools/images/v2/apechain/DncmTLTvq%2BRfs1SNWS7xb3W80HdqFd%2BoYMeOUwTra2ye%2BUwz1y9U8W5XFAoxDsUlPLNNkWoEVMZnAoBlOkC5LxSYrDbzN2R1xVehQq1ycL5EK9FRylVwRFKnGPxGwW25",
      description: "2,222 unique PFP avatars released January 2025. Part of ApeChain's Spotlight Loyalty Program.",
      floorPrice: "878 APE",
      volume24h: "5M APE Total Volume",
      totalSupply: "2,222",
      verified: true,
      chainId: apeChain.id
    },
    {
      name: "NightGlyders",
      slug: "nightglyders",
      image: "https://img.reservoir.tools/images/v2/apechain/PZM0PawAvg1wACQh74OVUNpeZ1BHv09aPUzMjOBb0BiV674czOLfcFGFDOovprNYhSo%2BvA8WRGvg2PgniGTqKA%3D%3D",
      description: "3,333 NFTs rooted in the magic of the Notca Fruit's rupture. Unique traits and mystical powers.",
      floorPrice: "170 APE",
      volume24h: "4,422 APE (24h)",
      totalSupply: "3,333",
      verified: true,
      chainId: apeChain.id
    },
    {
      name: "Zards",
      slug: "zards",
      image: "https://img.reservoir.tools/images/v2/apechain/WOC71RNEaE4WFlvhixBQzuChqBni4cdl%2BREGqHDpEpJ%2B59gK6eLhYwtBlJyqxC8ug%2BAnh6nQzlQYitiXWtDo0g%3D%3D",
      description: "5,000 pixelated wizards with magical powers. Soft stake to earn Magic Points and boost rarity!",
      floorPrice: "66 APE",
      volume24h: "349K APE Total Volume",
      totalSupply: "4,999",
      verified: true,
      chainId: apeChain.id
    }
  ]

  // Load active users from Supabase database
  useEffect(() => {
    async function loadProfiles() {
      try {
        const profiles = await ProfileService.getAllProfilesFromDatabase()
        setActiveUsers(profiles)
      } catch (error) {
        console.error('Failed to load profiles from database:', error)
        // Fallback to localStorage if database fails
        const localProfiles = localStorage.getItem("fortuna_square_profiles")
        if (localProfiles) {
          const allProfiles = JSON.parse(localProfiles)
          setActiveUsers(Object.values(allProfiles))
        }
      }
    }
    loadProfiles()
  }, [])

  // Auto-advance slideshow every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredCollections.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [featuredCollections.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredCollections.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredCollections.length) % featuredCollections.length)
  }

  const collections = [
    // ApeChain Curtis Collections
    {
      name: "Bored Ape Yacht Club",
      image: "https://picsum.photos/100/100?random=bayc",
      floorPrice: "12.5",
      volume24h: "234.7",
      bundlesCreated: 234,
      holders: 6425,
      totalSupply: 10000,
      itemsListed: 892,
      verified: true,
      change24h: "+5.2",
      chainId: apeChain.id,
      currency: "APE"
    },
    {
      name: "Azuki",
      image: "https://picsum.photos/100/100?random=azuki",
      floorPrice: "8.2",
      volume24h: "567.3",
      bundlesCreated: 189,
      holders: 5234,
      totalSupply: 10000,
      itemsListed: 1243,
      verified: true,
      change24h: "-2.1",
      chainId: apeChain.id,
      currency: "APE"
    },
    {
      name: "Doodles",
      image: "https://picsum.photos/100/100?random=doodles",
      floorPrice: "4.3",
      volume24h: "289.4",
      bundlesCreated: 156,
      holders: 3842,
      totalSupply: 10000,
      itemsListed: 634,
      verified: true,
      change24h: "+3.7",
      chainId: apeChain.id,
      currency: "APE"
    },
    {
      name: "Pudgy Penguins",
      image: "https://picsum.photos/100/100?random=pudgy",
      floorPrice: "5.6",
      volume24h: "345.9",
      bundlesCreated: 203,
      holders: 4156,
      totalSupply: 8888,
      itemsListed: 723,
      verified: true,
      change24h: "+4.1",
      chainId: apeChain.id,
      currency: "APE"
    },
    // Ethereum Sepolia Collections
    {
      name: "CryptoPunks",
      image: "https://picsum.photos/100/100?random=punks",
      floorPrice: "0.048",
      volume24h: "1.234",
      bundlesCreated: 567,
      holders: 3812,
      totalSupply: 10000,
      itemsListed: 421,
      verified: true,
      change24h: "+12.8",
      chainId: sepolia.id,
      currency: "ETH"
    },
    {
      name: "Moonbirds",
      image: "https://picsum.photos/100/100?random=moonbirds",
      floorPrice: "0.032",
      volume24h: "0.423",
      bundlesCreated: 312,
      holders: 4521,
      totalSupply: 10000,
      itemsListed: 987,
      verified: true,
      change24h: "+8.4",
      chainId: sepolia.id,
      currency: "ETH"
    },
    {
      name: "Clone X",
      image: "https://picsum.photos/100/100?random=clonex",
      floorPrice: "0.038",
      volume24h: "0.512",
      bundlesCreated: 278,
      holders: 4923,
      totalSupply: 20000,
      itemsListed: 1432,
      verified: true,
      change24h: "+6.2",
      chainId: sepolia.id,
      currency: "ETH"
    },
    {
      name: "Cool Cats",
      image: "https://picsum.photos/100/100?random=coolcats",
      floorPrice: "0.025",
      volume24h: "0.198",
      bundlesCreated: 134,
      holders: 3421,
      totalSupply: 9999,
      itemsListed: 512,
      verified: true,
      change24h: "-1.3",
      chainId: sepolia.id,
      currency: "ETH"
    }
  ]

  // Filter collections by chain
  const filteredCollections = selectedChain === "all"
    ? collections
    : collections.filter(c => c.chainId === selectedChain)

  const sortedCollections = [...filteredCollections].sort((a, b) => {
    switch (sortBy) {
      case "floor":
        return parseFloat(b.floorPrice) - parseFloat(a.floorPrice)
      case "volume":
        return parseFloat(b.volume24h) - parseFloat(a.volume24h)
      case "bundles":
        return b.bundlesCreated - a.bundlesCreated
      case "holders":
        return b.holders - a.holders
      default:
        return 0
    }
  })

  const totalBundles = filteredCollections.reduce((sum, c) => sum + c.bundlesCreated, 0)
  const totalTreasuries = 47 // Mock treasury count
  const curtisCollections = collections.filter(c => c.chainId === apeChain.id).length
  const sepoliaCollections = collections.filter(c => c.chainId === sepolia.id).length

  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Header />

      {/* Featured Collections Slideshow */}
      <section className="relative py-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

        <div className="container mx-auto px-4 relative">
          <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-card/30 backdrop-blur-xl">
            {/* Slideshow */}
            <div className="relative h-[400px] md:h-[500px]">
              {featuredCollections.map((collection, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentSlide ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <Link href={`/collections/${collection.slug}`} className="block w-full h-full">
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                  </Link>

                  {/* Slide Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                    <div className="max-w-4xl">
                      <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-3xl md:text-5xl font-bold text-white neon-text">
                          {collection.name}
                        </h2>
                        {collection.verified && (
                          <CheckCircle className="h-8 w-8 text-primary fill-primary/20" />
                        )}
                        <ChainBadge chainId={collection.chainId} size="lg" />
                      </div>
                      <p className="text-lg md:text-xl text-gray-200 mb-6 max-w-2xl">
                        {collection.description}
                      </p>
                      <div className="flex flex-wrap gap-6 mb-6">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Floor Price</p>
                          <p className="text-2xl font-bold text-primary neon-text">{collection.floorPrice}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Total Supply</p>
                          <p className="text-2xl font-bold text-secondary neon-text">{collection.totalSupply}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Volume</p>
                          <p className="text-xl font-bold text-cyan-400 neon-text">{collection.volume24h}</p>
                        </div>
                      </div>
                      <Button
                        className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 neon-glow"
                        asChild
                      >
                        <Link href={`/collections/${collection.slug}`}>
                          View Collection
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-background/80 border border-border/50 hover:bg-background hover:border-primary/50 transition-all neon-glow"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-background/80 border border-border/50 hover:bg-background hover:border-primary/50 transition-all neon-glow"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {featuredCollections.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? "bg-primary w-8 neon-glow"
                      : "bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Platform Activity Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
            <Card className="bg-card/50 border-border/50 hover:border-orange-500/30 transition-all">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-400 neon-text mb-1">0</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center">
                  <Package className="mr-1 h-4 w-4" />
                  Bundles Created
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50 hover:border-red-500/30 transition-all">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-red-400 neon-text mb-1">0</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center">
                  <Package className="mr-1 h-4 w-4 rotate-180" />
                  Bundles Unwrapped
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50 hover:border-yellow-500/30 transition-all">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-yellow-400 neon-text mb-1">0</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center">
                  <Crown className="mr-1 h-4 w-4" />
                  Treasuries Created
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50 hover:border-purple-500/30 transition-all">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-400 neon-text mb-1">0</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center">
                  <ArrowLeftRight className="mr-1 h-4 w-4" />
                  Swaps Completed
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50 hover:border-cyan-500/30 transition-all">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-cyan-400 neon-text mb-1">0</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  Active Rentals
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testing Mode Banner */}
      <div className="container mx-auto px-4 mb-8">
        <Card className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border-yellow-500/30">
          <CardContent className="p-4 flex items-center justify-center gap-3">
            <div className="animate-pulse h-3 w-3 bg-yellow-500 rounded-full" />
            <p className="text-center font-medium">
              🧪 <span className="text-yellow-400">TESTING MODE</span> - Find and follow other testers below to explore the platform together!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Users / Testers List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Active Testers
              </h2>
              <p className="text-muted-foreground">
                {activeUsers.length} {activeUsers.length === 1 ? 'tester' : 'testers'} on the platform - Connect and explore together!
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-card/50 border-border/50">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-xl border-border/50">
                  <SelectItem value="recent">Recently Joined</SelectItem>
                  <SelectItem value="nfts">Most NFTs</SelectItem>
                  <SelectItem value="followers">Most Followers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {activeUsers.length === 0 ? (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-bold mb-2">No Testers Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Be the first to create an account and start testing!
                </p>
                <Button className="bg-gradient-to-r from-primary to-secondary" asChild>
                  <Link href="/auth/signup">Create Account</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeUsers.map((user, index) => (
                <Link href={`/profile/${user.username}`} key={user.id}>
                  <Card className="bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 cursor-pointer h-full hover:scale-[1.02]">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="relative">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.username}
                              className="w-16 h-16 rounded-full object-cover border-2 border-primary/50"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-white">
                              {user.username[0].toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg truncate">{user.username}</h3>
                          </div>
                          {user.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {user.bio}
                            </p>
                          )}

                          {/* Stats */}
                          <div className="flex gap-4 text-sm">
                            <div>
                              <span className="font-bold text-primary">{user.followersCount || 0}</span>
                              <span className="text-muted-foreground ml-1">Followers</span>
                            </div>
                            <div>
                              <span className="font-bold text-secondary">{user.followingCount || 0}</span>
                              <span className="text-muted-foreground ml-1">Following</span>
                            </div>
                          </div>

                          {/* Join Date */}
                          {user.createdAt && (
                            <div className="mt-3 flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                Joined {new Date(user.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="mt-4 pt-4 border-t border-border/50 flex justify-end">
                        <Button
                          size="default"
                          variant="outline"
                          className="border-primary/50 min-h-[44px]"
                          onClick={async (e) => {
                            e.preventDefault()
                            e.stopPropagation()

                            try {
                              // Get current logged-in user
                              const savedUser = localStorage.getItem('fortuna_square_user')
                              if (!savedUser) {
                                alert('Please log in to follow users')
                                return
                              }
                              const currentUser = JSON.parse(savedUser)

                              if (currentUser.id === user.id) {
                                alert('You cannot follow yourself')
                                return
                              }

                              // Check if already following
                              const { ProfileService } = await import('@/lib/profile-service')
                              const isFollowing = await ProfileService.isFollowing(currentUser.id, user.id)

                              if (isFollowing) {
                                await ProfileService.unfollowUser(currentUser.id, user.id)
                                alert(`Unfollowed ${user.username}`)
                              } else {
                                await ProfileService.followUser(currentUser.id, user.id)
                                alert(`Now following ${user.username}`)
                              }

                              // Reload profiles to get updated counts
                              const profiles = await ProfileService.getAllProfilesFromDatabase()
                              setActiveUsers(profiles)
                            } catch (error) {
                              console.error('Follow action failed:', error)
                              alert('Failed to update follow status')
                            }
                          }}
                        >
                          Follow
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {activeUsers.length > 0 && (
            <div className="mt-8 text-center">
              <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10" asChild>
                <Link href="/profiles">
                  View All Testers
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>


      <Footer />
      <ClearStorageButton />
    </div>
  )
}
