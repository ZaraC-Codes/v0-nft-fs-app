"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Copy, ExternalLink, Users, Activity, Newspaper, Package, Grid3x3, Eye, ShoppingCart, Calendar, ArrowLeftRight, DollarSign, TrendingUp, Palette, Heart, MessageCircle, Share2, MoreHorizontal, Pin, Image as ImageIcon, Video, Zap, Hash, Lock, Volume2, Settings, UserPlus, Search, Send, Smile, Paperclip, AtSign, Crown, Shield } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { NFTDetailsModal } from "@/components/nft/nft-details-modal"
import { SwapModal } from "@/components/swap/swap-modal"
import { SwapCriteria, NFTWithTraits } from "@/lib/nft-matching"
import { Header } from "@/components/header"
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

// Mock news feed posts for collection
const mockNewsFeedPosts = [
  {
    id: "post-1",
    author: {
      name: "Bored Ape Yacht Club",
      username: "@BoredApeYC",
      avatar: "https://picsum.photos/200/200?random=collection",
      verified: true,
      isOwner: true
    },
    content: "🎉 Exciting news, Apes! We're thrilled to announce our partnership with major gaming platforms. Holders will get exclusive access to upcoming metaverse experiences. The future is bright! 🚀\n\n#BAYC #Metaverse #Web3Gaming",
    timestamp: new Date("2024-01-20T14:30:00Z"),
    media: [
      {
        type: "image",
        url: "https://picsum.photos/800/400?random=post1",
        alt: "Gaming partnership announcement"
      }
    ],
    stats: {
      likes: 1247,
      comments: 89,
      shares: 156
    },
    isPinned: true,
    tags: ["#BAYC", "#Metaverse", "#Web3Gaming"]
  },
  {
    id: "post-2",
    author: {
      name: "Bored Ape Yacht Club",
      username: "@BoredApeYC",
      avatar: "https://picsum.photos/200/200?random=collection",
      verified: true,
      isOwner: true
    },
    content: "Floor price update: We've seen incredible growth over the past 48 hours! 📈 Our community continues to show amazing support. Remember to HODL and stay strong together! 💎🙌",
    timestamp: new Date("2024-01-19T16:15:00Z"),
    media: [],
    stats: {
      likes: 892,
      comments: 67,
      shares: 94
    },
    isPinned: false,
    tags: ["#HODL", "#Community"]
  },
  {
    id: "post-3",
    author: {
      name: "Bored Ape Yacht Club",
      username: "@BoredApeYC",
      avatar: "https://picsum.photos/200/200?random=collection",
      verified: true,
      isOwner: true
    },
    content: "🎨 Featured Artist Spotlight: This week we're highlighting the incredible work of our community artists who have created amazing derivative art. Check out these stunning pieces! \n\nTag us with your BAYC art for a chance to be featured!",
    timestamp: new Date("2024-01-18T12:00:00Z"),
    media: [
      {
        type: "image",
        url: "https://picsum.photos/600/600?random=art1",
        alt: "Community art showcase"
      },
      {
        type: "image",
        url: "https://picsum.photos/600/600?random=art2",
        alt: "Community art showcase"
      }
    ],
    stats: {
      likes: 567,
      comments: 43,
      shares: 78
    },
    isPinned: false,
    tags: ["#Art", "#Community", "#Spotlight"]
  },
  {
    id: "post-4",
    author: {
      name: "Bored Ape Yacht Club",
      username: "@BoredApeYC",
      avatar: "https://picsum.photos/200/200?random=collection",
      verified: true,
      isOwner: true
    },
    content: "🏆 Congratulations to Ape #5847 for winning our weekly trading competition! 🥇\n\nThis week's prize: Exclusive access to our upcoming alpha release + mystery NFT drop. Keep trading and you could be next!",
    timestamp: new Date("2024-01-17T10:30:00Z"),
    media: [
      {
        type: "video",
        url: "https://picsum.photos/800/450?random=video1",
        thumbnail: "https://picsum.photos/800/450?random=video1",
        alt: "Trading competition winner announcement"
      }
    ],
    stats: {
      likes: 724,
      comments: 125,
      shares: 87
    },
    isPinned: false,
    tags: ["#Competition", "#Winner", "#Trading"]
  },
  {
    id: "post-5",
    author: {
      name: "Bored Ape Yacht Club",
      username: "@BoredApeYC",
      avatar: "https://picsum.photos/200/200?random=collection",
      verified: true,
      isOwner: true
    },
    content: "📢 IMPORTANT: Please be aware of increasing scam attempts targeting our community. Always verify links and never share your private keys. Stay safe out there, Apes! 🔒\n\nOfficial links only:\n🌐 Website: boredapeyachtclub.com\n💬 Discord: discord.gg/3P5K3dzgdB",
    timestamp: new Date("2024-01-16T09:45:00Z"),
    media: [],
    stats: {
      likes: 1089,
      comments: 156,
      shares: 234
    },
    isPinned: false,
    tags: ["#Security", "#Safety", "#ScamAlert"]
  },
  {
    id: "post-6",
    author: {
      name: "Bored Ape Yacht Club",
      username: "@BoredApeYC",
      avatar: "https://picsum.photos/200/200?random=collection",
      verified: true,
      isOwner: true
    },
    content: "🎪 The Yacht Club is throwing another epic virtual event this weekend! Join us for:\n\n🎵 Live DJ sets\n🎮 Gaming tournaments \n🎁 Surprise drops\n🍻 Virtual happy hour\n\nSee you in the metaverse! 🌟",
    timestamp: new Date("2024-01-15T18:20:00Z"),
    media: [
      {
        type: "image",
        url: "https://picsum.photos/900/500?random=event1",
        alt: "Virtual event announcement"
      }
    ],
    stats: {
      likes: 945,
      comments: 78,
      shares: 134
    },
    isPinned: false,
    tags: ["#Event", "#VirtualParty", "#Community"]
  }
]

