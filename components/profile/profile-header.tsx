"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import {
  UserPlus,
  UserMinus,
  Settings,
  Share2,
  MoreHorizontal,
  CheckCircle,
  Copy,
  ExternalLink,
  Plus,
  Package,
  Vault,
  Twitter,
  Globe,
  MessageCircle,
  Camera,
  Github
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserProfile } from "@/types/profile"
import { useProfile } from "./profile-provider"
import { useAuth } from "@/components/auth/auth-provider"
import { EditProfileModal } from "./edit-profile-modal"
import Link from "next/link"

interface ProfileHeaderProps {
  profile: UserProfile
}

export function ProfileHeader({ profile: profileProp }: ProfileHeaderProps) {
  const { user } = useAuth()
  const { userProfile, isFollowing, followUser, unfollowUser, loading } = useProfile()
  const [copied, setCopied] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)

  // Use userProfile from context if available and matches the prop, otherwise use prop
  // This ensures counts update from ProfileProvider context
  const profile = (userProfile?.id === profileProp.id) ? userProfile : profileProp

  const isOwnProfile = user?.id === profile.id
  const isFollowingUser = isFollowing(profile.id)

  const handleFollowToggle = async () => {
    if (isFollowingUser) {
      await unfollowUser(profile.id)
    } else {
      await followUser(profile.id)
    }
  }

  const copyAddress = async () => {
    if (profile.walletAddress) {
      await navigator.clipboard.writeText(profile.walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareProfile = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${profile.username}'s Profile`,
        text: profile.bio || `Check out ${profile.username}'s NFT profile`,
        url: window.location.href,
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-xl">
      {/* Cover Image */}
      {profile.coverImage && (
        <div className="relative h-48 md:h-64 w-full">
          <Image
            src={profile.coverImage}
            alt="Cover"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>
      )}

      <CardContent className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className={`relative ${profile.coverImage ? '-mt-16 md:-mt-20' : ''}`}>
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-xl">
              <AvatarImage
                src={profile.avatar || profile.oauthProfilePicture}
                alt={profile.username}
              />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-2xl md:text-3xl">
                {profile.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            {/* Header Row */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-2">
                {/* Username and Verification */}
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold">{profile.username}</h1>
                  {profile.verified && (
                    <CheckCircle className="h-6 w-6 text-primary" />
                  )}
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-muted-foreground max-w-2xl">{profile.bio}</p>
                )}

                {/* Wallet Address */}
                {profile.showWalletAddress && profile.walletAddress && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {profile.walletAddress.slice(0, 6)}...{profile.walletAddress.slice(-4)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyAddress}
                      className="h-6 w-6 p-0"
                    >
                      {copied ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                )}

                {/* Email */}
                {profile.showEmail && profile.email && (
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                )}

                {/* Join Date */}
                <p className="text-sm text-muted-foreground">
                  Joined {profile.createdAt.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>

                {/* Social Links */}
                {profile.socialLinks && (
                  <div className="flex items-center gap-3 mt-2">
                    {profile.socialLinks.twitter && (
                      <a
                        href={`https://twitter.com/${profile.socialLinks.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Twitter/X"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                    {profile.socialLinks.discord && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(profile.socialLinks?.discord || '')
                          alert('Discord username copied to clipboard!')
                        }}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title={`Discord: ${profile.socialLinks.discord}`}
                      >
                        <MessageCircle className="h-5 w-5" />
                      </button>
                    )}
                    {profile.socialLinks.website && (
                      <a
                        href={profile.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Website"
                      >
                        <Globe className="h-5 w-5" />
                      </a>
                    )}
                    {profile.socialLinks.instagram && (
                      <a
                        href={`https://instagram.com/${profile.socialLinks.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Instagram"
                      >
                        <Camera className="h-5 w-5" />
                      </a>
                    )}
                    {profile.socialLinks.telegram && (
                      <a
                        href={`https://t.me/${profile.socialLinks.telegram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Telegram"
                      >
                        <MessageCircle className="h-5 w-5" />
                      </a>
                    )}
                    {profile.socialLinks.github && (
                      <a
                        href={`https://github.com/${profile.socialLinks.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="GitHub"
                      >
                        <Github className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {!isOwnProfile && user && (
                  <Button
                    onClick={handleFollowToggle}
                    disabled={loading}
                    variant={isFollowingUser ? "outline" : "default"}
                    className={
                      isFollowingUser
                        ? "bg-transparent"
                        : "bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
                    }
                  >
                    {isFollowingUser ? (
                      <>
                        <UserMinus className="mr-2 h-4 w-4" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Follow
                      </>
                    )}
                  </Button>
                )}

                {isOwnProfile && (
                  <Button variant="outline" onClick={() => setEditModalOpen(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                )}

                <Button variant="outline" onClick={shareProfile}>
                  <Share2 className="h-4 w-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card/90 backdrop-blur-xl border-border/50">
                    <DropdownMenuItem onClick={shareProfile}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Profile
                    </DropdownMenuItem>
                    {profile.walletAddress && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={copyAddress}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Address
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a
                            href={`https://etherscan.io/address/${profile.walletAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View on Etherscan
                          </a>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex flex-col">
                <span className="font-bold text-lg">{profile.followersCount.toLocaleString()}</span>
                <span className="text-muted-foreground">Followers</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg">{profile.followingCount.toLocaleString()}</span>
                <span className="text-muted-foreground">Following</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
    </Card>
  )
}