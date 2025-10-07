"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Vault,
  Users,
  UserPlus,
  Crown,
  Settings,
  MessageCircle,
  Bot,
  Wallet,
  Send,
  Search,
  MoreHorizontal,
  Copy,
  Eye,
  Package,
  ShoppingCart,
  Calendar,
  ArrowLeftRight,
  Grid3x3
} from "lucide-react"
import { Header } from "@/components/header"
import { useToast } from "@/components/ui/use-toast"
import { NFTDetailsModal } from "@/components/nft/nft-details-modal"
import { apeChain, sepolia, CHAIN_METADATA } from "@/lib/thirdweb"

// Mock treasury data
const mockTreasury = {
  id: "treasury-1",
  name: "BAYC Legends",
  description: "Elite group of Bored Ape holders collaborating on blue-chip NFT investments and trading strategies.",
  image: "https://picsum.photos/200/200?random=treasury1",
  creatorId: "creator-1",
  creatorName: "CryptoKing",
  creatorAvatar: "https://picsum.photos/100/100?random=creator1",
  createdAt: new Date("2024-01-15"),
  walletAddress: "0xTreasury1234567890123456789012345678901234567890",
  totalValue: 2450.8,
  memberCount: 8,
  isPrivate: true,
  members: [
    {
      id: "member-1",
      username: "CryptoKing",
      avatar: "https://picsum.photos/100/100?random=member1",
      role: "creator",
      joinedAt: new Date("2024-01-15"),
      isOnline: true,
      verified: true
    },
    {
      id: "member-2",
      username: "NFTQueen",
      avatar: "https://picsum.photos/100/100?random=member2",
      role: "admin",
      joinedAt: new Date("2024-01-16"),
      isOnline: true,
      verified: true
    },
    {
      id: "member-3",
      username: "DiamondHands",
      avatar: "https://picsum.photos/100/100?random=member3",
      role: "member",
      joinedAt: new Date("2024-01-18"),
      isOnline: false,
      verified: false
    },
    {
      id: "member-4",
      username: "ApeCollector",
      avatar: "https://picsum.photos/100/100?random=member4",
      role: "member",
      joinedAt: new Date("2024-01-20"),
      isOnline: true,
      verified: true
    },
    {
      id: "member-5",
      username: "CyberTrader",
      avatar: "https://picsum.photos/100/100?random=member5",
      role: "member",
      joinedAt: new Date("2024-01-22"),
      isOnline: false,
      verified: false
    },
    {
      id: "member-6",
      username: "MetaVerse",
      avatar: "https://picsum.photos/100/100?random=member6",
      role: "member",
      joinedAt: new Date("2024-01-25"),
      isOnline: true,
      verified: true
    },
    {
      id: "member-7",
      username: "BlockchainBoss",
      avatar: "https://picsum.photos/100/100?random=member7",
      role: "member",
      joinedAt: new Date("2024-01-28"),
      isOnline: false,
      verified: false
    },
    {
      id: "member-8",
      username: "DegenDealer",
      avatar: "https://picsum.photos/100/100?random=member8",
      role: "member",
      joinedAt: new Date("2024-02-01"),
      isOnline: true,
      verified: true
    }
  ]
}

// Mock chat messages
const mockMessages = [
  {
    id: "msg-1",
    type: "system",
    content: "Treasury AI Bot has joined the chat",
    timestamp: new Date("2024-02-10T09:00:00Z"),
    sender: {
      id: "bot",
      username: "Treasury AI",
      avatar: "/bot-avatar.svg",
      isBot: true
    }
  },
  {
    id: "msg-2",
    type: "message",
    content: "Hey everyone! Just saw that new Pudgy Penguins drop. Should we consider adding some to our treasury?",
    timestamp: new Date("2024-02-10T10:30:00Z"),
    sender: {
      id: "member-2",
      username: "NFTQueen",
      avatar: "https://picsum.photos/100/100?random=member2"
    }
  },
  {
    id: "msg-3",
    type: "message",
    content: "@Treasury AI check our current APE balance",
    timestamp: new Date("2024-02-10T10:32:00Z"),
    sender: {
      id: "member-1",
      username: "CryptoKing",
      avatar: "https://picsum.photos/100/100?random=member1"
    }
  },
  {
    id: "msg-4",
    type: "bot_response",
    content: "Current treasury balance: 245.7 APE tokens. Treasury holds 12 NFTs with estimated value of 2,450.8 APE.",
    timestamp: new Date("2024-02-10T10:32:15Z"),
    sender: {
      id: "bot",
      username: "Treasury AI",
      avatar: "/bot-avatar.svg",
      isBot: true
    }
  },
  {
    id: "msg-5",
    type: "message",
    content: "That sounds good for a Pudgy purchase. What do others think?",
    timestamp: new Date("2024-02-10T10:35:00Z"),
    sender: {
      id: "member-4",
      username: "ApeCollector",
      avatar: "https://picsum.photos/100/100?random=member4"
    }
  }
]

