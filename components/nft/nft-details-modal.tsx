"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  ArrowLeftRight,
  Eye,
  Copy,
  Activity,
  Palette,
  Link as LinkIcon,
  Clock,
  DollarSign,
  User,
  ShoppingCart,
  Tag
} from "lucide-react"
import { PortfolioNFT } from "@/types/profile"
import { WatchlistToggle } from "@/components/profile/add-to-watchlist"
import { SwapModal } from "@/components/swap/swap-modal"
import { SwapCriteria, NFTWithTraits } from "@/lib/nft-matching"
import { useToast } from "@/components/ui/use-toast"
import { CHAIN_METADATA, getChainMetadata } from "@/lib/thirdweb"

interface NFTDetailsModalProps {
  nft: PortfolioNFT | null
  isOpen: boolean
  onClose: () => void
  isOwner?: boolean
  onListForSale?: (nft: PortfolioNFT) => void
  onCreateSwap?: (nft: PortfolioNFT) => void
  onWrapForRental?: (nft: PortfolioNFT) => void
  onBuyNFT?: (nft: PortfolioNFT) => void
}

// Mock data for demonstration
const mockTraits = [
  { trait_type: "Background", value: "Aquamarine", rarity: "12%" },
  { trait_type: "Clothes", value: "Striped Tee", rarity: "8%" },
  { trait_type: "Eyes", value: "Bloodshot", rarity: "5%" },
  { trait_type: "Mouth", value: "Bored", rarity: "15%" },
  { trait_type: "Fur", value: "Golden Brown", rarity: "3%" }
]

const mockActivity = [
  {
    id: "1",
    type: "sale",
    price: "45.5",
    from: "0x1234...5678",
    to: "0x9876...4321",
    date: new Date("2024-01-15"),
    txHash: "0xabcd...ef12"
  },
  {
    id: "2",
    type: "transfer",
    from: "0x5555...6666",
    to: "0x1234...5678",
    date: new Date("2024-01-10"),
    txHash: "0x1111...2222"
  },
  {
    id: "3",
    type: "mint",
    to: "0x5555...6666",
    date: new Date("2023-12-01"),
    txHash: "0x3333...4444"
  }
]

// Rarity color system
const getRarityColor = (rarity: string) => {
  const rarityNum = parseInt(rarity)
  if (rarityNum === 1) return "from-yellow-400 to-orange-500"
  if (rarityNum === 2) return "from-purple-400 to-pink-500"
  if (rarityNum === 3) return "from-blue-400 to-cyan-500"
  if (rarityNum === 4) return "from-green-400 to-emerald-500"
  if (rarityNum === 5) return "from-gray-400 to-gray-500"
  return "from-gray-400 to-gray-500"
}

