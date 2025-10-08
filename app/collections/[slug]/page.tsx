"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Collection, CollectionStats } from "@/types/collection"
import { getCollectionBySlug, getCollectionStats, getCollectionNFTs } from "@/lib/collection-service"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Activity, TrendingUp, Package, Newspaper, MessageCircle } from "lucide-react"
import { NFTDetailsModal } from "@/components/nft/nft-details-modal"

export default function CollectionPage() {
  const params = useParams()
  const slug = params.slug as string

  const [collection, setCollection] = useState<Collection | null>(null)
  const [stats, setStats] = useState<CollectionStats | null>(null)
  const [nfts, setNfts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingNFTs, setLoadingNFTs] = useState(false)
  const [selectedNFT, setSelectedNFT] = useState<any | null>(null)

  useEffect(() => {
    async function loadCollection() {
      try {
        setLoading(true)
        const collectionData = await getCollectionBySlug(slug)

        if (!collectionData) {
          console.error(`Collection not found: ${slug}`)
          return
        }

        setCollection(collectionData)

        // Load stats
        const statsData = await getCollectionStats(collectionData.contractAddress)
        setStats(statsData)

        // Load NFTs
        setLoadingNFTs(true)
        const nftsData = await getCollectionNFTs(collectionData.contractAddress, 1, 50)
        setNfts(nftsData)
        setLoadingNFTs(false)
      } catch (error) {
        console.error("Failed to load collection:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCollection()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading collection...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <h1 className="text-2xl font-bold">Collection Not Found</h1>
            <p className="text-muted-foreground">The collection "{slug}" could not be found.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Collection Header */}
        <div className="mb-8">
          {/* Banner Image */}
          {collection.bannerImage && (
            <div className="w-full h-64 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg mb-4" />
          )}

          <div className="flex items-start gap-6">
            {/* Collection Logo */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold -mt-12 border-4 border-background">
              {collection.name.substring(0, 2).toUpperCase()}
            </div>

            {/* Collection Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{collection.name}</h1>
                {collection.verified && (
                  <Badge className="bg-blue-500">Verified</Badge>
                )}
              </div>

              <p className="text-muted-foreground mb-4">{collection.description}</p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Total Supply</p>
                    <p className="text-2xl font-bold">{stats?.totalSupply || 0}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Owners</p>
                    <p className="text-2xl font-bold flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {stats?.owners || 0}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Floor Price</p>
                    <p className="text-2xl font-bold">
                      {stats?.floorPriceAPE ? `${stats.floorPriceAPE.toFixed(2)} APE` : '--'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Total Volume</p>
                    <p className="text-2xl font-bold flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {stats?.volumeTotalAPE ? `${stats.volumeTotalAPE.toFixed(1)} APE` : '0 APE'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Listed</p>
                    <p className="text-2xl font-bold">
                      {stats?.listedCount || 0}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="items" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="items">
              <Package className="w-4 h-4 mr-2" />
              Items
            </TabsTrigger>
            <TabsTrigger value="bundles">
              <Package className="w-4 h-4 mr-2" />
              Bundles
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="news">
              <Newspaper className="w-4 h-4 mr-2" />
              News Feed
            </TabsTrigger>
            <TabsTrigger value="community">
              <MessageCircle className="w-4 h-4 mr-2" />
              Community
            </TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="mt-6">
            {loadingNFTs ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading NFTs...
              </div>
            ) : nfts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No NFTs found in this collection
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-3">
                {nfts.map((nft) => (
                  <Card
                    key={`${nft.contractAddress}-${nft.tokenId}`}
                    className="group cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                    onClick={() => setSelectedNFT(nft)}
                  >
                    <CardContent className="p-2">
                      {/* NFT Image */}
                      <div className="aspect-square bg-muted rounded-lg mb-2 overflow-hidden">
                        {nft.image ? (
                          <img
                            src={nft.image}
                            alt={nft.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Package className="w-8 h-8" />
                          </div>
                        )}
                      </div>

                      {/* NFT Name */}
                      <p className="text-xs font-semibold truncate">
                        {nft.name}
                      </p>

                      {/* Token ID */}
                      <p className="text-[10px] text-muted-foreground truncate">
                        #{nft.tokenId}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bundles" className="mt-6">
            <div className="text-center py-12 text-muted-foreground">
              Bundles grid coming soon...
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <div className="text-center py-12 text-muted-foreground">
              Activity feed coming soon...
            </div>
          </TabsContent>

          <TabsContent value="news" className="mt-6">
            <Card className="border-dashed border-2">
              <CardContent className="p-12 text-center">
                <Newspaper className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2">News Feed - Coming Soon!</h3>
                <p className="text-muted-foreground">
                  Collection owners will be able to post updates, announcements, and engage with their community.
                  This feature will be gasless for the best web2-like experience.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community" className="mt-6">
            <Card className="border-dashed border-2">
              <CardContent className="p-12 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2">Token-Gated Community - Coming Soon!</h3>
                <p className="text-muted-foreground mb-4">
                  Only holders of this collection can access the community chat.
                  This feature will be gasless for seamless communication.
                </p>
                <p className="text-sm text-orange-400">
                  🎨 Own an NFT from this collection to join the conversation!
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* NFT Details Modal */}
      {selectedNFT && (
        <NFTDetailsModal
          nft={{
            ...selectedNFT,
            collection: collection?.name || '',
            chainId: collection?.chainId || 33139,
            listing: { type: "none" as const }
          }}
          isOpen={!!selectedNFT}
          onClose={() => setSelectedNFT(null)}
        />
      )}
    </div>
  )
}
