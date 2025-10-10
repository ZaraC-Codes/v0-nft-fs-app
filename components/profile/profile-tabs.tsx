"use client"

import { useState, lazy, Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Wallet,
  Vault,
  Eye,
  Users,
  UserPlus,
  Grid3x3,
  Heart,
  Trash2,
  ExternalLink,
  ShoppingCart,
  Calendar,
  ArrowLeftRight,
  Package,
  Plus
} from "lucide-react"
import { UserProfile, ProfileTab, PortfolioNFT } from "@/types/profile"
import { useProfile } from "./profile-provider"
import { WatchlistToggle } from "./add-to-watchlist"
import { SwapCriteria, NFTWithTraits } from "@/lib/nft-matching"
import Link from "next/link"
import { apeChain, sepolia, CHAIN_METADATA, getChainMetadata } from "@/lib/thirdweb"
import { ChainBadge } from "@/components/ui/chain-badge"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { NFTCardGrid } from "@/components/nft/cards/NFTCardGrid"

// Lazy load heavy modal components to reduce initial bundle size
const NFTDetailsModal = lazy(() => import("@/components/nft/nft-details-modal").then(m => ({ default: m.NFTDetailsModal })))
const SwapModal = lazy(() => import("@/components/swap/swap-modal").then(m => ({ default: m.SwapModal })))
const CreateSwapModal = lazy(() => import("@/components/swap/create-swap-modal").then(m => ({ default: m.CreateSwapModal })))
const CreateBundleModal = lazy(() => import("@/components/bundle/create-bundle-modal").then(m => ({ default: m.CreateBundleModal })))
const WrapForRentalModal = lazy(() => import("@/components/rental/wrap-for-rental-modal").then(m => ({ default: m.WrapForRentalModal })))
const CreateGroupModal = lazy(() => import("@/components/group/create-group-modal").then(m => ({ default: m.CreateGroupModal })))
const ListForSaleModal = lazy(() => import("@/components/marketplace/list-for-sale-modal").then(m => ({ default: m.ListForSaleModal })))
const BuyNFTModal = lazy(() => import("@/components/marketplace/buy-nft-modal").then(m => ({ default: m.BuyNFTModal })))

// Rarity color system - lower numbers = rarer
const getRarityColor = (rarity: string) => {
  const rarityNum = parseInt(rarity)
  if (rarityNum === 1) return "from-yellow-400 to-orange-500" // Legendary
  if (rarityNum === 2) return "from-purple-400 to-pink-500"   // Epic
  if (rarityNum === 3) return "from-blue-400 to-cyan-500"     // Rare
  if (rarityNum === 4) return "from-green-400 to-emerald-500" // Uncommon
  if (rarityNum === 5) return "from-gray-400 to-gray-500"     // Common
  return "from-gray-400 to-gray-500" // Default
}

interface ProfileTabsProps {
  profile: UserProfile
}

