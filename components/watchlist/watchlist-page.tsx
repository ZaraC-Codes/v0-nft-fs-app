"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Search, Eye, TrendingUp, X, Bell, BellOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const mockWatchlistItems = [
  {
    id: "1",
    title: "Cyber Samurai #001",
    creator: "NeonArtist",
    currentPrice: "2.5 ETH",
    targetPrice: "2.0 ETH",
    image: "/cyberpunk-samurai-neon-digital-art.jpg",
    rarity: "Legendary",
    priceChange: "+5.2%",
    isIncreasing: true,
    notifications: true,
    addedDate: "2025-01-10",
  },
  {
    id: "2",
    title: "Digital Dreams #042",
    creator: "FutureVision",
    currentPrice: "1.8 ETH",
    targetPrice: "1.5 ETH",
    image: "/digital-dream-1.jpg",
    rarity: "Epic",
    priceChange: "-2.1%",
    isIncreasing: false,
    notifications: true,
    addedDate: "2025-01-08",
  },
  {
    id: "3",
    title: "Neon Genesis #007",
    creator: "CyberCreator",
    currentPrice: "3.2 ETH",
    targetPrice: "3.0 ETH",
    image: "/abstract-neon-geometric-cyberpunk-art.jpg",
    rarity: "Legendary",
    priceChange: "+12.8%",
    isIncreasing: true,
    notifications: false,
    addedDate: "2025-01-05",
  },
  {
    id: "4",
    title: "Electric Soul #156",
    creator: "DigitalMind",
    currentPrice: "1.2 ETH",
    targetPrice: "1.0 ETH",
    image: "/electric-portrait-neon-cyberpunk-face.jpg",
    rarity: "Rare",
    priceChange: "-8.3%",
    isIncreasing: false,
    notifications: true,
    addedDate: "2025-01-03",
  },
]

const rarityColors = {
  Legendary: "from-yellow-400 to-orange-500",
  Epic: "from-purple-400 to-pink-500",
  Rare: "from-blue-400 to-cyan-500",
  Common: "from-gray-400 to-gray-500",
}