// Mock community chat data
const mockCommunityChannels = [
  {
    id: "general",
    name: "general",
    type: "text" as const,
    description: "General discussion for all BAYC holders",
    memberCount: 2847,
    isActive: true,
    unreadCount: 0
  },
  {
    id: "announcements",
    name: "announcements",
    type: "announcement" as const,
    description: "Official announcements from the BAYC team",
    memberCount: 2847,
    isActive: false,
    unreadCount: 2
  },
  {
    id: "trading",
    name: "trading",
    type: "text" as const,
    description: "NFT trading and marketplace discussion",
    memberCount: 1892,
    isActive: false,
    unreadCount: 15
  },
  {
    id: "alpha-chat",
    name: "alpha-chat",
    type: "private" as const,
    description: "Exclusive alpha for diamond hands (50+ apes)",
    memberCount: 156,
    isActive: false,
    unreadCount: 3
  },
  {
    id: "voice-lounge",
    name: "Voice Lounge",
    type: "voice" as const,
    description: "Chill voice chat for holders",
    memberCount: 23,
    isActive: false,
    connectedMembers: 7
  },
  {
    id: "events",
    name: "events",
    type: "text" as const,
    description: "Community events and meetups",
    memberCount: 1567,
    isActive: false,
    unreadCount: 0
  }
]

const mockCommunityMembers = [
  {
    id: "member-1",
    username: "ApeKing",
    displayName: "Ape King 👑",
    avatar: "https://picsum.photos/100/100?random=member1",
    role: "Founder",
    roleColor: "#ff6b6b",
    apeCount: 127,
    status: "online",
    isVerified: true
  },
  {
    id: "member-2",
    username: "DiamondHands",
    displayName: "💎 Diamond Hands",
    avatar: "https://picsum.photos/100/100?random=member2",
    role: "OG Holder",
    roleColor: "#4ecdc4",
    apeCount: 23,
    status: "online",
    isVerified: false
  },
  {
    id: "member-3",
    username: "ApeTrader",
    displayName: "Ape Trader",
    avatar: "https://picsum.photos/100/100?random=member3",
    role: "Whale",
    roleColor: "#45b7d1",
    apeCount: 89,
    status: "away",
    isVerified: true
  },
  {
    id: "member-4",
    username: "NewApe",
    displayName: "New Ape",
    avatar: "https://picsum.photos/100/100?random=member4",
    role: "Holder",
    roleColor: "#96ceb4",
    apeCount: 1,
    status: "online",
    isVerified: false
  },
  {
    id: "member-5",
    username: "FloorSweeper",
    displayName: "Floor Sweeper 🧹",
    avatar: "https://picsum.photos/100/100?random=member5",
    role: "Collector",
    roleColor: "#feca57",
    apeCount: 45,
    status: "idle",
    isVerified: false
  }
]

const mockChatMessages = [
  {
    id: "msg-1",
    author: mockCommunityMembers[0],
    content: "GM everyone! 🌅 Just wanted to share some exciting news - we're partnering with several major gaming platforms for exclusive metaverse experiences. More details coming soon! 🎮",
    timestamp: new Date("2024-01-20T09:30:00Z"),
    reactions: [
      { emoji: "🔥", count: 23, userReacted: false },
      { emoji: "💎", count: 15, userReacted: true },
      { emoji: "🚀", count: 8, userReacted: false }
    ],
    replies: 12,
    attachments: []
  },
  {
    id: "msg-2",
    author: mockCommunityMembers[1],
    content: "This is huge! 💪 Been holding since day one and seeing the utility expand is amazing. BAYC to the moon! 🌙",
    timestamp: new Date("2024-01-20T09:35:00Z"),
    reactions: [
      { emoji: "💯", count: 8, userReacted: false },
      { emoji: "🦍", count: 12, userReacted: false }
    ],
    replies: 3,
    attachments: []
  },
  {
    id: "msg-3",
    author: mockCommunityMembers[2],
    content: "Floor is looking strong today 📈 Great to see the community support. Remember to HODL and stay diamond handed! 💎🙌",
    timestamp: new Date("2024-01-20T10:15:00Z"),
    reactions: [
      { emoji: "💎", count: 18, userReacted: true },
      { emoji: "🙌", count: 11, userReacted: false }
    ],
    replies: 7,
    attachments: [
      {
        type: "image",
        url: "https://picsum.photos/400/300?random=chart1",
        name: "floor_chart.png"
      }
    ]
  },
  {
    id: "msg-4",
    author: mockCommunityMembers[3],
    content: "Hey everyone! 👋 Just joined the community after getting my first ape! So excited to be part of this amazing family 🦍❤️",
    timestamp: new Date("2024-01-20T11:20:00Z"),
    reactions: [
      { emoji: "🎉", count: 34, userReacted: false },
      { emoji: "🦍", count: 28, userReacted: true },
      { emoji: "❤️", count: 19, userReacted: false }
    ],
    replies: 15,
    attachments: []
  },
  {
    id: "msg-5",
    author: mockCommunityMembers[4],
    content: "Welcome to the family! 🤝 Make sure to check out the alpha-chat channel if you're planning to expand your collection. Lots of great insights there! 🧠",
    timestamp: new Date("2024-01-20T11:25:00Z"),
    reactions: [
      { emoji: "👍", count: 6, userReacted: false }
    ],
    replies: 2,
    attachments: []
  },
  {
    id: "msg-6",
    author: mockCommunityMembers[0],
    content: "Quick reminder that our virtual yacht party is this weekend! 🛥️🎉 We'll have live DJ sets, exclusive drops, and some surprise announcements. Don't miss it!",
    timestamp: new Date("2024-01-20T12:00:00Z"),
    reactions: [
      { emoji: "🎉", count: 42, userReacted: true },
      { emoji: "🛥️", count: 15, userReacted: false },
      { emoji: "🎵", count: 8, userReacted: false }
    ],
    replies: 23,
    attachments: [
      {
        type: "image",
        url: "https://picsum.photos/600/400?random=party1",
        name: "yacht_party_invite.jpg"
      }
    ]
  }
]

