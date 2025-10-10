"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Collection, CollectionStats } from "@/types/collection"
import { getCollectionBySlug, getCollectionStats, getCollectionNFTs, getCollectionActivity, getCollectionBundles } from "@/lib/collection-service"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Activity, TrendingUp, Package, Newspaper, MessageCircle, ShoppingCart, ArrowLeftRight, Palette, Loader2 } from "lucide-react"
import { NFTDetailsModal } from "@/components/nft/nft-details-modal"
import { CommunityChat } from "./community-chat"

export default function CollectionPage() {
  const params = useParams()
  const slug = params.slug as string

  const [collection, setCollection] = useState<Collection | null>(null)
  const [stats, setStats] = useState<CollectionStats | null>(null)
  const [nfts, setNfts] = useState<any[]>([])
  const [bundles, setBundles] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingNFTs, setLoadingNFTs] = useState(false)
  const [loadingBundles, setLoadingBundles] = useState(false)
  const [loadingActivity, setLoadingActivity] = useState(false)
  const [selectedNFT, setSelectedNFT] = useState<any | null>(null)

  // Infinite scroll state
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false) // Prevent duplicate requests

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

        // Load initial NFTs (40 for faster initial load)
        setLoadingNFTs(true)
        const nftsData = await getCollectionNFTs(collectionData.contractAddress, 1, 40)
        setNfts(nftsData)
        // Check if we got fewer NFTs than requested (means we're at the end)
        if (nftsData.length < 40) {
          setHasMore(false)
        }
        setLoadingNFTs(false)

        // Load Bundles
        setLoadingBundles(true)
        const bundlesData = await getCollectionBundles(collectionData.contractAddress)
        setBundles(bundlesData)
        setLoadingBundles(false)

        // Load Activity
        setLoadingActivity(true)
        const activityData = await getCollectionActivity(collectionData.contractAddress)
        setActivity(activityData)
        setLoadingActivity(false)
      } catch (error) {
        console.error("Failed to load collection:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCollection()
  }, [slug])

  // Load more NFTs for infinite scroll
  const loadMoreNFTs = useCallback(async () => {
    if (loadingRef.current || !hasMore || !collection) return

    loadingRef.current = true
    setLoadingMore(true)

    try {
      const nextPage = page + 1
      const moreNFTs = await getCollectionNFTs(collection.contractAddress, nextPage, 20)

      if (moreNFTs.length === 0 || moreNFTs.length < 20) {
        setHasMore(false)
      }

      setNfts(prev => [...prev, ...moreNFTs])
      setPage(nextPage)
    } catch (error) {
      console.error("Failed to load more NFTs:", error)
    } finally {
      setLoadingMore(false)
      loadingRef.current = false
    }
  }, [page, hasMore, collection])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreNFTs()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '200px' // Start loading 200px before reaching sentinel
      }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [loadMoreNFTs, hasMore, loadingMore])

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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2">
                {nfts.map((nft) => (
                  <Card
                    key={`${nft.contractAddress}-${nft.tokenId}`}
                    className="group cursor-pointer hover:shadow-lg transition-all hover:scale-105 overflow-hidden"
                    onClick={() => setSelectedNFT(nft)}
                  >
                    <CardContent className="p-0">
                      {/* NFT Image */}
                      <div className="aspect-square bg-muted overflow-hidden">
                        {nft.image ? (
                          <img
                            src={nft.image}
                            alt={nft.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Package className="w-8 h-8" />
                          </div>
                        )}
                      </div>

                      {/* NFT Info */}
                      <div className="p-2">
                        {/* NFT Name */}
                        <p className="text-xs font-semibold truncate">
                          {nft.name}
                        </p>

                        {/* Token ID */}
                        <p className="text-[10px] text-muted-foreground truncate">
                          #{nft.tokenId}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Loading Sentinel for Infinite Scroll */}
            {!loadingNFTs && nfts.length > 0 && (
              <div ref={observerTarget} className="py-8">
                {loadingMore && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading more NFTs...</span>
                  </div>
                )}
                {!hasMore && (
                  <p className="text-center text-muted-foreground">
                    All {nfts.length} NFTs loaded
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bundles" className="mt-6">
            {loadingBundles ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading bundles...
              </div>
            ) : bundles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No bundles containing NFTs from this collection
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2">
                {bundles.map((bundle) => (
                  <Card
                    key={`${bundle.contractAddress}-${bundle.tokenId}`}
                    className="group cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                    onClick={() => setSelectedNFT(bundle)}
                  >
                    <CardContent className="p-2">
                      {/* Bundle Image */}
                      <div className="aspect-square bg-muted rounded-lg mb-2 overflow-hidden relative">
                        {bundle.image ? (
                          <img
                            src={bundle.image}
                            alt={bundle.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Package className="w-8 h-8" />
                          </div>
                        )}
                        {/* Bundle Badge */}
                        <div className="absolute top-1 right-1">
                          <Badge className="bg-orange-500 text-xs">Bundle</Badge>
                        </div>
                      </div>

                      {/* Bundle Name */}
                      <p className="text-xs font-semibold truncate">
                        {bundle.name}
                      </p>

                      {/* NFT Count */}
                      <p className="text-[10px] text-muted-foreground truncate">
                        {bundle.nfts?.length || 0} NFTs
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            {loadingActivity ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading activity...
              </div>
            ) : activity.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No activity found for this collection
              </div>
            ) : (
              <div className="space-y-3">
                {activity.map((event, index) => (
                  <Card key={`${event.txHash}-${index}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Event Type Icon */}
                          <div className={`p-2 rounded-lg ${
                            event.type === 'sale' ? 'bg-purple-500/20 text-purple-400' :
                            event.type === 'listing' ? 'bg-cyan-500/20 text-cyan-400' :
                            event.type === 'mint' ? 'bg-green-500/20 text-green-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {event.type === 'sale' ? <TrendingUp className="w-4 h-4" /> :
                             event.type === 'listing' ? <ShoppingCart className="w-4 h-4" /> :
                             event.type === 'mint' ? <Palette className="w-4 h-4" /> :
                             <ArrowLeftRight className="w-4 h-4" />}
                          </div>

                          {/* Event Details */}
                          <div>
                            <p className="font-semibold">
                              {event.type === 'sale' ? 'Sold' :
                               event.type === 'listing' ? 'Listed' :
                               event.type === 'mint' ? 'Minted' :
                               'Transferred'}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>Token #{event.tokenId}</span>
                              {event.price && (
                                <>
                                  <span>•</span>
                                  <span className="text-purple-400 font-semibold">
                                    {(Number(event.price) / 1e18).toFixed(2)} APE
                                  </span>
                                </>
                              )}
                              {event.marketplace && (
                                <>
                                  <span>•</span>
                                  <span>on {event.marketplace}</span>
                                </>
                              )}
                            </div>
                            {event.from && event.to && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <span>{event.from.slice(0, 6)}...{event.from.slice(-4)}</span>
                                <span>→</span>
                                <span>{event.to.slice(0, 6)}...{event.to.slice(-4)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Timestamp */}
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{event.timestamp.toLocaleDateString()}</p>
                          <p>{event.timestamp.toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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

          <TabsContent value="community" className="mt-0 sm:mt-6">
            {collection && (
              <CommunityChat
                collection={{
                  name: collection.name,
                  contractAddress: collection.contractAddress,
                }}
              />
            )}
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
