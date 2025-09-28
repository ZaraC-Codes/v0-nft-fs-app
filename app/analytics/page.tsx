"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Activity, DollarSign, Users, ShoppingCart } from "lucide-react"

const mockAnalytics = {
  overview: {
    totalVolume: "2,847.5 ETH",
    totalSales: "12,847",
    activeUsers: "8,429",
    avgPrice: "0.22 ETH",
    volumeChange: "+12.5%",
    salesChange: "+8.3%",
    usersChange: "+15.2%",
    priceChange: "-3.1%",
  },
  topCollections: [
    { name: "Cyber Punks", volume: "847.2 ETH", change: "+25.3%", floor: "2.1 ETH" },
    { name: "Neon Warriors", volume: "623.8 ETH", change: "+18.7%", floor: "1.8 ETH" },
    { name: "Digital Dreams", volume: "445.1 ETH", change: "+12.4%", floor: "0.9 ETH" },
    { name: "Future Legends", volume: "387.9 ETH", change: "+9.8%", floor: "1.2 ETH" },
    { name: "Quantum Cats", volume: "298.5 ETH", change: "+7.2%", floor: "0.7 ETH" },
  ],
  recentSales: [
    { nft: "Cyber Samurai #4821", price: "3.2 ETH", buyer: "CryptoKing", seller: "NFTCollector", time: "2 min ago" },
    { nft: "Neon Dragon #1337", price: "2.8 ETH", buyer: "DigitalArt", seller: "MetaTrader", time: "5 min ago" },
    { nft: "Future Bot #9999", price: "4.1 ETH", buyer: "BlockchainPro", seller: "CyberDealer", time: "8 min ago" },
    { nft: "Quantum Tiger #555", price: "1.9 ETH", buyer: "NFTWhale", seller: "ArtLover", time: "12 min ago" },
    { nft: "Digital Phoenix #777", price: "5.5 ETH", buyer: "CryptoElite", seller: "TokenMaster", time: "15 min ago" },
  ],
}

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState("24h")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4">
            Market Analytics
          </h1>
          <p className="text-slate-300 text-lg">Real-time insights and statistics for the NFT marketplace</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-cyan-500/20">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="collections"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              Collections
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              Activity
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-4 mb-6">
            {["24h", "7d", "30d", "90d"].map((period) => (
              <Button
                key={period}
                variant={timeframe === period ? "default" : "outline"}
                onClick={() => setTimeframe(period)}
                className={
                  timeframe === period
                    ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                    : "border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                }
              >
                {period}
              </Button>
            ))}
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-800/50 border-cyan-500/20 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Total Volume</CardTitle>
                  <DollarSign className="h-4 w-4 text-cyan-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{mockAnalytics.overview.totalVolume}</div>
                  <div className="flex items-center text-xs text-green-400">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {mockAnalytics.overview.volumeChange}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-purple-500/20 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Total Sales</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{mockAnalytics.overview.totalSales}</div>
                  <div className="flex items-center text-xs text-green-400">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {mockAnalytics.overview.salesChange}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-pink-500/20 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-pink-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{mockAnalytics.overview.activeUsers}</div>
                  <div className="flex items-center text-xs text-green-400">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {mockAnalytics.overview.usersChange}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-orange-500/20 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Average Price</CardTitle>
                  <Activity className="h-4 w-4 text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{mockAnalytics.overview.avgPrice}</div>
                  <div className="flex items-center text-xs text-red-400">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    {mockAnalytics.overview.priceChange}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="collections" className="space-y-6">
            <Card className="bg-slate-800/50 border-cyan-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white">Top Collections</CardTitle>
                <CardDescription className="text-slate-400">
                  Highest volume collections in the last {timeframe}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalytics.topCollections.map((collection, index) => (
                    <div
                      key={collection.name}
                      className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 border border-slate-600/30"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{collection.name}</h3>
                          <p className="text-sm text-slate-400">Floor: {collection.floor}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">{collection.volume}</p>
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                          {collection.change}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-slate-800/50 border-cyan-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white">Recent Sales</CardTitle>
                <CardDescription className="text-slate-400">Latest NFT transactions on the marketplace</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalytics.recentSales.map((sale, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 border border-slate-600/30"
                    >
                      <div>
                        <h3 className="font-semibold text-white">{sale.nft}</h3>
                        <p className="text-sm text-slate-400">
                          {sale.seller} → {sale.buyer}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-cyan-400">{sale.price}</p>
                        <p className="text-xs text-slate-500">{sale.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