// Mock collection data
const mockCollection = {
  name: "Bored Ape Yacht Club",
  symbol: "BAYC",
  description: "The Bored Ape Yacht Club is a collection of 10,000 unique Bored Ape NFTs— unique digital collectibles living on the Ethereum blockchain. Your Bored Ape doubles as your Yacht Club membership card, and grants access to members-only benefits, the first of which is access to THE BATHROOM, a collaborative graffiti board. Future areas and perks can be unlocked by the community through roadmap activation.",
  logo: "https://picsum.photos/200/200?random=collection",
  bannerImage: "https://picsum.photos/1200/300?random=banner",
  contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
  totalSupply: 10000,
  owners: 5487,
  floorPrice: 12.5,
  volume24h: 234.7,
  volumeTotal: 987654.3,
  verified: true,
  createdAt: new Date("2021-04-23"),
  website: "https://boredapeyachtclub.com",
  discord: "https://discord.gg/3P5K3dzgdB",
  twitter: "https://twitter.com/BoredApeYC"
}

// Mock bundles containing NFTs from this collection
const mockCollectionBundles = [
  {
    contractAddress: "0x1A92f7381B9F03921564a437210bB9396471050C",
    tokenId: "bundle-bayc-1",
    name: "BAYC Premium Bundle",
    image: "https://picsum.photos/400/400?random=bundle1",
    collection: "Mixed Collections",
    acquiredAt: new Date("2023-08-01"),
    estimatedValue: 120.5,
    lastSalePrice: 115.0,
    isBundle: true,
    bundleCount: 3,
    chainId: apeChainCurtis.id,
    bundleItems: [
      {
        contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
        tokenId: "2001",
        name: "Bored Ape #2001",
        image: "https://picsum.photos/400/400?random=2001",
        collection: "Bored Ape Yacht Club",
        acquiredAt: new Date("2023-08-01"),
        estimatedValue: 48.5,
        rarity: "1",
        chainId: apeChainCurtis.id
      },
      {
        contractAddress: "0x60E4d786628Fea6478F785A6d7e704777c86a7c6",
        tokenId: "3001",
        name: "Mutant Ape #3001",
        image: "https://picsum.photos/400/400?random=3001",
        collection: "Mutant Ape Yacht Club",
        acquiredAt: new Date("2023-08-01"),
        estimatedValue: 12.0,
        rarity: "2",
        chainId: apeChainCurtis.id
      },
      {
        contractAddress: "0xED5AF388653567Af2F388E6224dC7C4b3241C544",
        tokenId: "4001",
        name: "Azuki #4001",
        image: "https://picsum.photos/400/400?random=4001",
        collection: "Azuki",
        acquiredAt: new Date("2023-08-01"),
        estimatedValue: 8.2,
        rarity: "3",
        chainId: apeChainCurtis.id
      }
    ],
    listing: {
      type: "sale" as const,
      sale: {
        price: 120.5,
        lastSalePrice: 115.0
      }
    }
  },
  {
    contractAddress: "0x524cAB2ec69124574082676e6F654a18df49A048",
    tokenId: "bundle-bayc-2",
    name: "Ape Combo Pack",
    image: "https://picsum.photos/400/400?random=bundle2",
    collection: "Mixed Collections",
    acquiredAt: new Date("2023-07-15"),
    estimatedValue: 95.8,
    lastSalePrice: 89.2,
    isBundle: true,
    bundleCount: 2,
    chainId: sepolia.id,
    bundleItems: [
      {
        contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
        tokenId: "2002",
        name: "Bored Ape #2002",
        image: "https://picsum.photos/400/400?random=2002",
        collection: "Bored Ape Yacht Club",
        acquiredAt: new Date("2023-07-15"),
        estimatedValue: 51.3,
        rarity: "2",
        chainId: sepolia.id
      },
      {
        contractAddress: "0x60E4d786628Fea6478F785A6d7e704777c86a7c6",
        tokenId: "3002",
        name: "Mutant Ape #3002",
        image: "https://picsum.photos/400/400?random=3002",
        collection: "Mutant Ape Yacht Club",
        acquiredAt: new Date("2023-07-15"),
        estimatedValue: 44.5,
        rarity: "1",
        chainId: sepolia.id
      }
    ],
    listing: {
      type: "rent" as const,
      rent: {
        pricePerDay: 8.5,
        minDays: 3,
        maxDays: 14
      }
    }
  },
  {
    contractAddress: "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
    tokenId: "bundle-bayc-3",
    name: "Blue Chip Bundle",
    image: "https://picsum.photos/400/400?random=bundle3",
    collection: "Mixed Collections",
    acquiredAt: new Date("2023-06-10"),
    estimatedValue: 185.2,
    lastSalePrice: 178.0,
    isBundle: true,
    bundleCount: 4,
    chainId: apeChainCurtis.id,
    bundleItems: [
      {
        contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
        tokenId: "2003",
        name: "Bored Ape #2003",
        image: "https://picsum.photos/400/400?random=2003",
        collection: "Bored Ape Yacht Club",
        acquiredAt: new Date("2023-06-10"),
        estimatedValue: 62.0,
        rarity: "1",
        chainId: apeChainCurtis.id
      },
      {
        contractAddress: "0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6",
        tokenId: "5001",
        name: "CryptoPunk #5001",
        image: "https://picsum.photos/400/400?random=5001",
        collection: "CryptoPunks",
        acquiredAt: new Date("2023-06-10"),
        estimatedValue: 95.5,
        rarity: "1",
        chainId: apeChainCurtis.id
      },
      {
        contractAddress: "0x23581767a106ae21c074b2276D25e5C3e136a68b",
        tokenId: "6001",
        name: "Moonbird #6001",
        image: "https://picsum.photos/400/400?random=6001",
        collection: "Moonbirds",
        acquiredAt: new Date("2023-06-10"),
        estimatedValue: 15.2,
        rarity: "2",
        chainId: apeChainCurtis.id
      },
      {
        contractAddress: "0x1A92f7381B9F03921564a437210bB9396471050C",
        tokenId: "7001",
        name: "Cool Cat #7001",
        image: "https://picsum.photos/400/400?random=7001",
        collection: "Cool Cats NFT",
        acquiredAt: new Date("2023-06-10"),
        estimatedValue: 12.5,
        rarity: "3",
        chainId: apeChainCurtis.id
      }
    ],
    listing: {
      type: "swap" as const,
      swap: {
        wantedCollection: "Art Blocks",
        wantedTokenId: "Any",
        wantedTraits: ["Fidenza", "Chromie Squiggle", "Any"]
      }
    }
  }
]

