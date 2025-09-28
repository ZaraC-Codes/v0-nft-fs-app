"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  UserPlus,
  Share2,
  ExternalLink,
  Copy,
  CheckCircle,
  Calendar,
  Wallet,
  Twitter,
  Globe,
  MessageCircle,
  Heart,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { FollowModal } from "./follow-modal"
import { EditProfileModal } from "./edit-profile-modal"

interface UserProfileProps {
  user: {
    id: string
    username: string
    displayName: string
    bio: string
    avatar: string
    banner: string
    isVerified: boolean
    walletAddress: string
    joinedDate: string
    stats: {
      followers: number
      following: number
      nftsOwned: number
      nftsCreated: number
      totalVolume: string
    }
    socialLinks: {
      twitter?: string
      discord?: string
      website?: string
    }
    collections: Array<{
      id: string
      name: string
      itemCount: number
      floorPrice: string
      image: string
    }>
    ownedNFTs: Array<{
      id: string
      title: string
      image: string
      price: string
      rarity: string
    }>
    createdNFTs: Array<{
      id: string
      title: string
      image: string
      price: string
      rarity: string
    }>
  }
}

const rarityColors = {
  Legendary: "from-yellow-400 to-orange-500",
  Epic: "from-purple-400 to-pink-500",
  Rare: "from-blue-400 to-cyan-500",
  Common: "from-gray-400 to-gray-500",
}

