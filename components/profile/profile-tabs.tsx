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
import { apeChainCurtis, sepolia, CHAIN_METADATA, getChainMetadata } from "@/lib/thirdweb"
import { ChainBadge } from "@/components/ui/chain-badge"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/components/ui/use-toast"

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
                <Button
                  onClick={() => {
                    if ((profileTabData.portfolio as NFTWithTraits[]).length === 0) {
                      alert("You need at least one NFT to wrap for rental")
                      return
                    }
                    // Just open modal, user will select NFT inside
                    alert("Select an NFT from your portfolio to wrap for rental")
                  }}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 neon-glow"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Wrap for Rental
                </Button>
                <Button
                  onClick={() => setCreateSwapModalOpen(true)}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 neon-glow"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Swap Listing
                </Button>
              </div>
            )}

            {profileTabData.portfolio.length === 0 ? (
              <div className="text-center py-12">
                <Grid3x3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No NFTs in portfolio</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {profileTabData.portfolio.map((nft) => (
                  <Card
                    key={`${nft.contractAddress}-${nft.tokenId}`}
                    className="group bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 overflow-hidden cursor-pointer"
                    onClick={() => handleNFTClick(nft)}
                  >
                    {/* Bundle NFT Layout */}
                    {nft.isBundle ? (
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-900 via-black to-blue-900">
                        {/* FS Logo Background */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                          <img
                            src="/fs-temp-logo.png"
                            alt="Fortuna Square"
                            className="w-32 h-32 object-contain"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent " />

                        {/* Chain Badge */}
                        {nft.chainId && (
                          <div className="absolute top-4 left-4">
                            <ChainBadge chainId={nft.chainId} size="md" />
                          </div>
                        )}

                        {/* Bundle Badge */}
                        <Badge className="absolute top-13 left-4 bg-gradient-to-r from-orange-400 to-red-500 text-white border-0 neon-glow ">
                          <Package className="h-3 w-3 mr-1" />
                          Bundle ({nft.bundleCount})
                        </Badge>

                        {/* Preview Images for Bundle - 3 Featured Thumbnails */}
                        <div className="absolute bottom-4 left-4 right-4 flex space-x-1.5 ">
                          {nft.bundlePreviewImages && nft.bundlePreviewImages.length > 0 ? (
                            nft.bundlePreviewImages.slice(0, 3).map((previewItem, idx) => (
                              <div key={idx} className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white/30 shadow-lg">
                                <img
                                  src={previewItem.image}
                                  alt={previewItem.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))
                          ) : (
                            // Fallback to placeholder if preview images not loaded
                            [...Array(Math.min(3, nft.bundleCount || 0))].map((_, idx) => (
                              <div key={idx} className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white/30 shadow-lg bg-gray-800">
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                  <span className="text-xs">#{idx + 1}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Watchlist Button */}
                        <div className="absolute top-4 right-4 z-50 ">
                          <WatchlistToggle
                            contractAddress={nft.contractAddress}
                            tokenId={nft.tokenId}
                            name={nft.name}
                            collection={nft.collection}
                            image={nft.image}
                            chainId={nft.chainId}
                            className="bg-black/50 hover:bg-black/70 text-white"
                          />
                        </div>

                        {/* Action Buttons Overlay */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end pointer-events-none">
                          <div className="p-4 w-full pointer-events-auto">
                            {nft.listing?.type === "sale" && user?.id !== profile.id && (
                              <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 neon-glow">
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Buy Bundle
                              </Button>
                            )}
                            {nft.listing?.type === "rent" && user?.id !== profile.id && (
                              <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 neon-glow">
                                <Calendar className="h-4 w-4 mr-2" />
                                Rent Bundle
                              </Button>
                            )}
                            {nft.listing?.type === "swap" && user?.id !== profile.id && (
                              <Button
                                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 neon-glow"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSwapClick(nft)
                                }}
                              >
                                <ArrowLeftRight className="h-4 w-4 mr-2" />
                                Propose Swap
                              </Button>
                            )}
                            {(!nft.listing || nft.listing.type === "none") && (
                              <Button className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 neon-glow">
                                View Bundle
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Individual NFT Layout */
                      <div className="relative ">
                        <img
                          src={nft.image || "/placeholder.svg"}
                          alt={nft.name}
                          className="w-full aspect-square object-contain bg-black/20 transition-transform duration-300 group-hover:scale-105 "
                        />

                        {/* Chain Badge */}
                        {nft.chainId && (
                          <div className="absolute top-1.5 left-1.5">
                            <ChainBadge chainId={nft.chainId} size="sm" />
                          </div>
                        )}

                        {/* Rarity Badge */}
                        {nft.rarity && (
                          <Badge className={`absolute top-7 left-1.5 text-[10px] px-1.5 py-0.5 bg-gradient-to-r ${getRarityColor(nft.rarity)} text-white border-0 neon-glow `}>
                            {nft.rarity}
                          </Badge>
                        )}

                        {/* Watchlist Button */}
                        <div className="absolute top-1.5 right-1.5 z-50 ">
                          <WatchlistToggle
                            contractAddress={nft.contractAddress}
                            tokenId={nft.tokenId}
                            name={nft.name}
                            collection={nft.collection}
                            image={nft.image}
                            chainId={nft.chainId}
                            className="bg-black/50 hover:bg-black/70 text-white"
                          />
                        </div>

                        {/* Action Buttons Overlay */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end pointer-events-none">
                          <div className="p-4 w-full pointer-events-auto">
                            {nft.listing?.type === "sale" && user?.id !== profile.id && (
                              <Button
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 neon-glow"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // Handle buy action here
                                }}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Buy for {nft.listing.sale.price} APE
                              </Button>
                            )}
                            {nft.listing?.type === "rent" && user?.id !== profile.id && (
                              <Button
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 neon-glow"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // Handle rent action here
                                }}
                              >
                                <Calendar className="h-4 w-4 mr-2" />
                                Rent {nft.listing.rent.pricePerDay} APE/Day
                              </Button>
                            )}
                            {nft.listing?.type === "swap" && user?.id !== profile.id && (
                              <Button
                                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 neon-glow"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSwapClick(nft)
                                }}
                              >
                                <ArrowLeftRight className="h-4 w-4 mr-2" />
                                Propose Swap
                              </Button>
                            )}
                            {(!nft.listing || nft.listing.type === "none") && (
                              <Button
                                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 neon-glow"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleNFTClick(nft)
                                }}
                              >
                                View Details
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                            {nft.name}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {nft.collection}
                            {nft.isBundle && (
                              <span className="ml-1 text-orange-400">
                                • {nft.bundleCount}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          {/* Listing Status Badge */}
                          {nft.listing && nft.listing.type !== "none" && (
                            <Badge
                              className={`text-xs px-2 py-0.5 ${
                                nft.listing.type === "sale" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                                nft.listing.type === "rent" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                                "bg-purple-500/20 text-purple-400 border-purple-500/30"
                              }`}
                            >
                              {nft.listing.type === "sale" ? "Sale" :
                               nft.listing.type === "rent" ? "Rent" : "Swap"}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Price Information */}
                      <div className="space-y-0.5">
                        {/* Sale Listing */}
                        {nft.listing?.type === "sale" && nft.listing.sale && (
                          <div>
                            <p className="font-bold text-primary neon-text text-sm">
                              {nft.listing.sale.price} APE
                            </p>
                          </div>
                        )}

                        {/* Rent Listing */}
                        {nft.listing?.type === "rent" && nft.listing.rent && (
                          <div>
                            <p className="font-bold text-blue-400 text-xs">
                              {nft.listing.rent.pricePerDay} APE/Day
                            </p>
                          </div>
                        )}

                        {/* Swap Listing */}
                        {nft.listing?.type === "swap" && nft.listing.swap && (
                          <div>
                            <p className="font-bold text-purple-400 text-sm mb-1">
                              Wants: {nft.listing.swap.wantedCollection}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: {nft.listing.swap.wantedTokenId || "Any"}
                            </p>
                            {nft.listing.swap.wantedTraits && nft.listing.swap.wantedTraits.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {nft.listing.swap.wantedTraits.map((trait, index) => (
                                  <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                                    {trait}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {nft.lastSalePrice && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Last Sale: {nft.lastSalePrice} APE
                              </p>
                            )}
                          </div>
                        )}

                        {/* Not Listed */}
                        {(!nft.listing || nft.listing.type === "none") && (
                          <div>
                            {nft.lastSalePrice ? (
                              <p className="text-sm text-muted-foreground">
                                Last Sale: {nft.lastSalePrice} APE
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                Not Listed
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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

        {/* Watchlist Tab */}
        <TabsContent value="watchlist" className="space-y-4">
          <CardContent className="pt-6">
            {profileTabData.watchlist.length === 0 ? (
              <div className="text-center py-12">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No items in watchlist</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {profileTabData.watchlist.map((item) => {
                  // Convert watchlist item to portfolio-style format
                  const nftData = {
                    ...item,
                    acquiredAt: item.addedAt,
                    rarity: item.rarity || Math.floor(Math.random() * 5 + 1).toString(), // Use existing rarity or random for demo
                    listing: item.listing || { type: "none" as const },
                    isBundle: false,
                    lastSalePrice: item.lastSalePrice
                  }

                  return (
                    <Card
                      key={item.id}
                      className="group bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 overflow-hidden cursor-pointer"
                      onClick={() => handleNFTClick(nftData)}
                    >
                      {/* Individual NFT Layout */}
                      <div className="relative ">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full aspect-square object-contain bg-black/20 transition-transform duration-300 group-hover:scale-105 "
                        />

                        {/* Chain Badge */}
                        {getChainMetadata(item.chainId) && (
                          <Badge className={`absolute top-3 left-3 bg-gradient-to-r ${getChainMetadata(item.chainId)!.color} text-white border-0 flex items-center gap-1`}>
                            <img src={getChainMetadata(item.chainId)!.icon} alt={getChainMetadata(item.chainId)!.name} className="w-3 h-3" />
                            {getChainMetadata(item.chainId)!.shortName}
                          </Badge>
                        )}

                        {/* Rarity Badge */}
                        {nftData.rarity && (
                          <Badge className={`absolute top-12 left-3 bg-gradient-to-r ${getRarityColor(nftData.rarity)} text-white border-0 neon-glow `}>
                            {nftData.rarity}
                          </Badge>
                        )}

                        {/* Watchlist Button */}
                        <div className="absolute top-3 right-3 z-50 ">
                          <WatchlistToggle
                            contractAddress={item.contractAddress}
                            tokenId={item.tokenId}
                            name={item.name}
                            collection={item.collection}
                            image={item.image}
                            chainId={item.chainId}
                            className="bg-black/50 hover:bg-black/70 text-white"
                          />
                        </div>

                        {/* Action Buttons Overlay */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end pointer-events-none">
                          <div className="p-4 w-full pointer-events-auto">
                            {item.listing?.type === "sale" && item.listing.sale?.seller?.toLowerCase() !== user?.id?.toLowerCase() && (
                              <Button
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 neon-glow"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // Handle buy action here
                                }}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Buy for {item.listing.sale.price} APE
                              </Button>
                            )}
                            {item.listing?.type === "rent" && item.listing.rent?.owner?.toLowerCase() !== user?.id?.toLowerCase() && (
                              <Button
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 neon-glow"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // Handle rent action here
                                }}
                              >
                                <Calendar className="h-4 w-4 mr-2" />
                                Rent {item.listing.rent.pricePerDay} APE/Day
                              </Button>
                            )}
                            {item.listing?.type === "swap" && item.listing.swap?.creator?.toLowerCase() !== user?.id?.toLowerCase() && (
                              <Button
                                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 neon-glow"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSwapClick(nftData)
                                }}
                              >
                                <ArrowLeftRight className="h-4 w-4 mr-2" />
                                Propose Swap
                              </Button>
                            )}
                            {(!item.listing || item.listing.type === "none") && (
                              <Button
                                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 neon-glow"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleNFTClick(nftData)
                                }}
                              >
                                View Details
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {item.collection}
                            </p>
                          </div>
                          <div className="text-right">
                            {/* Listing Status Badge */}
                            {item.listing && item.listing.type !== "none" && (
                              <Badge
                                className={`mb-1 text-xs ${
                                  item.listing.type === "sale" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                                  item.listing.type === "rent" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                                  "bg-purple-500/20 text-purple-400 border-purple-500/30"
                                }`}
                              >
                                {item.listing.type === "sale" ? "For Sale" :
                                 item.listing.type === "rent" ? "For Rent" : "For Swap"}
                              </Badge>
                            )}
                            {/* Watching Badge */}
                            <Badge className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                              Watching
                            </Badge>
                          </div>
                        </div>

                        {/* Price Information */}
                        <div className="space-y-1">
                          {/* Sale Listing */}
                          {item.listing?.type === "sale" && item.listing.sale && (
                            <div>
                              <p className="font-bold text-primary neon-text text-lg">
                                {item.listing.sale.price} APE
                              </p>
                              {item.listing.sale.lastSalePrice && (
                                <p className="text-xs text-muted-foreground">
                                  Last: {item.listing.sale.lastSalePrice} APE
                                </p>
                              )}
                            </div>
                          )}

                          {/* Rent Listing */}
                          {item.listing?.type === "rent" && item.listing.rent && (
                            <div>
                              <p className="font-bold text-blue-400 text-lg">
                                {item.listing.rent.pricePerDay} APE/Day
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Max: {item.listing.rent.maxDuration} days
                              </p>
                            </div>
                          )}

                          {/* No Listing - Show Watchlist Info */}
                          {(!item.listing || item.listing.type === "none") && (
                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                              <span>Added {item.addedAt.toLocaleDateString()}</span>
                              {item.lastSalePrice && (
                                <span className="text-primary">Last Sale: {item.lastSalePrice} APE</span>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
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