// Mock NFTs in collection
const mockCollectionNFTs = [
  {
    contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
    tokenId: "1001",
    name: "Bored Ape #1001",
    image: "https://picsum.photos/400/400?random=1001",
    collection: "Bored Ape Yacht Club",
    acquiredAt: new Date("2023-12-01"),
    estimatedValue: 45.5,
    rarity: "2",
    lastSalePrice: 42.0,
    chainId: apeChainCurtis.id,
    listing: {
      type: "sale" as const,
      sale: {
        price: 45.5,
        lastSalePrice: 42.0
      }
    }
  },
  {
    contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
    tokenId: "1002",
    name: "Bored Ape #1002",
    image: "https://picsum.photos/400/400?random=1002",
    collection: "Bored Ape Yacht Club",
    acquiredAt: new Date("2023-11-15"),
    estimatedValue: 52.3,
    rarity: "1",
    lastSalePrice: 48.8,
    chainId: sepolia.id,
    listing: {
      type: "rent" as const,
      rent: {
        pricePerDay: 3.5,
        minDays: 1,
        maxDays: 30
      }
    }
  },
  {
    contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
    tokenId: "1003",
    name: "Bored Ape #1003",
    image: "https://picsum.photos/400/400?random=1003",
    collection: "Bored Ape Yacht Club",
    acquiredAt: new Date("2023-10-10"),
    estimatedValue: 38.7,
    rarity: "3",
    lastSalePrice: 36.2,
    chainId: apeChainCurtis.id,
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
    contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
    tokenId: "1004",
    name: "Bored Ape #1004",
    image: "https://picsum.photos/400/400?random=1004",
    collection: "Bored Ape Yacht Club",
    acquiredAt: new Date("2023-09-05"),
    estimatedValue: 41.1,
    rarity: "4",
    lastSalePrice: 39.9,
    chainId: sepolia.id,
    listing: {
      type: "none" as const
    }
  },
  {
    contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
    tokenId: "1005",
    name: "Bored Ape #1005",
    image: "https://picsum.photos/400/400?random=1005",
    collection: "Bored Ape Yacht Club",
    acquiredAt: new Date("2023-08-01"),
    estimatedValue: 47.8,
    rarity: "2",
    lastSalePrice: 44.5,
    chainId: apeChainCurtis.id,
    listing: {
      type: "sale" as const,
      sale: {
        price: 47.8,
        lastSalePrice: 44.5
      }
    }
  },
  {
    contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
    tokenId: "1006",
    name: "Bored Ape #1006",
    image: "https://picsum.photos/400/400?random=1006",
    collection: "Bored Ape Yacht Club",
    acquiredAt: new Date("2023-07-15"),
    estimatedValue: 35.2,
    rarity: "5",
    lastSalePrice: 33.8,
    chainId: sepolia.id,
    listing: {
      type: "rent" as const,
      rent: {
        pricePerDay: 2.8,
        minDays: 2,
        maxDays: 14
      }
    }
  }
]

