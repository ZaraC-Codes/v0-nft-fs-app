"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Heart, Share2, Eye, ShoppingCart, Zap, Clock, TrendingUp, ExternalLink, Copy, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { BidModal } from "./bid-modal"
import { OfferModal } from "./offer-modal"
import { apeChain, sepolia, CHAIN_METADATA, getChainMetadata } from "@/lib/thirdweb"

interface NFTDetailProps {
  nft: {
    id: string
    title: string
    description: string
    image: string
    creator: {
      id: string
      username: string
      avatar: string
      isVerified: boolean
    }
    owner: {
      id: string
      username: string
      avatar: string
      isVerified: boolean
    }
    collection: {
      id: string
      name: string
      floorPrice: string
    }
    price: string
    rarity: string
    attributes: Array<{
      trait_type: string
      value: string
      rarity: string
    }>
    stats: {
      views: number
      likes: number
      offers: number
    }
    blockchain: string
    tokenId: string
    contractAddress: string
    chainId: number
    history: Array<{
      event: string
      price: string | null
      from: string | null
      to: string | null
      date: string
    }>
  }
}

const rarityColors = {
  Legendary: "from-yellow-400 to-orange-500",
  Epic: "from-purple-400 to-pink-500",
  Rare: "from-blue-400 to-cyan-500",
  Common: "from-gray-400 to-gray-500",
}

export function NFTDetail({ nft }: NFTDetailProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [showBidModal, setShowBidModal] = useState(false)
  const [showOfferModal, setShowOfferModal] = useState(false)
  const { toast } = useToast()

  const handleLike = () => {
    setIsLiked(!isLiked)
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: isLiked ? "NFT removed from your favorites" : "NFT added to your favorites",
    })
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Link copied",
      description: "NFT link copied to clipboard",
    })
  }

  const handleBuyNow = () => {
    toast({
      title: "Purchase initiated",
      description: "Redirecting to checkout...",
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      {/* NFT Image */}
      <div className="space-y-4">
        <Card className="bg-card/50 border-border/50 overflow-hidden">
          <div className="relative aspect-square">
            <img src={nft.image || "/placeholder.svg"} alt={nft.title} className="w-full h-full object-cover" />

            {/* Chain Badge */}
            {getChainMetadata(nft.chainId) && (
              <Badge
                className={`absolute top-4 left-4 bg-gradient-to-r ${getChainMetadata(nft.chainId)!.color} text-white border-0 flex items-center gap-1`}
              >
                <img src={getChainMetadata(nft.chainId)!.icon} alt={getChainMetadata(nft.chainId)!.name} className="w-3 h-3" />
                {getChainMetadata(nft.chainId)!.shortName}
              </Badge>
            )}

            {/* Rarity Badge */}
            <Badge
              className={`absolute top-13 left-4 bg-gradient-to-r ${rarityColors[nft.rarity as keyof typeof rarityColors]} text-white border-0 neon-glow`}
            >
              {nft.rarity}
            </Badge>

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <Button
                size="icon"
                variant="ghost"
                className="bg-black/50 hover:bg-black/70 text-white"
                onClick={handleLike}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="bg-black/50 hover:bg-black/70 text-white"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-card/30 border-border/50 p-4 text-center">
            <Eye className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Views</p>
            <p className="font-semibold">{nft.stats.views.toLocaleString()}</p>
          </Card>
          <Card className="bg-card/30 border-border/50 p-4 text-center">
            <Heart className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Likes</p>
            <p className="font-semibold">{nft.stats.likes}</p>
          </Card>
          <Card className="bg-card/30 border-border/50 p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Offers</p>
            <p className="font-semibold">{nft.stats.offers}</p>
          </Card>
        </div>
      </div>

      {/* NFT Details */}
      <div className="space-y-6">
        {/* Collection */}
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="border-primary/50 text-primary">
            {nft.collection.name}
          </Badge>
          <span className="text-sm text-muted-foreground">Floor: {nft.collection.floorPrice}</span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {nft.title}
          </h1>
          <p className="text-muted-foreground leading-relaxed">{nft.description}</p>
        </div>

        {/* Creator & Owner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Created by</p>
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={nft.creator.avatar || "/placeholder.svg"} />
                <AvatarFallback>{nft.creator.username[0]}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{nft.creator.username}</span>
              {nft.creator.isVerified && <CheckCircle className="h-4 w-4 text-primary" />}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Owned by</p>
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={nft.owner.avatar || "/placeholder.svg"} />
                <AvatarFallback>{nft.owner.username[0]}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{nft.owner.username}</span>
              {nft.owner.isVerified && <CheckCircle className="h-4 w-4 text-primary" />}
            </div>
          </div>
        </div>

        {/* Price & Actions */}
        <Card className="bg-card/30 border-border/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Price</p>
              <p className="text-2xl font-bold text-primary neon-text">{nft.price}</p>
            </div>
            <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30">
              <Clock className="mr-1 h-3 w-3" />
              Available
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={handleBuyNow}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 neon-glow"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Buy Now
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowOfferModal(true)}
              className="border-accent/50 text-accent hover:bg-accent/10 hover:border-accent"
            >
              <Zap className="mr-2 h-4 w-4" />
              Make Offer
            </Button>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="attributes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card/30">
            <TabsTrigger value="attributes">Attributes</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="attributes" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {nft.attributes.map((attr, index) => (
                <Card key={index} className="bg-card/30 border-border/50 p-4">
                  <p className="text-sm text-muted-foreground">{attr.trait_type}</p>
                  <p className="font-semibold">{attr.value}</p>
                  <p className="text-xs text-accent">{attr.rarity} have this trait</p>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <Card className="bg-card/30 border-border/50 p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Blockchain</span>
                  <span className="font-medium">{nft.blockchain}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Token ID</span>
                  <span className="font-medium">{nft.tokenId}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Contract Address</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm">
                      {nft.contractAddress.slice(0, 6)}...{nft.contractAddress.slice(-4)}
                    </span>
                    <Button size="icon" variant="ghost" className="h-6 w-6">
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="space-y-3">
              {nft.history.map((event, index) => (
                <Card key={index} className="bg-card/30 border-border/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="border-primary/50 text-primary">
                        {event.event}
                      </Badge>
                      <div>
                        {event.from && event.to && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">from</span> {event.from}
                            <span className="text-muted-foreground"> to</span> {event.to}
                          </p>
                        )}
                        {event.to && !event.from && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">to</span> {event.to}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {event.price && <span className="font-semibold text-primary">{event.price}</span>}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <BidModal isOpen={showBidModal} onClose={() => setShowBidModal(false)} nft={nft} />
      <OfferModal isOpen={showOfferModal} onClose={() => setShowOfferModal(false)} nft={nft} />
    </div>
  )
}