export function ProfileTabs({ profile }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("portfolio")
  const [selectedNFT, setSelectedNFT] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [swapModalOpen, setSwapModalOpen] = useState(false)
  const [createSwapModalOpen, setCreateSwapModalOpen] = useState(false)
  const [createBundleModalOpen, setCreateBundleModalOpen] = useState(false)
  const [wrapForRentalModalOpen, setWrapForRentalModalOpen] = useState(false)
  const [selectedNFTForRental, setSelectedNFTForRental] = useState<NFTWithTraits | null>(null)
  const [createTreasuryModalOpen, setCreateTreasuryModalOpen] = useState(false)
  const [listForSaleModalOpen, setListForSaleModalOpen] = useState(false)
  const [selectedNFTForSale, setSelectedNFTForSale] = useState<PortfolioNFT | null>(null)
  const [buyNFTModalOpen, setBuyNFTModalOpen] = useState(false)
  const [selectedNFTToBuy, setSelectedNFTToBuy] = useState<PortfolioNFT | null>(null)
  const [swapListingId, setSwapListingId] = useState<string>("")
  const [swapListedNFT, setSwapListedNFT] = useState<NFTWithTraits | null>(null)
  const [swapCriteria, setSwapCriteria] = useState<SwapCriteria | null>(null)
  const { profileTabData, removeFromWatchlist, loading } = useProfile()
  const { user } = useAuth()
  const { toast } = useToast()

  const handleNFTClick = (nft: any) => {
    setSelectedNFT(nft)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedNFT(null)
  }

  const handleSwapClick = (nft: any) => {
    if (!nft.listing?.swap) return

    // Generate a mock listing ID (in production, this would come from the blockchain)
    const listingId = `${nft.contractAddress}-${nft.tokenId}`

    // Create swap criteria from the listing
    const criteria: SwapCriteria = {
      wantedCollection: nft.listing.swap.wantedCollection,
      wantedTokenId: nft.listing.swap.wantedTokenId,
      wantedTraits: nft.listing.swap.wantedTraits,
      chainId: nft.chainId
    }

    setSwapListingId(listingId)
    setSwapListedNFT(nft as NFTWithTraits)
    setSwapCriteria(criteria)
    setSwapModalOpen(true)
  }

  const handleSwapModalClose = () => {
    setSwapModalOpen(false)
    setSwapListingId("")
    setSwapListedNFT(null)
    setSwapCriteria(null)
  }

  const tabs = [
    {
      id: "portfolio" as ProfileTab,
      label: "Portfolio",
      icon: Wallet,
      count: profileTabData.portfolio.length,
    },
    {
      id: "treasuries" as ProfileTab,
      label: "Treasuries",
      icon: Vault,
      count: profileTabData.treasuries.length,
    },
    {
      id: "watchlist" as ProfileTab,
      label: "Watchlist",
      icon: Eye,
      count: profileTabData.watchlist.length,
    },
    {
      id: "following" as ProfileTab,
      label: "Following",
      icon: UserPlus,
      count: profileTabData.following.length,
    },
    {
      id: "followers" as ProfileTab,
      label: "Followers",
      icon: Users,
      count: profileTabData.followers.length,
    },
  ]

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ProfileTab)}>
        <TabsList className="grid w-full grid-cols-5 bg-transparent border-b border-border/50">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center justify-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-4">
          <CardContent className="pt-6">
            {/* Action Buttons - only show if viewing own profile and has NFTs */}
            {user?.id === profile.id && profileTabData.portfolio.length > 0 && (
              <div className="mb-6 flex justify-end gap-3">
                <Button
                  onClick={() => setCreateBundleModalOpen(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 neon-glow"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Create Bundle
                </Button>
              </div>
            )}

            <NFTCardGrid
              nfts={profileTabData.portfolio}
              size="compact"
              onCardClick={handleNFTClick}
              onBuyClick={(nft) => {
                setSelectedNFTToBuy(nft)
                setBuyNFTModalOpen(true)
              }}
              onRentClick={(nft) => {
                // Handle rent action
                console.log("Rent clicked:", nft)
              }}
              onSwapClick={handleSwapClick}
              loading={loading}
              emptyMessage="No NFTs in portfolio"
              isOwner={user?.id === profile.id}
            />
          </CardContent>
        </TabsContent>

        {/* Treasuries Tab */}
        <TabsContent value="treasuries" className="space-y-4">
          <CardContent className="pt-6">
            {/* Create Treasury Button - only show if viewing own profile */}
            {user?.id === profile.id && (
              <div className="mb-6 flex justify-end">
                <Button
                  onClick={() => setCreateTreasuryModalOpen(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 neon-glow"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Treasury
                </Button>
              </div>
            )}

            {profileTabData.treasuries.length === 0 ? (
              <div className="text-center py-12">
                <Vault className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Not a member of any Treasury groups</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Join Treasury groups to collaborate on NFT investments and trading
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profileTabData.treasuries.map((treasury) => (
                  <Link key={treasury.id} href="/treasury">
                    <Card className="group cursor-pointer bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 overflow-hidden">
                      {/* Treasury Header */}
                      <div className="relative h-24 bg-gradient-to-br from-primary/20 to-secondary/20">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <Badge
                          className={`absolute top-3 right-3 ${
                            treasury.isPublic
                              ? "bg-green-500/80 text-white"
                              : "bg-orange-500/80 text-white"
                          } border-0`}
                        >
                          {treasury.isPublic ? "Public" : "Private"}
                        </Badge>
                      </div>

                      <CardContent className="relative p-4 -mt-8">
                        {/* Treasury Avatar */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="relative">
                            <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary to-secondary neon-glow border-4 border-background shadow-xl flex items-center justify-center">
                              <Vault className="h-8 w-8 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors truncate">
                              {treasury.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {treasury.description}
                            </p>
                          </div>
                        </div>

                        {/* Treasury Stats */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Portfolio:</span>
                            </div>
                            <span className="font-medium">{treasury.nfts.length} NFTs</span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Members:</span>
                            </div>
                            <span className="font-medium">8 members</span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Wallet className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Total Value:</span>
                            </div>
                            <span className="font-bold text-primary">
                              {treasury.nfts.reduce((total, nft) => total + (nft.estimatedValue || 0), 0).toFixed(1)} APE
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Joined:</span>
                            </div>
                            <span className="font-medium">
                              {treasury.createdAt.toLocaleDateString('en-US', {
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Action Indicators */}
                        <div className="mt-4 pt-3 border-t border-border/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Active</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-primary group-hover:text-primary/80">
                              <span>View Treasury</span>
                              <ExternalLink className="h-3 w-3" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </TabsContent>

        {/* Watchlist Tab - Now using NFTCardGrid */}
        <TabsContent value="watchlist" className="space-y-4">
          <CardContent className="pt-6">
            {profileTabData.watchlist.length === 0 ? (
              <div className="text-center py-12">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No items in watchlist</p>
              </div>
            ) : (
              <NFTCardGrid
                nfts={profileTabData.watchlist.map((item) => ({
                  ...item,
                  acquiredAt: item.addedAt,
                  rarity: item.rarity || Math.floor(Math.random() * 5 + 1).toString(),
                  listing: item.listing || { type: "none" as const },
                  isBundle: false,
                  lastSalePrice: item.lastSalePrice
                }))}
                size="compact"
                showWatchlist={true}
                showActions={true}
                onCardClick={handleNFTClick}
                onBuyClick={(nft) => {
                  setSelectedNFTToBuy(nft)
                  setBuyNFTModalOpen(true)
                }}
                onRentClick={(nft) => {
                  // Handle rent click
                  console.log('Rent:', nft)
                }}
                onSwapClick={(nft) => {
                  handleSwapClick(nft)
                }}
              />
            )}
          </CardContent>
        </TabsContent>

        {/* Following Tab */}
        <TabsContent value="following" className="space-y-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Following
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profileTabData.following.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Not following anyone</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profileTabData.following.map((user) => (
                  <Card key={user.id} className="group">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || "/placeholder.svg"}
                          alt={user.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.followersCount} followers
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/profile/${user.username}`}>View</a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </TabsContent>

        {/* Followers Tab */}
        <TabsContent value="followers" className="space-y-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Followers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profileTabData.followers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No followers</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profileTabData.followers.map((user) => (
                  <Card key={user.id} className="group">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || "/placeholder.svg"}
                          alt={user.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.followersCount} followers
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/profile/${user.username}`}>View</a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </TabsContent>
      </Tabs>

      {/* Lazy-loaded Modal Components - Only load when needed */}
      <Suspense fallback={<div className="hidden" />}>
        {/* NFT Details Modal */}
        {isModalOpen && (
          <NFTDetailsModal
            nft={selectedNFT}
            isOpen={isModalOpen}
            onClose={handleModalClose}
            isOwner={user?.id === profile.id}
            onListForSale={(nft) => {
              setSelectedNFTForSale(nft)
              handleModalClose()
              setListForSaleModalOpen(true)
            }}
            onCreateSwap={(nft) => {
              handleModalClose()
              setCreateSwapModalOpen(true)
            }}
            onWrapForRental={(nft) => {
              setSelectedNFTForRental(nft as NFTWithTraits)
              handleModalClose()
              setWrapForRentalModalOpen(true)
            }}
            onBuyNFT={(nft) => {
              setSelectedNFTToBuy(nft)
              handleModalClose()
              setBuyNFTModalOpen(true)
            }}
          />
        )}

        {/* Swap Modal */}
        {swapModalOpen && swapListedNFT && swapCriteria && (
          <SwapModal
            isOpen={swapModalOpen}
            onClose={handleSwapModalClose}
            listingId={swapListingId}
            listedNFT={swapListedNFT}
            swapCriteria={swapCriteria}
          />
        )}

        {/* Create Swap Modal */}
        {createSwapModalOpen && (
          <CreateSwapModal
            isOpen={createSwapModalOpen}
            onClose={() => setCreateSwapModalOpen(false)}
            userNFTs={profileTabData.portfolio as NFTWithTraits[]}
          />
        )}

        {/* Create Bundle Modal */}
        {createBundleModalOpen && (
          <CreateBundleModal
            isOpen={createBundleModalOpen}
            onClose={() => setCreateBundleModalOpen(false)}
            userNFTs={profileTabData.portfolio as NFTWithTraits[]}
          />
        )}

        {/* Wrap for Rental Modal */}
        {wrapForRentalModalOpen && selectedNFTForRental && (
          <WrapForRentalModal
            isOpen={wrapForRentalModalOpen}
            onClose={() => {
              setWrapForRentalModalOpen(false)
              setSelectedNFTForRental(null)
            }}
            nft={selectedNFTForRental}
          />
        )}

        {/* Create Treasury Modal */}
        {createTreasuryModalOpen && (
          <CreateGroupModal
            isOpen={createTreasuryModalOpen}
            onClose={() => setCreateTreasuryModalOpen(false)}
            onSuccess={(groupId) => {
              console.log("Treasury created:", groupId)
              setCreateTreasuryModalOpen(false)
            }}
          />
        )}

        {/* List for Sale Modal */}
        {listForSaleModalOpen && selectedNFTForSale && (
          <ListForSaleModal
            isOpen={listForSaleModalOpen}
            onClose={() => {
              setListForSaleModalOpen(false)
              setSelectedNFTForSale(null)
            }}
            nft={selectedNFTForSale}
          />
        )}

        {/* Buy NFT Modal */}
        {buyNFTModalOpen && selectedNFTToBuy && (
          <BuyNFTModal
            isOpen={buyNFTModalOpen}
            onClose={() => {
              setBuyNFTModalOpen(false)
              setSelectedNFTToBuy(null)
            }}
            nft={selectedNFTToBuy}
          />
        )}
      </Suspense>
    </Card>
  )
}