// Mock activity data for the collection
const mockCollectionActivity = [
  {
    id: "1",
    type: "sale",
    nftName: "Bored Ape #2547",
    nftImage: "https://picsum.photos/100/100?random=activity1",
    price: "52.3",
    from: "0x1234...5678",
    to: "0x9876...4321",
    date: new Date("2024-01-20T14:30:00Z"),
    txHash: "0xabcd...ef12",
    tokenId: "2547"
  },
  {
    id: "2",
    type: "sale",
    nftName: "Bored Ape #1892",
    nftImage: "https://picsum.photos/100/100?random=activity2",
    price: "48.7",
    from: "0x5555...6666",
    to: "0x1111...2222",
    date: new Date("2024-01-20T12:15:00Z"),
    txHash: "0x2222...3333",
    tokenId: "1892"
  },
  {
    id: "3",
    type: "transfer",
    nftName: "Bored Ape #3456",
    nftImage: "https://picsum.photos/100/100?random=activity3",
    from: "0x7777...8888",
    to: "0x9999...0000",
    date: new Date("2024-01-20T10:45:00Z"),
    txHash: "0x4444...5555",
    tokenId: "3456"
  },
  {
    id: "4",
    type: "listing",
    nftName: "Bored Ape #7234",
    nftImage: "https://picsum.photos/100/100?random=activity4",
    price: "65.0",
    from: "0xaaaa...bbbb",
    date: new Date("2024-01-20T09:20:00Z"),
    txHash: "0x6666...7777",
    tokenId: "7234"
  },
  {
    id: "5",
    type: "sale",
    nftName: "Bored Ape #5678",
    nftImage: "https://picsum.photos/100/100?random=activity5",
    price: "41.2",
    from: "0xcccc...dddd",
    to: "0xeeee...ffff",
    date: new Date("2024-01-19T18:30:00Z"),
    txHash: "0x8888...9999",
    tokenId: "5678"
  },
  {
    id: "6",
    type: "mint",
    nftName: "Bored Ape #9876",
    nftImage: "https://picsum.photos/100/100?random=activity6",
    to: "0x1111...3333",
    date: new Date("2024-01-19T16:15:00Z"),
    txHash: "0xaaaa...cccc",
    tokenId: "9876"
  },
  {
    id: "7",
    type: "offer",
    nftName: "Bored Ape #4321",
    nftImage: "https://picsum.photos/100/100?random=activity7",
    price: "38.5",
    from: "0x2222...4444",
    date: new Date("2024-01-19T14:00:00Z"),
    txHash: "0xbbbb...dddd",
    tokenId: "4321"
  },
  {
    id: "8",
    type: "sale",
    nftName: "Bored Ape #8765",
    nftImage: "https://picsum.photos/100/100?random=activity8",
    price: "55.8",
    from: "0x3333...5555",
    to: "0x6666...8888",
    date: new Date("2024-01-19T11:30:00Z"),
    txHash: "0xcccc...eeee",
    tokenId: "8765"
  }
]

// Helper functions for news feed
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const formatPostTime = (date: Date) => {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return "now"
  if (diffInMinutes < 60) return `${diffInMinutes}m`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const renderPostContent = (content: string) => {
  // Split content by line breaks and render with proper spacing
  return content.split('\n').map((line, index) => (
    <span key={index}>
      {line}
      {index < content.split('\n').length - 1 && <br />}
    </span>
  ))
}

// Helper functions for community chat
const getChannelIcon = (type: string) => {
  switch (type) {
    case "announcement":
      return <Volume2 className="h-4 w-4 text-yellow-400" />
    case "private":
      return <Lock className="h-4 w-4 text-purple-400" />
    case "voice":
      return <Volume2 className="h-4 w-4 text-green-400" />
    default:
      return <Hash className="h-4 w-4 text-muted-foreground" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "online":
      return "bg-green-500"
    case "away":
      return "bg-yellow-500"
    case "idle":
      return "bg-orange-500"
    default:
      return "bg-gray-500"
  }
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case "Founder":
      return <Crown className="h-3 w-3" />
    case "OG Holder":
    case "Whale":
      return <Shield className="h-3 w-3" />
    default:
      return null
  }
}