export function NFTDetailsModal({
  nft,
  isOpen,
  onClose,
  isOwner = false,
  onListForSale,
  onCreateSwap,
  onWrapForRental,
  onBuyNFT
}: NFTDetailsModalProps) {
  const { toast } = useToast()
  const [swapModalOpen, setSwapModalOpen] = useState(false)
  const [swapListingId, setSwapListingId] = useState<string>("")
  const [swapCriteria, setSwapCriteria] = useState<SwapCriteria | null>(null)

  if (!nft) return null

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleSwapClick = () => {
    if (!nft.listing?.swap) return

    const listingId = `${nft.contractAddress}-${nft.tokenId}`
    const criteria: SwapCriteria = {
      wantedCollection: nft.listing.swap.wantedCollection,
      wantedTokenId: nft.listing.swap.wantedTokenId,
      wantedTraits: nft.listing.swap.wantedTraits,
      chainId: nft.chainId
    }

    setSwapListingId(listingId)
    setSwapCriteria(criteria)
    setSwapModalOpen(true)
  }

  const handleSwapModalClose = () => {
    setSwapModalOpen(false)
    setSwapListingId("")
    setSwapCriteria(null)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "sale":
        return <DollarSign className="h-4 w-4 text-green-500" />
      case "transfer":
        return <ArrowLeftRight className="h-4 w-4 text-blue-500" />
      case "mint":
        return <Palette className="h-4 w-4 text-purple-500" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center justify-between">
              <span>{nft.name}</span>
              <div className="flex items-center gap-2">
                {getChainMetadata(nft.chainId) && (
                  <Badge className={`bg-gradient-to-r ${getChainMetadata(nft.chainId)!.color} text-white border-0`}>
                    {getChainMetadata(nft.chainId)!.icon} {getChainMetadata(nft.chainId)!.shortName}
                  </Badge>
                )}
                {nft.rarity && !nft.isBundle && (
                  <Badge className={`bg-gradient-to-r ${getRarityColor(nft.rarity)} text-white border-0 neon-glow`}>
                    Rarity #{nft.rarity}
                  </Badge>
                )}
                <WatchlistToggle
                  contractAddress={nft.contractAddress}
                  tokenId={nft.tokenId}
                  name={nft.name}
                  collection={nft.collection}
                  image={nft.image}
                  chainId={nft.chainId}
                />
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Top Section - Image, Actions, and Price Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Image and Actions */}
              <div className="space-y-4">
              {/* NFT Image */}
              <div className="relative">
                <img
                  src={nft.image || "/placeholder.svg"}
                  alt={nft.name}
                  className="w-full aspect-square object-cover rounded-lg border border-border/50"
                />
                {nft.isBundle && (
                  <Badge className="absolute top-4 left-4 bg-gradient-to-r from-orange-400 to-red-500 text-white border-0 neon-glow">
                    Bundle ({nft.bundleCount})
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {/* Listed NFT/Bundle Actions */}
                {nft.listing?.type === "sale" && !isOwner && (
                  <Button
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 neon-glow"
                    onClick={() => {
                      if (onBuyNFT) {
                        onBuyNFT(nft)
                      } else {
                        toast({
                          title: "Buy NFT",
                          description: "This feature is coming soon!",
                        })
                      }
                    }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Buy {nft.isBundle ? "Bundle" : "NFT"} for {nft.listing.sale.price} APE
                  </Button>
                )}

                {nft.listing?.type === "rent" && !isOwner && (
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 neon-glow">
                    <Calendar className="h-4 w-4 mr-2" />
                    Rent {nft.isBundle ? "Bundle" : "NFT"} - {nft.listing.rent.pricePerDay} APE/Day
                  </Button>
                )}

                {nft.listing?.type === "swap" && !isOwner && (
                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 neon-glow"
                    onClick={handleSwapClick}
                  >
                    <ArrowLeftRight className="h-4 w-4 mr-2" />
                    Propose Swap
                  </Button>
                )}

                {/* Owner Actions for Listed Items */}
                {nft.listing && nft.listing.type !== "none" && isOwner && (
                  <div className="space-y-2">
                    <Badge className="w-full justify-center py-2 bg-primary/20 text-primary border-primary/30">
                      Listed for {nft.listing.type === "sale" ? "Sale" : nft.listing.type === "rent" ? "Rent" : "Swap"}
                    </Badge>
                    <Button
                      variant="outline"
                      className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                      onClick={() => {
                        toast({
                          title: "Cancel Listing",
                          description: "This feature is coming soon!",
                        })
                      }}
                    >
                      Cancel Listing
                    </Button>
                  </div>
                )}

                {/* Owner Actions for Unlisted Items */}
                {(!nft.listing || nft.listing.type === "none") && isOwner && (
                  <div className="space-y-2">
                    <Button
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 neon-glow"
                      onClick={() => {
                        if (onListForSale) {
                          onListForSale(nft)
                        } else {
                          toast({
                            title: "List for Sale",
                            description: "This feature is coming soon!",
                          })
                        }
                      }}
                    >
                      <Tag className="h-4 w-4 mr-2" />
                      List {nft.isBundle ? "Bundle" : "NFT"} for Sale
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 neon-glow"
                        onClick={() => {
                          if (onCreateSwap) {
                            onCreateSwap(nft)
                          } else {
                            toast({
                              title: "Create Swap Listing",
                              description: "This feature is coming soon!",
                            })
                          }
                        }}
                      >
                        <ArrowLeftRight className="h-4 w-4 mr-2" />
                        Swap
                      </Button>

                      <Button
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 neon-glow"
                        onClick={() => {
                          if (onWrapForRental) {
                            onWrapForRental(nft)
                          } else {
                            toast({
                              title: "Wrap for Rental",
                              description: "This feature is coming soon!",
                            })
                          }
                        }}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Rent
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Price Information */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg">Price Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {nft.listing?.type === "sale" && nft.listing.sale && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Price</span>
                      <span className="font-bold text-primary text-lg">{nft.listing.sale.price} APE</span>
                    </div>
                    {nft.listing.sale.lastSalePrice && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Sale</span>
                        <span className="font-medium">{nft.listing.sale.lastSalePrice} APE</span>
                      </div>
                    )}
                  </>
                )}

                {nft.listing?.type === "rent" && nft.listing.rent && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily Rate</span>
                      <span className="font-bold text-blue-400 text-lg">{nft.listing.rent.pricePerDay} APE/Day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min Duration</span>
                      <span className="font-medium">{nft.listing.rent.minDays} Day{nft.listing.rent.minDays !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Duration</span>
                      <span className="font-medium">{nft.listing.rent.maxDays} Day{nft.listing.rent.maxDays !== 1 ? 's' : ''}</span>
                    </div>
                  </>
                )}

                {nft.listing?.type === "swap" && nft.listing.swap && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wants Collection</span>
                      <span className="font-medium">{nft.listing.swap.wantedCollection}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Token ID</span>
                      <span className="font-medium">{nft.listing.swap.wantedTokenId || "Any"}</span>
                    </div>
                    {nft.listing.swap.wantedTraits && nft.listing.swap.wantedTraits.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">Desired Traits</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {nft.listing.swap.wantedTraits.map((trait, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {nft.lastSalePrice && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Sale Price</span>
                    <span className="font-medium">{nft.lastSalePrice} APE</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bottom Section - Bundle Items OR Traits/Activity */}
          <div className="space-y-6">
            {/* Bundle Items for Bundle NFTs */}
            {nft.isBundle && nft.bundleItems && (
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-lg">NFTs in Bundle ({nft.bundleCount})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {nft.bundleItems.map((item, index) => (
                      <div key={index} className="bg-muted/20 rounded-lg p-4 space-y-3">
                        <div className="relative">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full aspect-square object-cover rounded-lg border border-border/30"
                          />
                          {getChainMetadata(item.chainId) && (
                            <Badge className={`absolute top-2 left-2 bg-gradient-to-r ${getChainMetadata(item.chainId)!.color} text-white border-0 text-xs`}>
                              {getChainMetadata(item.chainId)!.icon} {getChainMetadata(item.chainId)!.shortName}
                            </Badge>
                          )}
                          {item.rarity && (
                            <Badge className={`absolute top-11 left-2 bg-gradient-to-r ${getRarityColor(item.rarity)} text-white border-0 text-xs`}>
                              #{item.rarity}
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-medium text-sm truncate">{item.name}</h4>
                          <p className="text-xs text-muted-foreground truncate">{item.collection}</p>
                          <p className="text-xs text-muted-foreground">ID: {item.tokenId}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Traits/Activity Tabs for Individual NFTs */}
            {!nft.isBundle && (
              <Tabs defaultValue="traits" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="traits">Traits</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="traits" className="space-y-4">
                  <Card className="border-border/50 bg-card/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Traits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {mockTraits.map((trait, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-muted/20 rounded-lg min-w-0">
                            <div className="flex-1 min-w-0 mr-2">
                              <p className="text-sm text-muted-foreground truncate">{trait.trait_type}</p>
                              <p className="font-medium truncate">{trait.value}</p>
                            </div>
                            <Badge variant="outline" className="shrink-0">{trait.rarity}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <Card className="border-border/50 bg-card/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {mockActivity.map((activity) => (
                          <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                            <div className="flex items-center gap-3">
                              {getActivityIcon(activity.type)}
                              <div>
                                <p className="font-medium capitalize">{activity.type}</p>
                                <p className="text-sm text-muted-foreground">
                                  {activity.date.toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              {activity.price && (
                                <p className="font-medium">{activity.price} APE</p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {formatAddress(activity.txHash)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}

            {/* NFT Details */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg">{nft.isBundle ? "Bundle" : "NFT"} Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Collection</span>
                  <span className="font-medium">{nft.collection}</span>
                </div>

                {!nft.isBundle && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Token ID</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{nft.tokenId}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(nft.tokenId, "Token ID")}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contract</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{formatAddress(nft.contractAddress)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(nft.contractAddress, "Contract Address")}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {getChainMetadata(nft.chainId) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Blockchain</span>
                    <span className="font-medium">{getChainMetadata(nft.chainId)!.name}</span>
                  </div>
                )}

                {nft.isBundle && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items in Bundle</span>
                    <span className="font-medium">{nft.bundleCount} NFTs</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Swap Modal */}
      {swapCriteria && (
        <SwapModal
          isOpen={swapModalOpen}
          onClose={handleSwapModalClose}
          listingId={swapListingId}
          listedNFT={nft as NFTWithTraits}
          swapCriteria={swapCriteria}
        />
      )}
    </>
  )
}