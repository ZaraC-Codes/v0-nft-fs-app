"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Package,
  Plus,
  Minus,
  Search,
  Filter,
  Grid3x3,
  Package2,
  Eye,
  ShoppingCart,
  Calendar,
  ArrowLeftRight,
  Trash2,
  PackageOpen
} from "lucide-react"
import { Header } from "@/components/header"
import { useToast } from "@/components/ui/use-toast"
import { apeChain, sepolia, CHAIN_METADATA, client } from "@/lib/thirdweb"
import { ChainBadge } from "@/components/ui/chain-badge"
import { WatchlistToggle } from "@/components/profile/add-to-watchlist"
import { generateBundleImage, uploadBundleImageToIPFS } from "@/lib/bundle-image"
import { generateBundleMetadataURI, prepareCreateBundle, getUniqueNFTContracts } from "@/lib/bundle"
import { useSendTransaction } from "thirdweb/react"

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

// Mock user portfolio NFTs (grouped by collection)
const mockPortfolioNFTs = {
  "Bored Ape Yacht Club": [
    {
      contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
      tokenId: "1001",
      name: "Bored Ape #1001",
      image: "https://picsum.photos/400/400?random=p1001",
      collection: "Bored Ape Yacht Club",
      rarity: "2",
      estimatedValue: 45.5,
      chainId: apeChain.id
    },
    {
      contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
      tokenId: "1002",
      name: "Bored Ape #1002",
      image: "https://picsum.photos/400/400?random=p1002",
      collection: "Bored Ape Yacht Club",
      rarity: "1",
      estimatedValue: 52.3,
      chainId: apeChain.id
    },
    {
      contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
      tokenId: "1003",
      name: "Bored Ape #1003",
      image: "https://picsum.photos/400/400?random=p1003",
      collection: "Bored Ape Yacht Club",
      rarity: "3",
      estimatedValue: 38.7,
      chainId: apeChain.id
    }
  ],
  "Mutant Ape Yacht Club": [
    {
      contractAddress: "0x60E4d786628Fea6478F785A6d7e704777c86a7c6",
      tokenId: "2001",
      name: "Mutant Ape #2001",
      image: "https://picsum.photos/400/400?random=p2001",
      collection: "Mutant Ape Yacht Club",
      rarity: "2",
      estimatedValue: 12.0,
      chainId: sepolia.id
    },
    {
      contractAddress: "0x60E4d786628Fea6478F785A6d7e704777c86a7c6",
      tokenId: "2002",
      name: "Mutant Ape #2002",
      image: "https://picsum.photos/400/400?random=p2002",
      collection: "Mutant Ape Yacht Club",
      rarity: "4",
      estimatedValue: 8.5,
      chainId: sepolia.id
    }
  ],
  "Azuki": [
    {
      contractAddress: "0xED5AF388653567Af2F388E6224dC7C4b3241C544",
      tokenId: "3001",
      name: "Azuki #3001",
      image: "https://picsum.photos/400/400?random=p3001",
      collection: "Azuki",
      rarity: "3",
      estimatedValue: 8.2,
      chainId: apeChain.id
    },
    {
      contractAddress: "0xED5AF388653567Af2F388E6224dC7C4b3241C544",
      tokenId: "3002",
      name: "Azuki #3002",
      image: "https://picsum.photos/400/400?random=p3002",
      collection: "Azuki",
      rarity: "1",
      estimatedValue: 15.8,
      chainId: sepolia.id
    },
    {
      contractAddress: "0xED5AF388653567Af2F388E6224dC7C4b3241C544",
      tokenId: "3003",
      name: "Azuki #3003",
      image: "https://picsum.photos/400/400?random=p3003",
      collection: "Azuki",
      rarity: "5",
      estimatedValue: 6.2,
      chainId: apeChain.id
    }
  ]
}

