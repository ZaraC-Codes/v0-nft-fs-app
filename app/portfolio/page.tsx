"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TransactionSummary } from "@/components/transaction-summary"
import { Eye, Heart, Share2, MoreHorizontal, TrendingUp, TrendingDown } from "lucide-react"
import Image from "next/image"

const mockPortfolio = [
  {
    id: 1,
    name: "Cyber Samurai #4821",
    collection: "Cyber Punks",
    image: "/cyberpunk-samurai-neon-digital-art.jpg",
    purchasePrice: "2.1 ETH",
    currentPrice: "3.2 ETH",
    change: "+52.4%",
    isPositive: true,
    rarity: "Legendary",
    lastSale: "3.0 ETH",
  },
  {
    id: 2,
    name: "Neon Dragon #1337",
    collection: "Neon Warriors",
    image: "/futuristic-cityscape-neon-lights-digital.jpg",
    purchasePrice: "1.8 ETH",
    currentPrice: "2.8 ETH",
    change: "+55.6%",
    isPositive: true,
    rarity: "Epic",
    lastSale: "2.5 ETH",
  },
  {
    id: 3,
    name: "Digital Phoenix #777",
    collection: "Digital Dreams",
    image: "/cyberpunk-samurai-neon-digital-art.jpg",
    purchasePrice: "1.2 ETH",
    currentPrice: "0.9 ETH",
    change: "-25.0%",
    isPositive: false,
    rarity: "Rare",
    lastSale: "1.1 ETH",
  },
]

export default function PortfolioPage() {
  const [viewMode, setViewMode] = useState("grid")

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Legendary":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Epic":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "Rare":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Common":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4">
            My Portfolio
          </h1>
          <p className="text-slate-300 text-lg">Track your NFT collection performance and value</p>
        </div>

        <TransactionSummary />

        <Tabs defaultValue="owned" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-cyan-500/20">
            <TabsTrigger value="owned" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              Owned ({mockPortfolio.length})
            </TabsTrigger>
            <TabsTrigger
              value="created"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              Created (5)
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="owned" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockPortfolio.map((nft) => (
                <Card
                  key={nft.id}
                  className="bg-slate-800/50 border-cyan-500/20 backdrop-blur-sm overflow-hidden group hover:border-cyan-400/40 transition-all duration-300"
                >
                  <div className="relative">
                    <Image
                      src={nft.image || "/placeholder.svg"}
                      alt={nft.name}
                      width={400}
                      height={400}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className={getRarityColor(nft.rarity)}>{nft.rarity}</Badge>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button size="icon" variant="ghost" className="bg-black/50 hover:bg-black/70">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="bg-black/50 hover:bg-black/70">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="bg-black/50 hover:bg-black/70">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-white mb-1">{nft.name}</h3>
                      <p className="text-slate-400 text-sm">{nft.collection}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Purchase Price</span>
                        <span className="text-white font-medium">{nft.purchasePrice}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Current Value</span>
                        <span className="text-cyan-400 font-medium">{nft.currentPrice}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">P&L</span>
                        <div className={`flex items-center ${nft.isPositive ? "text-green-400" : "text-red-400"}`}>
                          {nft.isPositive ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          <span className="font-medium">{nft.change}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-6">
                      <Button className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                        Sell
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="created" className="space-y-6">
            <Card className="bg-slate-800/50 border-cyan-500/20 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-semibold text-white mb-2">No Created NFTs</h3>
                <p className="text-slate-400 mb-6">
                  You haven't created any NFTs yet. Start creating your first digital masterpiece!
                </p>
                <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                  Create NFT
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-slate-800/50 border-cyan-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white">Recent Activity</CardTitle>
                <CardDescription className="text-slate-400">
                  Your latest NFT transactions and activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-slate-400">Activity feed will appear here</p>
                  <Button
                    variant="outline"
                    className="mt-4 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
                  >
                    View Full History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