// Mock treasury portfolio NFTs
const mockTreasuryPortfolio = [
  {
    contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
    tokenId: "3001",
    name: "Bored Ape #3001",
    image: "https://picsum.photos/400/400?random=treasury3001",
    collection: "Bored Ape Yacht Club",
    acquiredAt: new Date("2024-01-20"),
    estimatedValue: 48.5,
    rarity: "1",
    lastSalePrice: 45.2,
    chainId: apeChain.id,
    listing: {
      type: "none" as const
    }
  },
  {
    contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
    tokenId: "3002",
    name: "Bored Ape #3002",
    image: "https://picsum.photos/400/400?random=treasury3002",
    collection: "Bored Ape Yacht Club",
    acquiredAt: new Date("2024-01-25"),
    estimatedValue: 52.8,
    rarity: "2",
    lastSalePrice: 50.1,
    chainId: sepolia.id,
    listing: {
      type: "sale" as const,
      sale: {
        price: 55.0,
        lastSalePrice: 50.1
      }
    }
  },
  {
    contractAddress: "0x60E4d786628Fea6478F785A6d7e704777c86a7c6",
    tokenId: "4001",
    name: "Mutant Ape #4001",
    image: "https://picsum.photos/400/400?random=treasury4001",
    collection: "Mutant Ape Yacht Club",
    acquiredAt: new Date("2024-02-01"),
    estimatedValue: 15.2,
    rarity: "3",
    lastSalePrice: 14.8,
    chainId: apeChain.id,
    listing: {
      type: "rent" as const,
      rent: {
        pricePerDay: 1.5,
        minDays: 1,
        maxDays: 7
      }
    }
  },
  {
    contractAddress: "0xED5AF388653567Af2F388E6224dC7C4b3241C544",
    tokenId: "5001",
    name: "Azuki #5001",
    image: "https://picsum.photos/400/400?random=treasury5001",
    collection: "Azuki",
    acquiredAt: new Date("2024-02-05"),
    estimatedValue: 12.3,
    rarity: "4",
    lastSalePrice: 11.9,
    chainId: sepolia.id,
    listing: {
      type: "swap" as const,
      swap: {
        wantedCollection: "CryptoPunks",
        wantedTokenId: "Any",
        wantedTraits: ["Alien", "Laser Eyes", "Any"]
      }
    }
  },
  {
    contractAddress: "0x1A92f7381B9F03921564a437210bB9396471050C",
    tokenId: "bundle-treasury-1",
    name: "Blue Chip Bundle",
    image: "https://picsum.photos/400/400?random=treasurybundle1",
    collection: "Mixed Collections",
    acquiredAt: new Date("2024-02-08"),
    estimatedValue: 185.2,
    isBundle: true,
    bundleCount: 4,
    chainId: apeChain.id,
    bundleItems: [
      {
        contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
        tokenId: "6001",
        name: "Bored Ape #6001",
        image: "https://picsum.photos/400/400?random=treasurybundle6001",
        collection: "Bored Ape Yacht Club",
        acquiredAt: new Date("2024-02-08"),
        estimatedValue: 62.0,
        rarity: "1",
        chainId: apeChain.id
      },
      {
        contractAddress: "0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6",
        tokenId: "6002",
        name: "CryptoPunk #6002",
        image: "https://picsum.photos/400/400?random=treasurybundle6002",
        collection: "CryptoPunks",
        acquiredAt: new Date("2024-02-08"),
        estimatedValue: 95.5,
        rarity: "1",
        chainId: apeChain.id
      },
      {
        contractAddress: "0x23581767a106ae21c074b2276D25e5C3e136a68b",
        tokenId: "6003",
        name: "Moonbird #6003",
        image: "https://picsum.photos/400/400?random=treasurybundle6003",
        collection: "Moonbirds",
        acquiredAt: new Date("2024-02-08"),
        estimatedValue: 15.2,
        rarity: "2",
        chainId: apeChain.id
      },
      {
        contractAddress: "0x1A92f7381B9F03921564a437210bB9396471050C",
        tokenId: "6004",
        name: "Cool Cat #6004",
        image: "https://picsum.photos/400/400?random=treasurybundle6004",
        collection: "Cool Cats NFT",
        acquiredAt: new Date("2024-02-08"),
        estimatedValue: 12.5,
        rarity: "3",
        chainId: apeChain.id
      }
    ],
    listing: {
      type: "none" as const
    }
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

export default function TreasuryPage() {
  const [activeTab, setActiveTab] = useState("chat")
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [selectedNFT, setSelectedNFT] = useState<typeof mockTreasuryPortfolio[0] | null>(null)
  const [isNFTModalOpen, setIsNFTModalOpen] = useState(false)
  const { toast } = useToast()

  const handleSendMessage = () => {
    if (message.trim()) {
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the treasury chat.",
      })
      setMessage("")
    }
  }

  const handleAddMember = () => {
    toast({
      title: "Invitation Sent",
      description: "Member invitation has been sent successfully.",
    })
    setIsAddMemberOpen(false)
  }

  const handleNFTClick = (nft: typeof mockTreasuryPortfolio[0]) => {
    setSelectedNFT(nft)
    setIsNFTModalOpen(true)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "creator":
        return <Crown className="h-4 w-4 text-yellow-500" />
      case "admin":
        return <Settings className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "creator":
        return <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs">Creator</Badge>
      case "admin":
        return <Badge className="bg-gradient-to-r from-blue-400 to-purple-500 text-white border-0 text-xs">Admin</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Member</Badge>
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Treasury Header */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-xl mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Treasury Avatar */}
                <div className="relative">
                  <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-xl">
                    <AvatarImage src={mockTreasury.image} alt={mockTreasury.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-2xl md:text-3xl">
                      <Vault className="h-8 w-8 md:h-12 md:w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <Badge className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                    <Vault className="h-3 w-3 mr-1" />
                    Treasury
                  </Badge>
                </div>

                {/* Treasury Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl md:text-3xl font-bold neon-text">{mockTreasury.name}</h1>
                        {mockTreasury.isPrivate && (
                          <Badge variant="outline" className="text-xs">Private</Badge>
                        )}
                      </div>

                      <p className="text-muted-foreground max-w-2xl">{mockTreasury.description}</p>

                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Created by:</span>
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={mockTreasury.creatorAvatar} alt={mockTreasury.creatorName} />
                          <AvatarFallback className="text-xs">{mockTreasury.creatorName[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{mockTreasury.creatorName}</span>
                        <Crown className="h-4 w-4 text-yellow-500" />
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Treasury Wallet:</span>
                        <Badge variant="outline" className="font-mono text-xs">
                          {formatAddress(mockTreasury.walletAddress)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(mockTreasury.walletAddress)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Member
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card/95 backdrop-blur-xl border-border/50">
                          <DialogHeader>
                            <DialogTitle>Add Member to Treasury</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Search followers</label>
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  placeholder="Search your followers..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className="pl-10 bg-background/50 border-border/50"
                                />
                              </div>
                            </div>

                            {/* Mock followers list */}
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {["NFTEnthusiast", "CryptoCollector", "DigitalArtLover", "BlockchainBuddy"].map((follower, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-background/50 rounded">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={`https://picsum.photos/100/100?random=follower${index}`} />
                                      <AvatarFallback className="text-xs">{follower[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium">{follower}</span>
                                  </div>
                                  <Button size="sm" variant="outline" onClick={handleAddMember}>
                                    Invite
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Treasury Stats */}
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div className="flex flex-col">
                      <span className="font-bold text-lg text-primary">{mockTreasury.totalValue} APE</span>
                      <span className="text-muted-foreground">Total Value</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-lg">{mockTreasury.memberCount}</span>
                      <span className="text-muted-foreground">Members</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-lg">{mockTreasury.createdAt.toLocaleDateString()}</span>
                      <span className="text-muted-foreground">Created</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-card/50 border border-border/50 mb-6">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>Chat</span>
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>Portfolio</span>
              </TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Chat Section */}
                <div className="lg:col-span-3">
                  <Card className="border-border/50 bg-card/50 backdrop-blur-xl h-[600px] flex flex-col">
                    <CardHeader className="border-b border-border/50">
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Treasury Chat
                        <Badge className="bg-gradient-to-r from-purple-400 to-pink-500 text-white border-0 text-xs">
                          <Bot className="h-3 w-3 mr-1" />
                          AI Enabled
                        </Badge>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 flex flex-col">
                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {mockMessages.map((msg) => (
                          <div key={msg.id} className={`flex gap-3 ${msg.type === 'system' ? 'justify-center' : ''}`}>
                            {msg.type !== 'system' && (
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={msg.sender.avatar} alt={msg.sender.username} />
                                <AvatarFallback className="text-xs">
                                  {msg.sender.isBot ? <Bot className="h-4 w-4" /> : msg.sender.username[0]}
                                </AvatarFallback>
                              </Avatar>
                            )}

                            <div className={`flex-1 ${msg.type === 'system' ? 'text-center' : ''}`}>
                              {msg.type === 'system' ? (
                                <div className="text-xs text-muted-foreground bg-muted/20 rounded px-3 py-1 inline-block">
                                  {msg.content}
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">{msg.sender.username}</span>
                                    {msg.sender.isBot && (
                                      <Badge className="bg-gradient-to-r from-purple-400 to-pink-500 text-white border-0 text-xs">
                                        <Bot className="h-3 w-3 mr-1" />
                                        AI Bot
                                      </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                      {msg.timestamp.toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <div className={`text-sm p-3 rounded-lg ${
                                    msg.sender.isBot
                                      ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20'
                                      : 'bg-muted/20'
                                  }`}>
                                    {msg.content}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Message Input */}
                      <div className="border-t border-border/50 p-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Type your message or @Treasury AI for bot commands..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1 bg-background/50 border-border/50"
                          />
                          <Button onClick={handleSendMessage} className="bg-gradient-to-r from-primary to-secondary">
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Use @Treasury AI to interact with the wallet manager bot
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Members Sidebar */}
                <div className="space-y-6">
                  {/* Members List */}
                  <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Members ({mockTreasury.memberCount})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="space-y-2 p-4 max-h-80 overflow-y-auto">
                        {mockTreasury.members.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-2 hover:bg-muted/20 rounded">
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={member.avatar} alt={member.username} />
                                  <AvatarFallback className="text-xs">{member.username[0]}</AvatarFallback>
                                </Avatar>
                                {member.isOnline && (
                                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <span className="text-sm font-medium truncate">{member.username}</span>
                                  {member.verified && <Eye className="h-3 w-3 text-primary" />}
                                  {getRoleIcon(member.role)}
                                </div>
                                <div className="flex items-center gap-1">
                                  {getRoleBadge(member.role)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Treasury Portfolio */}
                  <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Treasury Portfolio
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">APE Balance:</span>
                        <span className="font-medium">245.7 APE</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">NFTs:</span>
                        <span className="font-medium">12 items</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Est. Value:</span>
                        <span className="font-medium text-primary">{mockTreasury.totalValue} APE</span>
                      </div>
                      <Button variant="outline" className="w-full mt-4">
                        <Wallet className="h-4 w-4 mr-2" />
                        View Treasury Wallet
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Portfolio Tab */}
            <TabsContent value="portfolio" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {mockTreasuryPortfolio.map((nft) => (
                  <Card
                    key={`${nft.contractAddress}-${nft.tokenId}`}
                    className="group bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 overflow-hidden cursor-pointer"
                    onClick={() => handleNFTClick(nft)}
                  >
                    {/* Bundle NFT Layout */}
                    {nft.isBundle ? (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={nft.image || "/placeholder.svg"}
                          alt={nft.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Chain Badge */}
                        <Badge className={`absolute top-4 left-4 bg-gradient-to-r ${CHAIN_METADATA[nft.chainId].color} text-white border-0`}>
                          {CHAIN_METADATA[nft.chainId].icon} {CHAIN_METADATA[nft.chainId].shortName}
                        </Badge>

                        {/* Bundle Badge */}
                        <Badge className="absolute top-13 left-4 bg-gradient-to-r from-orange-400 to-red-500 text-white border-0 neon-glow">
                          <Package className="h-3 w-3 mr-1" />
                          Bundle ({nft.bundleCount})
                        </Badge>

                        {/* Preview Images for Bundle */}
                        <div className="absolute bottom-4 left-4 flex space-x-2">
                          {[1, 2, 3].slice(0, nft.bundleCount).map((_, idx) => (
                            <div key={idx} className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white/20">
                              <img
                                src={nft.bundleItems?.[idx]?.image || `https://picsum.photos/100/100?random=${nft.tokenId}-${idx}`}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {nft.bundleCount && nft.bundleCount > 3 && (
                            <div className="w-12 h-12 rounded-lg bg-black/50 border-2 border-white/20 flex items-center justify-center">
                              <span className="text-white text-xs font-medium">+{nft.bundleCount - 3}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                          <div className="p-4 w-full">
                            <Button className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 neon-glow">
                              View Bundle
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Individual NFT Layout */
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

                        {/* Action Buttons Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                          <div className="p-4 w-full">
                            {nft.listing?.type === "sale" && (
                              <Button
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 neon-glow"
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                List for {nft.listing.sale.price} APE
                              </Button>
                            )}
                            {nft.listing?.type === "rent" && (
                              <Button
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 neon-glow"
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                              >
                                <Calendar className="h-4 w-4 mr-2" />
                                Rent {nft.listing.rent.pricePerDay} APE/Day
                              </Button>
                            )}
                            {nft.listing?.type === "swap" && (
                              <Button
                                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 neon-glow"
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                              >
                                <ArrowLeftRight className="h-4 w-4 mr-2" />
                                Propose Swap
                              </Button>
                            )}
                            {(!nft.listing || nft.listing.type === "none") && (
                              <Button
                                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 neon-glow"
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                              >
                                View Details
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {nft.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {nft.collection}
                            {nft.isBundle && (
                              <span className="ml-2 text-orange-400">
                                • {nft.bundleCount} items
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          {/* Listing Status Badge */}
                          {nft.listing && nft.listing.type !== "none" && (
                            <Badge
                              className={`mb-1 text-xs ${
                                nft.listing.type === "sale" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                                nft.listing.type === "rent" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                                "bg-purple-500/20 text-purple-400 border-purple-500/30"
                              }`}
                            >
                              {nft.listing.type === "sale" ? "Listed" :
                               nft.listing.type === "rent" ? "For Rent" : "For Swap"}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Price Information */}
                      <div className="space-y-1">
                        {/* Sale Listing */}
                        {nft.listing?.type === "sale" && nft.listing.sale && (
                          <div>
                            <p className="font-bold text-primary neon-text text-lg">
                              {nft.listing.sale.price} APE
                            </p>
                            {nft.listing.sale.lastSalePrice && (
                              <p className="text-xs text-muted-foreground">
                                Last: {nft.listing.sale.lastSalePrice} APE
                              </p>
                            )}
                          </div>
                        )}

                        {/* Rent Listing */}
                        {nft.listing?.type === "rent" && nft.listing.rent && (
                          <div>
                            <p className="font-bold text-blue-400 text-lg">
                              {nft.listing.rent.pricePerDay} APE/Day
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Min: {nft.listing.rent.minDays} Day{nft.listing.rent.minDays !== 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Max: {nft.listing.rent.maxDays} Day{nft.listing.rent.maxDays !== 1 ? 's' : ''}
                            </p>
                            {nft.lastSalePrice && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Last Sale: {nft.lastSalePrice} APE
                              </p>
                            )}
                          </div>
                        )}

                        {/* Swap Listing */}
                        {nft.listing?.type === "swap" && nft.listing.swap && (
                          <div>
                            <p className="font-bold text-purple-400 text-sm mb-1">
                              Wants: {nft.listing.swap.wantedCollection}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: {nft.listing.swap.wantedTokenId || "Any"}
                            </p>
                            {nft.listing.swap.wantedTraits && nft.listing.swap.wantedTraits.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {nft.listing.swap.wantedTraits.map((trait, index) => (
                                  <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                                    {trait}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {nft.lastSalePrice && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Last Sale: {nft.lastSalePrice} APE
                              </p>
                            )}
                          </div>
                        )}

                        {/* No Listing - Show Estimated Value */}
                        {(!nft.listing || nft.listing.type === "none") && (
                          <div>
                            <p className="font-bold text-primary neon-text text-lg">
                              {nft.estimatedValue} APE
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Estimated Value
                            </p>
                            {nft.lastSalePrice && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Last Sale: {nft.lastSalePrice} APE
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {mockTreasuryPortfolio.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No NFTs in treasury portfolio</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* NFT Details Modal */}
      <NFTDetailsModal
        nft={selectedNFT}
        isOpen={isNFTModalOpen}
        onClose={() => setIsNFTModalOpen(false)}
      />
    </div>
  )
}