// Mock existing bundles
const mockExistingBundles = [
  {
    id: "bundle-1",
    name: "BAYC Premium Pack",
    description: "Premium Bored Apes collection",
    bundleCount: 2,
    totalValue: 97.8,
    createdAt: new Date("2024-01-15"),
    chainId: apeChain.id,
    items: [
      {
        contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
        tokenId: "5001",
        name: "Bored Ape #5001",
        image: "https://picsum.photos/400/400?random=b5001",
        collection: "Bored Ape Yacht Club",
        rarity: "1",
        estimatedValue: 48.9,
        chainId: apeChain.id
      },
      {
        contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
        tokenId: "5002",
        name: "Bored Ape #5002",
        image: "https://picsum.photos/400/400?random=b5002",
        collection: "Bored Ape Yacht Club",
        rarity: "2",
        estimatedValue: 48.9,
        chainId: apeChain.id
      }
    ]
  },
  {
    id: "bundle-2",
    name: "Mixed Blue Chips",
    description: "Cross-collection bundle",
    bundleCount: 3,
    totalValue: 76.5,
    createdAt: new Date("2024-01-10"),
    chainId: sepolia.id,
    items: [
      {
        contractAddress: "0x60E4d786628Fea6478F785A6d7e704777c86a7c6",
        tokenId: "6001",
        name: "Mutant Ape #6001",
        image: "https://picsum.photos/400/400?random=b6001",
        collection: "Mutant Ape Yacht Club",
        rarity: "1",
        estimatedValue: 44.5,
        chainId: sepolia.id
      },
      {
        contractAddress: "0xED5AF388653567Af2F388E6224dC7C4b3241C544",
        tokenId: "6002",
        name: "Azuki #6002",
        image: "https://picsum.photos/400/400?random=b6002",
        collection: "Azuki",
        rarity: "2",
        estimatedValue: 18.0,
        chainId: sepolia.id
      },
      {
        contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
        tokenId: "6003",
        name: "Bored Ape #6003",
        image: "https://picsum.photos/400/400?random=b6003",
        collection: "Bored Ape Yacht Club",
        rarity: "3",
        estimatedValue: 14.0,
        chainId: sepolia.id
      }
    ]
  }
]