export default function CollectionsPage() {
  const [activeTab, setActiveTab] = useState("collection")
  const [selectedNFT, setSelectedNFT] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [swapModalOpen, setSwapModalOpen] = useState(false)
  const [swapListingId, setSwapListingId] = useState<string>("")
  const [swapListedNFT, setSwapListedNFT] = useState<NFTWithTraits | null>(null)
  const [swapCriteria, setSwapCriteria] = useState<SwapCriteria | null>(null)
  const [activeChannel, setActiveChannel] = useState("general")
  const [chatMessage, setChatMessage] = useState("")
  const { toast } = useToast()

  const handleNFTClick = (nft: any) => {
    setSelectedNFT(nft)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedNFT(null)
  }

  const handleSwapClick = (nft: any) => {
    if (!nft.listing?.swap) return

    const listingId = `${nft.contractAddress}-${nft.tokenId}`
    const criteria: SwapCriteria = {
      wantedCollection: nft.listing.swap.wantedCollection,
      wantedTokenId: nft.listing.swap.wantedTokenId,
      wantedTraits: nft.listing.swap.wantedTraits,
      chainId: nft.chainId
    }

    setSwapListingId(listingId)
    setSwapListedNFT(nft as NFTWithTraits)
    setSwapCriteria(criteria)
    setSwapModalOpen(true)
  }

  const handleSwapModalClose = () => {
    setSwapModalOpen(false)
    setSwapListingId("")
    setSwapListedNFT(null)
    setSwapCriteria(null)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "sale":
        return <DollarSign className="h-5 w-5 text-green-500" />
      case "transfer":
        return <ArrowLeftRight className="h-5 w-5 text-blue-500" />
      case "listing":
        return <TrendingUp className="h-5 w-5 text-orange-500" />
      case "offer":
        return <Eye className="h-5 w-5 text-purple-500" />
      case "mint":
        return <Palette className="h-5 w-5 text-pink-500" />
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />
    }
  }

  const formatActivityType = (type: string) => {
    switch (type) {
      case "sale": return "Sale"
      case "transfer": return "Transfer"
      case "listing": return "Listed"
      case "offer": return "Offer"
      case "mint": return "Minted"
      default: return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`

    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Banner Section */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={mockCollection.bannerImage}
          alt="Collection Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Collection Header */}
      <div className="relative -mt-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Collection Logo */}
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
              <AvatarImage src={mockCollection.logo} alt={mockCollection.name} />
              <AvatarFallback className="text-2xl font-bold">
                {mockCollection.symbol}
              </AvatarFallback>
            </Avatar>
            {mockCollection.verified && (
              <Badge className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
                ✓ Verified
              </Badge>
            )}
          </div>

          {/* Collection Info */}
          <div className="flex-1 space-y-4 mt-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2 neon-text">
                {mockCollection.name}
              </h1>
              <p className="text-muted-foreground max-w-3xl">
                {mockCollection.description}
              </p>
            </div>

            {/* Contract Address */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Contract:</span>
              <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {formatAddress(mockCollection.contractAddress)}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(mockCollection.contractAddress, "Contract Address")}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                <a
                  href={`https://apechain.calderaexplorer.xyz/address/${mockCollection.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{mockCollection.totalSupply.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Supply</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{mockCollection.owners.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Owners</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{mockCollection.floorPrice} APE</p>
                  <p className="text-sm text-muted-foreground">Floor Price</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{mockCollection.volume24h} APE</p>
                  <p className="text-sm text-muted-foreground">24h Volume</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-card/50 border border-border/50">
              <TabsTrigger value="collection" className="flex items-center gap-2">
                <Grid3x3 className="h-4 w-4" />
                <span className="hidden sm:inline">Collection</span>
              </TabsTrigger>
              <TabsTrigger value="bundles" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Bundles</span>
              </TabsTrigger>
              <TabsTrigger value="news" className="flex items-center gap-2">
                <Newspaper className="h-4 w-4" />
                <span className="hidden sm:inline">News Feed</span>
              </TabsTrigger>
              <TabsTrigger value="community" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Community</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Activity</span>
              </TabsTrigger>
            </TabsList>

            {/* Collection Tab */}
            <TabsContent value="collection" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {mockCollectionNFTs.map((nft) => (
                  <Card
                    key={`${nft.contractAddress}-${nft.tokenId}`}
                    className="group bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 overflow-hidden cursor-pointer"
                    onClick={() => handleNFTClick(nft)}
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

                      {/* Watchlist Button */}
                      <div className="absolute top-3 right-3 z-50">
                        <WatchlistToggle
                          contractAddress={nft.contractAddress}
                          tokenId={nft.tokenId}
                          name={nft.name}
                          collection={nft.collection}
                          image={nft.image}
                          chainId={nft.chainId}
                          className="bg-black/50 hover:bg-black/70 text-white"
                        />
                      </div>

                      {/* Action Buttons Overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end pointer-events-none">
                        <div className="p-4 w-full pointer-events-auto">
                          {nft.listing?.type === "sale" && (
                            <Button
                              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 neon-glow"
                              onClick={(e) => {
                                e.stopPropagation()
                                // Handle buy action here
                              }}
                            >
                              Buy for {nft.listing.sale.price} APE
                            </Button>
                          )}
                          {nft.listing?.type === "rent" && (
                            <Button
                              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 neon-glow"
                              onClick={(e) => {
                                e.stopPropagation()
                                // Handle rent action here
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
                                handleSwapClick(nft)
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
                                handleNFTClick(nft)
                              }}
                            >
                              View Details
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
                          {/* Listing Status Badge */}
                          {nft.listing && nft.listing.type !== "none" && (
                            <Badge
                              className={`mb-1 text-xs ${
                                nft.listing.type === "sale" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                                nft.listing.type === "rent" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                                "bg-purple-500/20 text-purple-400 border-purple-500/30"
                              }`}
                            >
                              {nft.listing.type === "sale" ? "For Sale" :
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

                        {/* No Listing - Show Last Sale Price */}
                        {(!nft.listing || nft.listing.type === "none") && (
                          <div>
                            {nft.lastSalePrice ? (
                              <p className="font-bold text-muted-foreground text-lg">
                                Last Sale: {nft.lastSalePrice} APE
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                Not for sale
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Bundles Tab */}
            <TabsContent value="bundles" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {mockCollectionBundles.map((nft) => (
                  <Card
                    key={nft.tokenId}
                    className="group bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 overflow-hidden cursor-pointer"
                    onClick={() => handleNFTClick(nft)}
                  >
                    {/* Bundle NFT Layout */}
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
                              src={`https://picsum.photos/100/100?random=${nft.tokenId}-${idx}`}
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

                      {/* Watchlist Button */}
                      <div className="absolute top-4 right-4 z-50">
                        <WatchlistToggle
                          contractAddress={nft.contractAddress}
                          tokenId={nft.tokenId}
                          name={nft.name}
                          collection={nft.collection}
                          image={nft.image}
                          chainId={nft.chainId}
                          className="bg-black/50 hover:bg-black/70 text-white"
                        />
                      </div>

                      {/* Action Buttons Overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end pointer-events-none">
                        <div className="p-4 w-full pointer-events-auto">
                          {nft.listing?.type === "sale" && (
                            <Button
                              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 neon-glow"
                              onClick={(e) => {
                                e.stopPropagation()
                              }}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Buy Bundle
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
                              Rent Bundle
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
                              View Bundle
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
                            <span className="ml-2 text-orange-400">
                              • {nft.bundleCount} items
                            </span>
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
                              {nft.listing.type === "sale" ? "For Sale" :
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

                        {/* No Listing - Show Last Sale Price */}
                        {(!nft.listing || nft.listing.type === "none") && (
                          <div>
                            {nft.lastSalePrice ? (
                              <p className="font-bold text-muted-foreground text-lg">
                                Last Sale: {nft.lastSalePrice} APE
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                Not for sale
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* News Feed Tab */}
            <TabsContent value="news" className="space-y-6 mt-6">
              <div className="max-w-2xl mx-auto space-y-6">
                {mockNewsFeedPosts.map((post) => (
                  <Card key={post.id} className="border-border/50 bg-card/50 hover:bg-card/70 transition-colors overflow-hidden">
                    <CardContent className="p-0">
                      {/* Post Header */}
                      <div className="flex items-start gap-3 p-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <Avatar className="h-12 w-12 border-2 border-primary/20">
                            <AvatarImage src={post.author.avatar} alt={post.author.name} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {post.author.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        {/* Author Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-foreground truncate">
                              {post.author.name}
                            </h4>
                            {post.author.verified && (
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs px-1 py-0">
                                ✓
                              </Badge>
                            )}
                            {post.author.isOwner && (
                              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs px-1 py-0">
                                Owner
                              </Badge>
                            )}
                            {post.isPinned && (
                              <Pin className="h-4 w-4 text-orange-400" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{post.author.username}</span>
                            <span>•</span>
                            <span>{formatPostTime(post.timestamp)}</span>
                          </div>
                        </div>

                        {/* More Options */}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Post Content */}
                      <div className="px-4 pb-4">
                        <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                          {renderPostContent(post.content)}
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {post.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-primary border-primary/30 hover:bg-primary/10 cursor-pointer text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Media Content */}
                      {post.media && post.media.length > 0 && (
                        <div className="mb-4">
                          {post.media.length === 1 ? (
                            // Single Media Item
                            <div className="relative">
                              {post.media[0].type === "image" ? (
                                <img
                                  src={post.media[0].url}
                                  alt={post.media[0].alt}
                                  className="w-full max-h-96 object-cover border-t border-b border-border/30"
                                />
                              ) : (
                                <div className="relative w-full max-h-96 bg-black border-t border-b border-border/30">
                                  <img
                                    src={post.media[0].thumbnail}
                                    alt={post.media[0].alt}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-black/70 rounded-full p-4">
                                      <Video className="h-8 w-8 text-white" />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            // Multiple Media Items Grid
                            <div className={`grid gap-1 border-t border-b border-border/30 ${
                              post.media.length === 2 ? "grid-cols-2" : "grid-cols-2"
                            }`}>
                              {post.media.slice(0, 4).map((item, index) => (
                                <div key={index} className="relative aspect-square overflow-hidden">
                                  {item.type === "image" ? (
                                    <img
                                      src={item.url}
                                      alt={item.alt}
                                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                    />
                                  ) : (
                                    <div className="relative w-full h-full bg-black">
                                      <img
                                        src={item.thumbnail}
                                        alt={item.alt}
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-black/70 rounded-full p-2">
                                          <Video className="h-4 w-4 text-white" />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {/* Show +X more overlay for extra images */}
                                  {index === 3 && post.media.length > 4 && (
                                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                      <span className="text-white font-bold text-lg">
                                        +{post.media.length - 4}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Post Actions */}
                      <div className="flex items-center justify-between px-4 py-3 border-t border-border/30">
                        <div className="flex items-center gap-6">
                          {/* Like Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 gap-2 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors group"
                          >
                            <Heart className="h-4 w-4 group-hover:fill-current" />
                            <span className="text-sm font-medium">
                              {formatNumber(post.stats.likes)}
                            </span>
                          </Button>

                          {/* Comment Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 gap-2 text-muted-foreground hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {formatNumber(post.stats.comments)}
                            </span>
                          </Button>

                          {/* Share Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 gap-2 text-muted-foreground hover:text-green-400 hover:bg-green-400/10 transition-colors"
                          >
                            <Share2 className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {formatNumber(post.stats.shares)}
                            </span>
                          </Button>
                        </div>

                        {/* Engagement Indicator */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Zap className="h-3 w-3" />
                          <span>{formatNumber(post.stats.likes + post.stats.comments + post.stats.shares)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Load More Button */}
                <div className="text-center py-6">
                  <Button variant="outline" className="bg-card/50 border-border/50 hover:bg-card/70">
                    <Newspaper className="h-4 w-4 mr-2" />
                    Load More Posts
                  </Button>
                </div>

                {/* Create Post Prompt for Collection Owners */}
                <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
                  <CardContent className="p-6 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Newspaper className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Share Collection Updates</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Keep your community engaged with the latest news, events, and announcements
                        </p>
                        <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                          Create Post
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Community Tab */}
            <TabsContent value="community" className="mt-6">
              <div className="h-[600px] bg-card/30 border border-border/50 rounded-lg overflow-hidden">
                {/* Main Chat Area */}
                <div className="h-full flex flex-col">
                    {/* Channel Header */}
                    <div className="p-4 border-b border-border/50 bg-card/30">
                      <div className="flex items-center gap-3">
                        {getChannelIcon(mockCommunityChannels.find(c => c.id === activeChannel)?.type || "text")}
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">
                            {mockCommunityChannels.find(c => c.id === activeChannel)?.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {mockCommunityChannels.find(c => c.id === activeChannel)?.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Search className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <AtSign className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {mockChatMessages.map((message, index) => (
                        <div key={message.id} className="group hover:bg-muted/20 -mx-4 px-4 py-1 rounded transition-colors">
                          <div className="flex gap-3">
                            <Avatar className="h-10 w-10 mt-0.5">
                              <AvatarImage src={message.author.avatar} alt={message.author.displayName} />
                              <AvatarFallback className="text-xs">
                                {message.author.username.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              {/* Message Header */}
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className="font-semibold text-sm"
                                  style={{ color: message.author.roleColor }}
                                >
                                  {message.author.displayName}
                                </span>
                                {getRoleIcon(message.author.role)}
                                {message.author.isVerified && (
                                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs px-1 py-0 h-4">
                                    ✓
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {formatPostTime(message.timestamp)}
                                </span>
                              </div>

                              {/* Message Content */}
                              <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                {message.content}
                              </div>

                              {/* Attachments */}
                              {message.attachments.length > 0 && (
                                <div className="mt-2">
                                  {message.attachments.map((attachment, idx) => (
                                    <div key={idx} className="relative inline-block">
                                      <img
                                        src={attachment.url}
                                        alt={attachment.name}
                                        className="max-w-sm max-h-64 rounded border border-border/50 hover:opacity-80 transition-opacity cursor-pointer"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Reactions */}
                              <div className="flex items-center gap-1 mt-2">
                                {message.reactions.map((reaction, idx) => (
                                  <button
                                    key={idx}
                                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                                      reaction.userReacted
                                        ? "bg-primary/20 border border-primary/30 text-primary"
                                        : "bg-muted/50 hover:bg-muted/70 text-muted-foreground hover:text-foreground"
                                    }`}
                                  >
                                    <span>{reaction.emoji}</span>
                                    <span className="font-medium">{reaction.count}</span>
                                  </button>
                                ))}
                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Smile className="h-3 w-3" />
                                </Button>
                              </div>

                              {/* Reply Thread */}
                              {message.replies > 0 && (
                                <button className="flex items-center gap-2 mt-2 text-xs text-primary hover:text-primary/80 transition-colors">
                                  <MessageCircle className="h-3 w-3" />
                                  <span>{message.replies} {message.replies === 1 ? "reply" : "replies"}</span>
                                  <span className="text-muted-foreground">View thread</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-border/50 bg-card/30">
                      <div className="relative">
                        <div className="flex items-center gap-2 bg-muted/50 rounded-lg border border-border/50 focus-within:border-primary/50 transition-colors">
                          <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
                            <Paperclip className="h-4 w-4" />
                          </Button>
                          <input
                            type="text"
                            placeholder={`Message #${mockCommunityChannels.find(c => c.id === activeChannel)?.name}`}
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            className="flex-1 bg-transparent py-3 px-2 text-sm focus:outline-none placeholder:text-muted-foreground"
                          />
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Smile className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            className="h-8 w-8 mr-2 bg-primary hover:bg-primary/90"
                            disabled={!chatMessage.trim()}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 px-2">
                          🔒 Token gated community - Only verified {mockCollection.symbol} holders can participate
                        </p>
                      </div>
                    </div>
                </div>
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6 mt-6">
              <div className="space-y-4">
                {mockCollectionActivity.map((activity) => (
                  <Card key={activity.id} className="border-border/50 bg-card/50 hover:bg-card/70 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Activity Icon */}
                        <div className="flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>

                        {/* NFT Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={activity.nftImage}
                            alt={activity.nftName}
                            className="w-12 h-12 rounded-lg object-cover border border-border/30"
                          />
                        </div>

                        {/* Activity Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground">
                              {formatActivityType(activity.type)}
                            </span>
                            <span className="text-sm text-muted-foreground truncate">
                              {activity.nftName}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {/* Price (for sales, listings, offers) */}
                            {activity.price && (
                              <span className="font-medium text-primary">
                                {activity.price} APE
                              </span>
                            )}

                            {/* From/To addresses */}
                            <div className="flex items-center gap-2">
                              {activity.from && (
                                <span>
                                  from <code className="text-xs bg-muted px-1 rounded">{formatAddress(activity.from)}</code>
                                </span>
                              )}
                              {activity.to && (
                                <span>
                                  to <code className="text-xs bg-muted px-1 rounded">{formatAddress(activity.to)}</code>
                                </span>
                              )}
                            </div>

                            {/* Time */}
                            <span className="text-xs">
                              {getRelativeTime(activity.date)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0 flex items-center gap-2">
                          {/* Copy Transaction Hash */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(activity.txHash, "Transaction Hash")}
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>

                          {/* View on Explorer */}
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 w-8 p-0"
                          >
                            <a
                              href={`https://apechain.calderaexplorer.xyz/tx/${activity.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Load More Button */}
                <div className="text-center pt-4">
                  <Button variant="outline" className="bg-card/50 border-border/50 hover:bg-card/70">
                    Load More Activity
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* NFT Details Modal */}
      <NFTDetailsModal
        nft={selectedNFT}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />

      {/* Swap Modal */}
      {swapListedNFT && swapCriteria && (
        <SwapModal
          isOpen={swapModalOpen}
          onClose={handleSwapModalClose}
          listingId={swapListingId}
          listedNFT={swapListedNFT}
          swapCriteria={swapCriteria}
        />
      )}
    </div>
  )
}