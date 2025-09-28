"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, UserPlus, UserMinus, CheckCircle } from "lucide-react"

interface FollowModalProps {
  isOpen: boolean
  onClose: () => void
  type: "followers" | "following"
  username: string
}

const mockUsers = [
  {
    id: "1",
    username: "NeonArtist",
    displayName: "Neon Artist",
    avatar: "/digital-artist-avatar.png",
    isVerified: true,
    isFollowing: false,
    bio: "Digital artist creating cyberpunk masterpieces",
  },
  {
    id: "2",
    username: "CyberTrader",
    displayName: "Cyber Trader",
    avatar: "/cyberpunk-avatar-neon.png",
    isVerified: false,
    isFollowing: true,
    bio: "NFT trader and collector",
  },
  {
    id: "3",
    username: "FutureVision",
    displayName: "Future Vision",
    avatar: "/neon-warrior-avatar.jpg",
    isVerified: true,
    isFollowing: false,
    bio: "Exploring the future of digital art",
  },
  {
    id: "4",
    username: "ElectricMind",
    displayName: "Electric Mind",
    avatar: "/digital-artist-avatar.png",
    isVerified: true,
    isFollowing: true,
    bio: "Creating electric dreams in the metaverse",
  },
]

export function FollowModal({ isOpen, onClose, type, username }: FollowModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState(mockUsers)

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const toggleFollow = (userId: string) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user)))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card/90 backdrop-blur-xl border-border/50 max-w-md max-h-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {type === "followers" ? "Followers" : "Following"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
            />
          </div>

          {/* Users List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border/50"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                      {user.displayName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-1">
                      <p className="font-semibold text-sm">{user.displayName}</p>
                      {user.isVerified && <CheckCircle className="h-3 w-3 text-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                    {user.bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{user.bio}</p>}
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => toggleFollow(user.id)}
                  className={
                    user.isFollowing
                      ? "bg-secondary/20 text-secondary border border-secondary/50 hover:bg-secondary/30"
                      : "bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
                  }
                >
                  {user.isFollowing ? (
                    <>
                      <UserMinus className="mr-1 h-3 w-3" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-1 h-3 w-3" />
                      Follow
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No users found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