export default function BundlesPage() {
  const [activeTab, setActiveTab] = useState("create")
  const [selectedCollection, setSelectedCollection] = useState<string>("all")
  const [selectedNFTs, setSelectedNFTs] = useState<Set<string>>(new Set())
  const [thumbnailNFTs, setThumbnailNFTs] = useState<Set<string>>(new Set()) // 3 featured thumbnails
  const [searchQuery, setSearchQuery] = useState("")
  const [bundleName, setBundleName] = useState("")
  const [bundleDescription, setBundleDescription] = useState("")
  const [isCreatingBundle, setIsCreatingBundle] = useState(false)
  const { toast } = useToast()
  const { mutate: sendTransaction } = useSendTransaction()

  const collections = ["all", ...Object.keys(mockPortfolioNFTs)]

  const filteredNFTs = selectedCollection === "all"
    ? Object.entries(mockPortfolioNFTs).flatMap(([collection, nfts]) =>
        nfts.map(nft => ({...nft, collection}))
      )
    : mockPortfolioNFTs[selectedCollection] || []

  const searchedNFTs = searchQuery
    ? filteredNFTs.filter(nft =>
        nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.collection.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredNFTs

  const handleNFTSelect = (nftId: string) => {
    const newSelected = new Set(selectedNFTs)
    const newThumbnails = new Set(thumbnailNFTs)

    if (newSelected.has(nftId)) {
      newSelected.delete(nftId)
      newThumbnails.delete(nftId) // Remove from thumbnails if removed from selection
    } else {
      newSelected.add(nftId)
    }
    setSelectedNFTs(newSelected)
    setThumbnailNFTs(newThumbnails)
  }

  const handleThumbnailToggle = (nftId: string) => {
    const newThumbnails = new Set(thumbnailNFTs)

    if (newThumbnails.has(nftId)) {
      newThumbnails.delete(nftId)
    } else {
      if (newThumbnails.size >= 3) {
        toast({
          title: "Maximum Thumbnails Reached",
          description: "You can only select 3 thumbnails for your bundle.",
          variant: "destructive"
        })
        return
      }
      newThumbnails.add(nftId)
    }
    setThumbnailNFTs(newThumbnails)
  }

  const selectedNFTsList = searchedNFTs.filter(nft =>
    selectedNFTs.has(`${nft.contractAddress}-${nft.tokenId}`)
  )

  const totalSelectedValue = selectedNFTsList.reduce((sum, nft) => sum + nft.estimatedValue, 0)

  const handleCreateBundle = async () => {
    if (selectedNFTs.size < 2) {
      toast({
        title: "Invalid Selection",
        description: "Please select at least 2 NFTs to create a bundle.",
        variant: "destructive"
      })
      return
    }

    if (!bundleName.trim()) {
      toast({
        title: "Bundle Name Required",
        description: "Please enter a name for your bundle.",
        variant: "destructive"
      })
      return
    }

    if (thumbnailNFTs.size !== 3) {
      toast({
        title: "Thumbnail Selection Required",
        description: "Please select exactly 3 thumbnails for your bundle display.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsCreatingBundle(true)

      // Get selected NFTs and thumbnails
      const thumbnailsList = searchedNFTs.filter(nft =>
        thumbnailNFTs.has(`${nft.contractAddress}-${nft.tokenId}`)
      )

      // Generate composite bundle image with FS logo + 3 thumbnails
      const bundleImageDataUri = await generateBundleImage(
        thumbnailsList.map(nft => ({
          image: nft.image || "",
          name: nft.name
        }))
      )

      // Upload to IPFS (or use data URI for now)
      const bundleImageUrl = await uploadBundleImageToIPFS(bundleImageDataUri)

      // Generate metadata URI with all NFT data and thumbnails
      const metadataURI = generateBundleMetadataURI(
        bundleName,
        bundleDescription || `Bundle of ${selectedNFTs.size} NFTs`,
        bundleImageUrl,
        selectedNFTsList.map(nft => ({
          name: nft.name,
          contractAddress: nft.contractAddress,
          tokenId: nft.tokenId,
          image: nft.image
        })),
        thumbnailsList.map(nft => ({
          name: nft.name,
          image: nft.image || "",
          tokenId: nft.tokenId
        }))
      )

      // Prepare bundle creation transaction
      const nftContracts = selectedNFTsList.map(nft => nft.contractAddress)
      const tokenIds = selectedNFTsList.map(nft => nft.tokenId)

      const transaction = prepareCreateBundle(client, apeChain, {
        nftContracts,
        tokenIds,
        bundleName,
        bundleTokenURI: metadataURI
      })

      // Send transaction
      sendTransaction(transaction, {
        onSuccess: () => {
          toast({
            title: "Bundle Created!",
            description: `Successfully created "${bundleName}" with ${selectedNFTs.size} NFTs and ${thumbnailNFTs.size} featured thumbnails.`,
          })

          // Reset form
          setSelectedNFTs(new Set())
          setThumbnailNFTs(new Set())
          setBundleName("")
          setBundleDescription("")
        },
        onError: (error) => {
          console.error("Bundle creation error:", error)
          toast({
            title: "Bundle Creation Failed",
            description: error.message || "Failed to create bundle. Please try again.",
            variant: "destructive"
          })
        }
      })
    } catch (error: any) {
      console.error("Bundle preparation error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to prepare bundle creation.",
        variant: "destructive"
      })
    } finally {
      setIsCreatingBundle(false)
    }
  }

  const handleUnwrapBundle = (bundleId: string, bundleName: string) => {
    toast({
      title: "Bundle Unwrapped!",
      description: `"${bundleName}" has been unwrapped. NFTs returned to your portfolio.`,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 neon-text">
            Bundle Manager
          </h1>
          <p className="text-muted-foreground">
            Create NFT bundles from your portfolio or manage existing bundles
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-card/50 border border-border/50">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Bundle</span>
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Package2 className="h-4 w-4" />
              <span>My Bundles</span>
            </TabsTrigger>
          </TabsList>

          {/* Create Bundle Tab */}
          <TabsContent value="create" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* NFT Selection Panel */}
              <div className="lg:col-span-3 space-y-6">
                {/* Filters */}
                <Card className="border-border/50 bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Select NFTs from Portfolio
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search NFTs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-background/50 border-border/50"
                      />
                    </div>

                    {/* Collection Filter */}
                    <div className="flex flex-wrap gap-2">
                      {collections.map((collection) => (
                        <Button
                          key={collection}
                          variant={selectedCollection === collection ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCollection(collection)}
                          className="capitalize"
                        >
                          {collection === "all" ? "All Collections" : collection}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* NFT Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {searchedNFTs.map((nft) => {
                    const nftId = `${nft.contractAddress}-${nft.tokenId}`
                    const isSelected = selectedNFTs.has(nftId)

                    return (
                      <Card
                        key={nftId}
                        className={`group cursor-pointer transition-all duration-300 overflow-hidden ${
                          isSelected
                            ? "border-primary bg-primary/10 ring-2 ring-primary/50 hover:shadow-lg hover:shadow-primary/20"
                            : "bg-card/50 border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20"
                        }`}
                        onClick={() => handleNFTSelect(nftId)}
                      >
                        {/* Individual NFT Layout */}
                        <div className="relative">
                          <img
                            src={nft.image || "/placeholder.svg"}
                            alt={nft.name}
                            className="w-full aspect-square object-contain bg-black/20 transition-transform duration-300 group-hover:scale-105"
                          />

                          {/* Chain Badge */}
                          <div className="absolute top-3 left-3">
                            <ChainBadge chainId={nft.chainId} size="md" />
                          </div>

                          {/* Rarity Badge */}
                          {nft.rarity && (
                            <Badge className={`absolute top-12 left-3 bg-gradient-to-r ${getRarityColor(nft.rarity)} text-white border-0 neon-glow`}>
                              {nft.rarity}
                            </Badge>
                          )}

                          {/* Selection Checkbox */}
                          <div className="absolute top-3 right-3">
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleNFTSelect(nftId)}
                              className="bg-black/50 border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                          </div>

                          {/* Selection Overlay */}
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <div className="bg-primary text-primary-foreground rounded-full p-3">
                                <Plus className="h-6 w-6" />
                              </div>
                            </div>
                          )}

                          {/* Action Buttons Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                            <div className="p-4 w-full flex flex-col gap-2">
                              <Button
                                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 neon-glow"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleNFTSelect(nftId)
                                }}
                              >
                                {isSelected ? (
                                  <>
                                    <Minus className="h-4 w-4 mr-2" />
                                    Remove from Bundle
                                  </>
                                ) : (
                                  <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add to Bundle
                                  </>
                                )}
                              </Button>
                              {isSelected && (
                                <Button
                                  variant={thumbnailNFTs.has(nftId) ? "default" : "outline"}
                                  className="w-full"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleThumbnailToggle(nftId)
                                  }}
                                >
                                  {thumbnailNFTs.has(nftId) ? (
                                    <>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Featured Thumbnail
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Set as Thumbnail ({thumbnailNFTs.size}/3)
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                {nft.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {nft.collection}
                              </p>
                            </div>
                            <div className="text-right">
                              {isSelected && (
                                <Badge className="mb-1 text-xs bg-primary/20 text-primary border-primary/30">
                                  Selected
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Price Information */}
                          <div className="space-y-1">
                            <div>
                              <p className="font-bold text-primary neon-text text-lg">
                                {nft.estimatedValue} APE
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Estimated Value
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {searchedNFTs.length === 0 && (
                  <div className="text-center py-12">
                    <Grid3x3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No NFTs found</p>
                  </div>
                )}
              </div>

              {/* Bundle Creation Panel */}
              <div className="space-y-6">
                <Card className="border-border/50 bg-card/50 sticky top-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Bundle Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Bundle Info */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Bundle Name</label>
                        <Input
                          placeholder="Enter bundle name"
                          value={bundleName}
                          onChange={(e) => setBundleName(e.target.value)}
                          className="mt-1 bg-background/50"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Description (Optional)</label>
                        <Input
                          placeholder="Bundle description"
                          value={bundleDescription}
                          onChange={(e) => setBundleDescription(e.target.value)}
                          className="mt-1 bg-background/50"
                        />
                      </div>
                    </div>

                    {/* Selected NFTs Summary */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Selected NFTs:</span>
                        <span className="font-medium">{selectedNFTs.size}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Value:</span>
                        <span className="font-medium text-primary">
                          {totalSelectedValue.toFixed(1)} APE
                        </span>
                      </div>
                    </div>

                    {/* Selected NFTs Preview */}
                    {selectedNFTsList.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Selected NFTs:</h4>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {selectedNFTsList.map((nft) => (
                            <div
                              key={`${nft.contractAddress}-${nft.tokenId}`}
                              className="flex items-center gap-2 p-2 bg-background/50 rounded text-xs"
                            >
                              <img
                                src={nft.image}
                                alt={nft.name}
                                className="w-8 h-8 rounded object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="truncate font-medium">{nft.name}</p>
                                <p className="text-muted-foreground truncate">
                                  {nft.estimatedValue} APE
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleNFTSelect(`${nft.contractAddress}-${nft.tokenId}`)
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Create Button */}
                    <Button
                      onClick={handleCreateBundle}
                      disabled={selectedNFTs.size < 2 || !bundleName.trim() || thumbnailNFTs.size !== 3 || isCreatingBundle}
                      className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      {isCreatingBundle ? "Creating Bundle..." : "Create Bundle"}
                    </Button>

                    {selectedNFTs.size < 2 && (
                      <p className="text-xs text-muted-foreground text-center">
                        Select at least 2 NFTs to create a bundle
                      </p>
                    )}
                    {selectedNFTs.size >= 2 && thumbnailNFTs.size !== 3 && (
                      <p className="text-xs text-muted-foreground text-center">
                        Select exactly 3 thumbnails for display ({thumbnailNFTs.size}/3 selected)
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Manage Bundles Tab */}
          <TabsContent value="manage" className="space-y-6 mt-6">
            {mockExistingBundles.length === 0 ? (
              <div className="text-center py-12">
                <Package2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No bundles created yet</p>
                <Button
                  onClick={() => setActiveTab("create")}
                  className="mt-4"
                  variant="outline"
                >
                  Create Your First Bundle
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {mockExistingBundles.map((bundle) => (
                  <Card
                    key={bundle.id}
                    className="group bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 overflow-hidden cursor-pointer"
                  >
                    {/* Bundle NFT Layout */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-900 via-black to-blue-900">
                      {/* FS Logo Background */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <img
                          src="/fs-temp-logo.png"
                          alt="Fortuna Square"
                          className="w-32 h-32 object-contain"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Chain Badge */}
                      <div className="absolute top-4 left-4">
                        <ChainBadge chainId={bundle.chainId} size="md" />
                      </div>

                      {/* Bundle Badge */}
                      <Badge className="absolute top-13 left-4 bg-gradient-to-r from-orange-400 to-red-500 text-white border-0 neon-glow">
                        <Package className="h-3 w-3 mr-1" />
                        Bundle ({bundle.bundleCount})
                      </Badge>

                      {/* Watchlist Button */}
                      <div className="absolute top-4 right-4 z-50">
                        <WatchlistToggle
                          contractAddress={`bundle-${bundle.id}`}
                          tokenId={bundle.id}
                          name={bundle.name}
                          collection="Bundles"
                          image={bundle.items[0]?.image}
                          chainId={bundle.chainId}
                          className="bg-black/50 hover:bg-black/70 text-white"
                        />
                      </div>

                      {/* Preview Images for Bundle - 3 Featured Thumbnails */}
                      <div className="absolute bottom-4 left-4 right-4 flex space-x-1.5">
                        {bundle.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white/30 shadow-lg">
                            <img
                              src={item?.image || `https://picsum.photos/100/100?random=${bundle.id}-${idx}`}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Action Buttons Overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end pointer-events-none">
                        <div className="p-4 w-full flex gap-2 pointer-events-auto">
                          <Button
                            onClick={() => handleUnwrapBundle(bundle.id, bundle.name)}
                            className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 neon-glow"
                          >
                            <PackageOpen className="h-4 w-4 mr-2" />
                            Unwrap Bundle
                          </Button>
                          <Button
                            variant="secondary"
                            className="px-3"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {bundle.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Mixed Collections
                            <span className="ml-2 text-orange-400">
                              • {bundle.bundleCount} items
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className="mb-1 text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">
                            Bundle
                          </Badge>
                        </div>
                      </div>

                      {/* Price Information */}
                      <div className="space-y-1">
                        <div>
                          <p className="font-bold text-primary neon-text text-lg">
                            {bundle.totalValue} APE
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Total Value • Created {bundle.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
