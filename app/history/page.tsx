"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ExternalLink } from "lucide-react"

const mockTransactions = [
  {
    id: "0x1a2b3c4d",
    type: "Purchase",
    nft: "Cyber Samurai #4821",
    collection: "Cyber Punks",
    price: "3.2 ETH",
    from: "NFTCollector",
    to: "CryptoKing",
    date: "2024-01-15 14:30:22",
    status: "Completed",
    txHash: "0x1a2b3c4d5e6f7g8h9i0j",
  },
  {
    id: "0x2b3c4d5e",
    type: "Sale",
    nft: "Neon Dragon #1337",
    collection: "Neon Warriors",
    price: "2.8 ETH",
    from: "MetaTrader",
    to: "DigitalArt",
    date: "2024-01-15 13:45:18",
    status: "Completed",
    txHash: "0x2b3c4d5e6f7g8h9i0j1k",
  },
  {
    id: "0x3c4d5e6f",
    type: "Bid",
    nft: "Future Bot #9999",
    collection: "Future Legends",
    price: "4.1 ETH",
    from: "BlockchainPro",
    to: "CyberDealer",
    date: "2024-01-15 12:20:45",
    status: "Pending",
    txHash: "0x3c4d5e6f7g8h9i0j1k2l",
  },
  {
    id: "0x4d5e6f7g",
    type: "Transfer",
    nft: "Quantum Tiger #555",
    collection: "Quantum Cats",
    price: "0 ETH",
    from: "ArtLover",
    to: "NFTWhale",
    date: "2024-01-15 11:15:33",
    status: "Completed",
    txHash: "0x4d5e6f7g8h9i0j1k2l3m",
  },
  {
    id: "0x5e6f7g8h",
    type: "Mint",
    nft: "Digital Phoenix #777",
    collection: "Digital Dreams",
    price: "0.1 ETH",
    from: "Creator",
    to: "TokenMaster",
    date: "2024-01-15 10:30:12",
    status: "Completed",
    txHash: "0x5e6f7g8h9i0j1k2l3m4n",
  },
]

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("date")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Failed":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Purchase":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
      case "Sale":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "Bid":
        return "bg-pink-500/20 text-pink-400 border-pink-500/30"
      case "Transfer":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "Mint":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4">
            Transaction History
          </h1>
          <p className="text-slate-300 text-lg">Complete record of all your NFT transactions and activities</p>
        </div>

        <Card className="bg-slate-800/50 border-cyan-500/20 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-white">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search by NFT name, collection, or transaction hash..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48 bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="bid">Bid</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="mint">Mint</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48 bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-cyan-500/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-white">Recent Transactions</CardTitle>
            <CardDescription className="text-slate-400">Your complete transaction history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={getTypeColor(transaction.type)}>{transaction.type}</Badge>
                        <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                      </div>
                      <h3 className="font-semibold text-white text-lg">{transaction.nft}</h3>
                      <p className="text-slate-400">{transaction.collection}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span>
                          {transaction.from} → {transaction.to}
                        </span>
                        <span>{transaction.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-cyan-400">{transaction.price}</p>
                        <p className="text-xs text-slate-500">Transaction ID: {transaction.id}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
              >
                Load More Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