export function UserProfile({ user }: UserProfileProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [showFollowModal, setShowFollowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [followType, setFollowType] = useState<"followers" | "following">("followers")
  const { toast } = useToast()

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    toast({
      title: isFollowing ? "Unfollowed" : "Following",
      description: isFollowing ? `You unfollowed ${user.displayName}` : `You are now following ${user.displayName}`,
    })
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Profile link copied",
      description: "Profile link copied to clipboard",
    })
  }

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(user.walletAddress)
    toast({
      title: "Wallet address copied",
      description: "Wallet address copied to clipboard",
    })
  }

  const openFollowModal = (type: "followers" | "following") => {
    setFollowType(type)
    setShowFollowModal(true)
  }

  return (
    <div className="relative">
      {/* Banner */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={user.banner || "/placeholder.svg"} alt="Profile banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
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

      {/* Profile Info */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8">
          <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <Avatar className="w-32 h-32 border-4 border-background bg-card">
              <AvatarImage src={user.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-secondary text-white">
                {user.displayName[0]}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{user.displayName}</h1>
                {user.isVerified && <CheckCircle className="h-6 w-6 text-primary" />}
              </div>
              <p className="text-muted-foreground">@{user.username}</p>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(user.joinedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Wallet className="h-4 w-4" />
                  <span
                    className="font-mono cursor-pointer hover:text-primary transition-colors"
                    onClick={copyWalletAddress}
                  >
                    {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                  </span>
                  <Copy className="h-3 w-3 cursor-pointer hover:text-primary" onClick={copyWalletAddress} />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Button
              onClick={handleFollow}
              className={
                isFollowing
                  ? "bg-secondary/20 text-secondary border border-secondary/50 hover:bg-secondary/30"
                  : "bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 neon-glow"
              }
            >
              {isFollowing ? (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Follow
                </>
              )}
            </Button>
            <Button variant="outline" className="bg-transparent">
              <MessageCircle className="mr-2 h-4 w-4" />
              Message
            </Button>
            <Button variant="outline" onClick={() => setShowEditModal(true)} className="bg-transparent">
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="mb-6">
            <p className="text-muted-foreground leading-relaxed max-w-2xl">{user.bio}</p>
          </div>
        )}

        {/* Social Links */}
        {(user.socialLinks.twitter || user.socialLinks.website) && (
          <div className="flex items-center space-x-4 mb-8">
            {user.socialLinks.twitter && (
              <a
                href={user.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter className="h-4 w-4" />
                <span>Twitter</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {user.socialLinks.website && (
              <a
                href={user.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span>Website</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-card/30 border-border/50 p-4 text-center">
            <p className="text-2xl font-bold text-primary neon-text">{user.stats.followers.toLocaleString()}</p>
            <p
              className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors"
              onClick={() => openFollowModal("followers")}
            >
              Followers
            </p>
          </Card>
          <Card className="bg-card/30 border-border/50 p-4 text-center">
            <p className="text-2xl font-bold text-secondary neon-text">{user.stats.following.toLocaleString()}</p>
            <p
              className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors"
              onClick={() => openFollowModal("following")}
            >
              Following
            </p>
          </Card>
          <Card className="bg-card/30 border-border/50 p-4 text-center">
            <p className="text-2xl font-bold text-accent neon-text">{user.stats.nftsOwned}</p>
            <p className="text-sm text-muted-foreground">NFTs Owned</p>
          </Card>
          <Card className="bg-card/30 border-border/50 p-4 text-center">
            <p className="text-2xl font-bold text-primary neon-text">{user.stats.nftsCreated}</p>
            <p className="text-sm text-muted-foreground">NFTs Created</p>
          </Card>
          <Card className="bg-card/30 border-border/50 p-4 text-center">
            <p className="text-2xl font-bold text-secondary neon-text">{user.stats.totalVolume}</p>
            <p className="text-sm text-muted-foreground">Total Volume</p>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="owned" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-card/30 mb-8">
            <TabsTrigger value="owned">Owned ({user.ownedNFTs.length})</TabsTrigger>
            <TabsTrigger value="created">Created ({user.createdNFTs.length})</TabsTrigger>
            <TabsTrigger value="collections">Collections ({user.collections.length})</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="owned">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {user.ownedNFTs.map((nft) => (
                <Card
                  key={nft.id}
                  className="group bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 overflow-hidden cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={nft.image || "/placeholder.svg"}
                      alt={nft.title}
                      className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <Badge
                      className={`absolute top-3 left-3 bg-gradient-to-r ${rarityColors[nft.rarity as keyof typeof rarityColors]} text-white border-0 neon-glow`}
                    >
                      {nft.rarity}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{nft.title}</h3>
                    <p className="font-bold text-primary neon-text">{nft.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="created">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {user.createdNFTs.map((nft) => (
                <Card
                  key={nft.id}
                  className="group bg-card/50 border-border/50 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/20 overflow-hidden cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={nft.image || "/placeholder.svg"}
                      alt={nft.title}
                      className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <Badge
                      className={`absolute top-3 left-3 bg-gradient-to-r ${rarityColors[nft.rarity as keyof typeof rarityColors]} text-white border-0 neon-glow`}
                    >
                      {nft.rarity}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1 group-hover:text-secondary transition-colors">{nft.title}</h3>
                    <p className="font-bold text-secondary neon-text">{nft.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="collections">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.collections.map((collection) => (
                <Card
                  key={collection.id}
                  className="group bg-card/50 border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 overflow-hidden cursor-pointer"
                >
                  <div className="relative h-48">
                    <img
                      src={collection.image || "/placeholder.svg"}
                      alt={collection.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 group-hover:text-accent transition-colors">{collection.name}</h3>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{collection.itemCount} items</span>
                      <span className="text-accent font-semibold">Floor: {collection.floorPrice}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="space-y-4">
              <Card className="bg-card/30 border-border/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="border-primary/50 text-primary">
                      Purchase
                    </Badge>
                    <div>
                      <p className="font-semibold">Bought Cyber Samurai #001</p>
                      <p className="text-sm text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                  <span className="font-bold text-primary">2.5 ETH</span>
                </div>
              </Card>
              <Card className="bg-card/30 border-border/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="border-secondary/50 text-secondary">
                      Sale
                    </Badge>
                    <div>
                      <p className="font-semibold">Sold Digital Dreams #042</p>
                      <p className="text-sm text-muted-foreground">1 week ago</p>
                    </div>
                  </div>
                  <span className="font-bold text-secondary">1.8 ETH</span>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <FollowModal
        isOpen={showFollowModal}
        onClose={() => setShowFollowModal(false)}
        type={followType}
        username={user.username}
      />
      <EditProfileModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} user={user} />
    </div>
  )
}