export function WatchlistPage() {
  const [watchlistItems, setWatchlistItems] = useState(mockWatchlistItems)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const filteredItems = watchlistItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.creator.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const removeFromWatchlist = (id: string) => {
    setWatchlistItems(watchlistItems.filter((item) => item.id !== id))
    toast({
      title: "Removed from watchlist",
      description: "NFT has been removed from your watchlist",
    })
  }

  const toggleNotifications = (id: string) => {
    setWatchlistItems(
      watchlistItems.map((item) => (item.id === id ? { ...item, notifications: !item.notifications } : item)),
    )
    const item = watchlistItems.find((item) => item.id === id)
    toast({
      title: item?.notifications ? "Notifications disabled" : "Notifications enabled",
      description: item?.notifications
        ? "You will no longer receive price alerts for this NFT"
        : "You will receive price alerts for this NFT",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Heart className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            My Watchlist
          </h1>
        </div>
        <p className="text-muted-foreground">
          Keep track of your favorite NFTs and get notified when they hit your target price
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search watchlist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card/30 border-border/50 p-4">
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-primary" />
            <div>
              <p className="text-2xl font-bold text-primary neon-text">{watchlistItems.length}</p>
              <p className="text-sm text-muted-foreground">Items Watched</p>
            </div>
          </div>
        </Card>
        <Card className="bg-card/30 border-border/50 p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-green-400 neon-text">
                {watchlistItems.filter((item) => item.isIncreasing).length}
              </p>
              <p className="text-sm text-muted-foreground">Price Increasing</p>
            </div>
          </div>
        </Card>
        <Card className="bg-card/30 border-border/50 p-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-secondary" />
            <div>
              <p className="text-2xl font-bold text-secondary neon-text">
                {watchlistItems.filter((item) => item.notifications).length}
              </p>
              <p className="text-sm text-muted-foreground">Notifications On</p>
            </div>
          </div>
        </Card>
        <Card className="bg-card/30 border-border/50 p-4">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-accent" />
            <div>
              <p className="text-2xl font-bold text-accent neon-text">
                {
                  watchlistItems.filter(
                    (item) => Number.parseFloat(item.currentPrice) <= Number.parseFloat(item.targetPrice),
                  ).length
                }
              </p>
              <p className="text-sm text-muted-foreground">Target Reached</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Watchlist Items */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card/30 mb-6">
          <TabsTrigger value="all">All ({filteredItems.length})</TabsTrigger>
          <TabsTrigger value="increasing">
            Increasing ({filteredItems.filter((item) => item.isIncreasing).length})
          </TabsTrigger>
          <TabsTrigger value="decreasing">
            Decreasing ({filteredItems.filter((item) => !item.isIncreasing).length})
          </TabsTrigger>
          <TabsTrigger value="targets">
            Target Hit (
            {
              filteredItems.filter(
                (item) => Number.parseFloat(item.currentPrice) <= Number.parseFloat(item.targetPrice),
              ).length
            }
            )
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <WatchlistGrid
            items={filteredItems}
            onRemove={removeFromWatchlist}
            onToggleNotifications={toggleNotifications}
          />
        </TabsContent>

        <TabsContent value="increasing">
          <WatchlistGrid
            items={filteredItems.filter((item) => item.isIncreasing)}
            onRemove={removeFromWatchlist}
            onToggleNotifications={toggleNotifications}
          />
        </TabsContent>

        <TabsContent value="decreasing">
          <WatchlistGrid
            items={filteredItems.filter((item) => !item.isIncreasing)}
            onRemove={removeFromWatchlist}
            onToggleNotifications={toggleNotifications}
          />
        </TabsContent>

        <TabsContent value="targets">
          <WatchlistGrid
            items={filteredItems.filter(
              (item) => Number.parseFloat(item.currentPrice) <= Number.parseFloat(item.targetPrice),
            )}
            onRemove={removeFromWatchlist}
            onToggleNotifications={toggleNotifications}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface WatchlistGridProps {
  items: typeof mockWatchlistItems
  onRemove: (id: string) => void
  onToggleNotifications: (id: string) => void
}

function WatchlistGrid({ items, onRemove, onToggleNotifications }: WatchlistGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No items found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <Card
          key={item.id}
          className="group bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 overflow-hidden"
        >
          <div className="relative">
            <img src={item.image || "/placeholder.svg"} alt={item.title} className="w-full h-48 object-cover" />

            {/* Rarity Badge */}
            <Badge
              className={`absolute top-3 left-3 bg-gradient-to-r ${rarityColors[item.rarity as keyof typeof rarityColors]} text-white border-0 neon-glow`}
            >
              {item.rarity}
            </Badge>

            {/* Action Buttons */}
            <div className="absolute top-3 right-3 flex space-x-1">
              <Button
                size="icon"
                variant="ghost"
                className="bg-black/50 hover:bg-black/70 text-white w-8 h-8"
                onClick={() => onToggleNotifications(item.id)}
              >
                {item.notifications ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="bg-black/50 hover:bg-black/70 text-white w-8 h-8"
                onClick={() => onRemove(item.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            {/* Price Change Badge */}
            <Badge
              className={`absolute bottom-3 right-3 ${
                item.isIncreasing
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30"
              }`}
            >
              {item.priceChange}
            </Badge>
          </div>

          <CardContent className="p-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-sm text-muted-foreground">by {item.creator}</p>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">Current Price</p>
                  <p className="font-bold text-primary neon-text">{item.currentPrice}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Target Price</p>
                  <p className="font-bold text-secondary">{item.targetPrice}</p>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Added {new Date(item.addedDate).toLocaleDateString()}</span>
                <div className="flex items-center space-x-1">
                  {item.notifications ? <Bell className="h-3 w-3 text-secondary" /> : <BellOff className="h-3 w-3" />}
                  <span>{item.notifications ? "Alerts On" : "Alerts Off"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
