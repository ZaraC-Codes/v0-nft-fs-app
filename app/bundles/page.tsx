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
import { apeChainCurtis, sepolia, CHAIN_METADATA } from "@/lib/thirdweb"
import { WatchlistToggle } from "@/components/profile/add-to-watchlist"

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
      chainId: apeChainCurtis.id
    },
    {
      contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
      tokenId: "1002",
      name: "Bored Ape #1002",
      image: "https://picsum.photos/400/400?random=p1002",
      collection: "Bored Ape Yacht Club",
      rarity: "1",
      estimatedValue: 52.3,
      chainId: apeChainCurtis.id
    },
    {
      contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
      tokenId: "1003",
      name: "Bored Ape #1003",
      image: "https://picsum.photos/400/400?random=p1003",
      collection: "Bored Ape Yacht Club",
      rarity: "3",
      estimatedValue: 38.7,
      chainId: apeChainCurtis.id
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
      chainId: apeChainCurtis.id
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
      chainId: apeChainCurtis.id
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
    chainId: apeChainCurtis.id,
    items: [
      {
        contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
        tokenId: "5001",
        name: "Bored Ape #5001",
        image: "https://picsum.photos/400/400?random=b5001",
        collection: "Bored Ape Yacht Club",
        rarity: "1",
        estimatedValue: 48.9,
        chainId: apeChainCurtis.id
      },
      {
        contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
        tokenId: "5002",
        name: "Bored Ape #5002",
        image: "https://picsum.photos/400/400?random=b5002",
        collection: "Bored Ape Yacht Club",
        rarity: "2",
        estimatedValue: 48.9,
        chainId: apeChainCurtis.id
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
  const [searchQuery, setSearchQuery] = useState("")
  const [bundleName, setBundleName] = useState("")
  const [bundleDescription, setBundleDescription] = useState("")
  const { toast } = useToast()

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
    if (newSelected.has(nftId)) {
      newSelected.delete(nftId)
    } else {
      newSelected.add(nftId)
    }
    setSelectedNFTs(newSelected)
  }

  const selectedNFTsList = searchedNFTs.filter(nft =>
    selectedNFTs.has(`${nft.contractAddress}-${nft.tokenId}`)
  )

  const totalSelectedValue = selectedNFTsList.reduce((sum, nft) => sum + nft.estimatedValue, 0)

  const handleCreateBundle = () => {
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

    toast({
      title: "Bundle Created!",
      description: `Successfully created "${bundleName}" with ${selectedNFTs.size} NFTs.`,
    })

    // Reset form
    setSelectedNFTs(new Set())
    setBundleName("")
    setBundleDescription("")
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-3">
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
                            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                          />

                          {/* Chain Badge */}
                          <Badge className={`absolute top-3 left-3 bg-gradient-to-r ${CHAIN_METADATA[nft.chainId].color} text-white border-0`}>
                            {CHAIN_METADATA[nft.chainId].icon} {CHAIN_METADATA[nft.chainId].shortName}
                          </Badge>

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
                            <div className="p-4 w-full">
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
                      disabled={selectedNFTs.size < 2 || !bundleName.trim()}
                      className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Create Bundle
                    </Button>

                    {selectedNFTs.size < 2 && (
                      <p className="text-xs text-muted-foreground text-center">
                        Select at least 2 NFTs to create a bundle
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
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={bundle.items[0]?.image || "/placeholder.svg"}
                        alt={bundle.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Chain Badge */}
                      <Badge className={`absolute top-4 left-4 bg-gradient-to-r ${CHAIN_METADATA[bundle.chainId].color} text-white border-0`}>
                        {CHAIN_METADATA[bundle.chainId].icon} {CHAIN_METADATA[bundle.chainId].shortName}
                      </Badge>

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

                      {/* Preview Images for Bundle */}
                      <div className="absolute bottom-4 left-4 flex space-x-2">
                        {[1, 2, 3].slice(0, bundle.bundleCount).map((_, idx) => (
                          <div key={idx} className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white/20">
                            <img
                              src={bundle.items[idx]?.image || `https://picsum.photos/100/100?random=${bundle.id}-${idx}`}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {bundle.bundleCount && bundle.bundleCount > 3 && (
                          <div className="w-12 h-12 rounded-lg bg-black/50 border-2 border-white/20 flex items-center justify-center">
                            <span className="text-white text-xs font-medium">+{bundle.bundleCount - 3}</span>
                          </div>
                        )}
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