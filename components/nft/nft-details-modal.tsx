"use client"

import { useState, useEffect } from "react"
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
  Tag,
  Package
} from "lucide-react"
import { PortfolioNFT } from "@/types/profile"
import { WatchlistToggle } from "@/components/profile/add-to-watchlist"
import { SwapModal } from "@/components/swap/swap-modal"
import { SwapCriteria, NFTWithTraits } from "@/lib/nft-matching"
import { useToast } from "@/components/ui/use-toast"
import { CHAIN_METADATA, getChainMetadata } from "@/lib/thirdweb"
import { TransactionButton, useActiveAccount } from "thirdweb/react"
import { cancelListing, updateListingPrice, getNFTActivity } from "@/lib/marketplace"
import { client, apeChainCurtis } from "@/lib/thirdweb"
import { Input } from "@/components/ui/input"

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

// Bundle Contents Tab Component - lazy loads bundle NFTs
function BundleContentsTab({ nft }: { nft: PortfolioNFT }) {
  const [bundleNFTs, setBundleNFTs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  const loadBundleContents = async () => {
    if (hasLoaded || isLoading) return

    setIsLoading(true)
    console.log(`📦 Loading bundle contents for bundle #${nft.tokenId}...`)

    try {
      // Import bundle utilities
      const { getBundleAccountAddress } = await import("@/lib/bundle")
      const { client, apeChainCurtis } = await import("@/lib/thirdweb")

      // Get the TBA address for this bundle
      const tbaAddress = await getBundleAccountAddress(client, apeChainCurtis, nft.tokenId)
      console.log(`📍 Bundle TBA address: ${tbaAddress}`)

      // Fetch NFTs owned by the TBA - use correct API endpoint
      const response = await fetch(`/api/wallet-nfts?address=${tbaAddress}&chainId=${nft.chainId || 33111}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch bundle contents: ${response.status}`)
      }

      const data = await response.json()

      console.log(`✅ Loaded ${data.nfts?.length || 0} NFTs from bundle`)
      setBundleNFTs(data.nfts || [])
      setHasLoaded(true)
    } catch (error) {
      console.error("❌ Error loading bundle contents:", error)
      setBundleNFTs([])
    } finally {
      setIsLoading(false)
    }
  }

  // Load bundle contents when "contents" tab is active
  useEffect(() => {
    if (activeTab === "contents" && !hasLoaded && !isLoading) {
      loadBundleContents()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  return (
    <Tabs defaultValue="details" className="w-full" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="contents">Bundle Contents</TabsTrigger>
      </TabsList>

      <TabsContent value="contents" className="space-y-4">
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">NFTs in Bundle ({nft.bundleCount || bundleNFTs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                <p>Loading bundle contents...</p>
              </div>
            ) : bundleNFTs.length === 0 && hasLoaded ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No NFTs found in bundle</p>
              </div>
            ) : bundleNFTs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bundleNFTs.map((item: any, index: number) => (
                  <div key={index} className="bg-muted/20 rounded-lg p-4 space-y-3">
                    <div className="relative">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name || `Token #${item.tokenId}`}
                        className="w-full aspect-square object-cover rounded-lg border border-border/30"
                      />
                      {item.chainId && getChainMetadata(item.chainId) && (
                        <Badge className={`absolute top-2 left-2 bg-gradient-to-r ${getChainMetadata(item.chainId)!.color} text-white border-0 text-xs`}>
                          {getChainMetadata(item.chainId)!.icon} {getChainMetadata(item.chainId)!.shortName}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm truncate">{item.name || `Token #${item.tokenId}`}</h4>
                      <p className="text-xs text-muted-foreground truncate">{item.collectionName || 'Unknown Collection'}</p>
                      <p className="text-xs text-muted-foreground">ID: {item.tokenId}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Click to load bundle contents</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="details" className="space-y-4">
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Bundle Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Bundle Name</span>
              <span className="font-medium">{nft.name}</span>
            </div>
            <Separator />
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Items in Bundle</span>
              <span className="font-medium">{nft.bundleCount} NFTs</span>
            </div>
            <Separator />
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Token ID</span>
              <span className="font-medium">#{nft.tokenId}</span>
            </div>
            <Separator />
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Contract Address</span>
              <span className="font-mono text-xs truncate max-w-[200px]">{nft.contractAddress}</span>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
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
  const account = useActiveAccount()
  const [swapModalOpen, setSwapModalOpen] = useState(false)
  const [swapListingId, setSwapListingId] = useState<string>("")
  const [swapCriteria, setSwapCriteria] = useState<SwapCriteria | null>(null)
  const [isEditingPrice, setIsEditingPrice] = useState(false)
  const [newPrice, setNewPrice] = useState("")
  const [activity, setActivity] = useState<Array<{
    type: string;
    price?: string;
    from?: string;
    to?: string;
    date: Date;
    txHash: string;
  }>>([])
  const [isLoadingActivity, setIsLoadingActivity] = useState(false)

  // Fetch real activity data when modal opens
  useEffect(() => {
    if (isOpen && nft) {
      setIsLoadingActivity(true)
      getNFTActivity(nft.contractAddress, nft.tokenId)
        .then(data => {
          setActivity(data)
          setIsLoadingActivity(false)
        })
        .catch(err => {
          console.error("Failed to fetch activity:", err)
          setIsLoadingActivity(false)
        })
    }
  }, [isOpen, nft])

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
                      {nft.listing.sale && ` - ${nft.listing.sale.price} APE`}
                    </Badge>

                    {/* Edit Price Section */}
                    {nft.listing.type === "sale" && nft.listing.listingId !== undefined && (
                      <>
                        {!isEditingPrice ? (
                          <Button
                            variant="outline"
                            className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                            onClick={() => {
                              setNewPrice(nft.listing?.sale?.price?.toString() || "")
                              setIsEditingPrice(true)
                            }}
                          >
                            Edit Price
                          </Button>
                        ) : (
                          <div className="space-y-2">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="New price in APE"
                              value={newPrice}
                              onChange={(e) => setNewPrice(e.target.value)}
                              className="w-full"
                            />
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                  setIsEditingPrice(false)
                                  setNewPrice("")
                                }}
                              >
                                Cancel
                              </Button>
                              <TransactionButton
                                transaction={() => {
                                  console.log("🔍 Updating price to:", newPrice)
                                  if (nft.listing?.listingId === undefined) {
                                    throw new Error("No listing ID found")
                                  }
                                  if (!newPrice || parseFloat(newPrice) <= 0) {
                                    throw new Error("Invalid price")
                                  }
                                  return updateListingPrice(nft.listing.listingId, newPrice)
                                }}
                                onTransactionConfirmed={() => {
                                  console.log("✅ Price updated!")
                                  toast({
                                    title: "Price Updated",
                                    description: `New price: ${newPrice} APE`,
                                  })
                                  setIsEditingPrice(false)
                                  setNewPrice("")
                                  // Refresh to show new price
                                  if (window.location.pathname.includes('/profile/')) {
                                    window.location.reload()
                                  }
                                }}
                                onError={(error) => {
                                  console.error("❌ Update price error:", error)
                                  toast({
                                    title: "Failed to Update",
                                    description: error.message,
                                    variant: "destructive"
                                  })
                                }}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600"
                              >
                                Save
                              </TransactionButton>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {nft.listing.listingId !== undefined ? (
                      <TransactionButton
                        transaction={() => {
                          console.log("🔍 Canceling listing:", nft.listing?.listingId)
                          if (nft.listing?.listingId === undefined) {
                            throw new Error("No listing ID found")
                          }
                          return cancelListing(nft.listing.listingId)
                        }}
                        onTransactionConfirmed={() => {
                          console.log("✅ Listing canceled!")
                          toast({
                            title: "Listing Canceled",
                            description: "Your NFT is no longer listed for sale",
                          })
                          // Refresh the page to update the listing status
                          if (window.location.pathname.includes('/profile/')) {
                            window.location.reload()
                          }
                          onClose()
                        }}
                        onError={(error) => {
                          console.error("❌ Cancel listing error:", error)
                          toast({
                            title: "Failed to Cancel",
                            description: error.message,
                            variant: "destructive"
                          })
                        }}
                        className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        Cancel Listing
                      </TransactionButton>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                        onClick={() => {
                          toast({
                            title: "Error",
                            description: "No listing ID found for this NFT",
                            variant: "destructive"
                          })
                        }}
                      >
                        Cancel Listing (No ID)
                      </Button>
                    )}
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

                    {/* Unwrap Bundle Button (only for bundles) */}
                    {nft.isBundle && (
                      <Button
                        onClick={async () => {
                          console.log("📦 Unwrap Bundle clicked!")

                          try {
                            const { prepareUnwrapBundle, getBundleAccountAddress, getBundleNFTContract, getBundleManagerContract } = await import("@/lib/bundle")
                            const { client } = await import("@/lib/thirdweb")
                            const { apeChainCurtis } = await import("@/lib/thirdweb")
                            const { prepareContractCall, sendTransaction } = await import("thirdweb")
                            const { useActiveAccount } = await import("thirdweb/react")

                            // Get the TBA address
                            const tbaAddress = await getBundleAccountAddress(client, apeChainCurtis, nft.tokenId)

                            // Fetch bundled NFTs
                            const response = await fetch(`/api/wallet-nfts?address=${tbaAddress}&chainId=${nft.chainId || 33111}`)
                            const data = await response.json()
                            const bundledNFTs = data.nfts || []

                            // Step 1: Approve BundleManager to transfer the bundle NFT
                            console.log("📝 Step 1: Approving BundleManager...")
                            const bundleNFTContract = getBundleNFTContract(client, apeChainCurtis)
                            const bundleManagerContract = getBundleManagerContract(client, apeChainCurtis)

                            const approveTransaction = prepareContractCall({
                              contract: bundleNFTContract,
                              method: "function approve(address to, uint256 tokenId)",
                              params: [bundleManagerContract.address, BigInt(nft.tokenId)]
                            })

                            const account = useActiveAccount()
                            await sendTransaction({ transaction: approveTransaction, account })

                            toast({
                              title: "Approval Successful",
                              description: "Bundle NFT approved. Now unwrapping...",
                            })

                            // Step 2: Unwrap the bundle
                            console.log("📝 Step 2: Unwrapping bundle...")
                            const unwrapParams = {
                              bundleId: nft.tokenId,
                              nftContracts: bundledNFTs.map((nft: any) => nft.contractAddress),
                              tokenIds: bundledNFTs.map((nft: any) => nft.tokenId)
                            }

                            const unwrapTransaction = prepareUnwrapBundle(client, apeChainCurtis, unwrapParams)
                            await sendTransaction({ transaction: unwrapTransaction, account })

                            toast({
                              title: "Bundle Unwrapped!",
                              description: `Successfully extracted ${nft.bundleCount} NFTs from bundle.`,
                            })
                            setTimeout(() => window.location.reload(), 2000)

                          } catch (error: any) {
                            console.error("Unwrap error:", error)
                            toast({
                              title: "Unwrap Failed",
                              description: error.message,
                              variant: "destructive"
                            })
                          }
                        }}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-0 neon-glow"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Unwrap Bundle
                      </Button>
                    )}
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

          {/* Bottom Section - Bundle Contents OR Traits/Activity */}
          <div className="space-y-6">
            {/* Bundle Contents Tab for Bundle NFTs */}
            {nft.isBundle && (
              <BundleContentsTab nft={nft} />
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
                      {isLoadingActivity ? (
                        <div className="text-center py-8 text-muted-foreground">
                          Loading activity...
                        </div>
                      ) : activity.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No marketplace activity yet
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {activity.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                              <div className="flex items-center gap-3">
                                {getActivityIcon(item.type)}
                                <div>
                                  <p className="font-medium capitalize">{item.type}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {item.date.toLocaleDateString()} at {item.date.toLocaleTimeString()}
                                  </p>
                                  {item.from && (
                                    <p className="text-xs text-muted-foreground">
                                      From: {formatAddress(item.from)}
                                    </p>
                                  )}
                                  {item.to && (
                                    <p className="text-xs text-muted-foreground">
                                      To: {formatAddress(item.to)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                {item.price && (
                                  <p className="font-medium">{item.price} APE</p>
                                )}
                                <a
                                  href={`https://curtis.explorer.caldera.xyz/tx/${item.txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-400 hover:text-blue-300"
                                >
                                  {formatAddress(item.txHash)}
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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