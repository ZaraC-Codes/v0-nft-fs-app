"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Crown, Shield } from "lucide-react"

interface ChatSidebarProps {
  chat: {
    id: string
    name: string
    type: "collection" | "private" | "community"
    memberCount?: number
  }
}

const mockMembers = [
  {
    id: "1",
    username: "NeonArtist",
    avatar: "/digital-artist-avatar.png",
    role: "owner",
    isOnline: true,
    isVerified: true,
  },
  {
    id: "2",
    username: "CyberCollector",
    avatar: "/cyberpunk-avatar-neon.png",
    role: "admin",
    isOnline: true,
    isVerified: true,
  },
  {
    id: "3",
    username: "DigitalTrader",
    avatar: "/neon-warrior-avatar.jpg",
    role: "member",
    isOnline: false,
    isVerified: false,
  },
  {
    id: "4",
    username: "NFTEnthusiast",
    avatar: "/cyberpunk-nft-1.png",
    role: "member",
    isOnline: true,
    isVerified: false,
  },
]

export function ChatSidebar({ chat }: ChatSidebarProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-3 w-3 text-yellow-400" />
      case "admin":
        return <Shield className="h-3 w-3 text-red-400" />
      default:
        return null
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "text-yellow-400"
      case "admin":
        return "text-red-400"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="w-64 border-l border-border/50 bg-card/30 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <h3 className="font-semibold mb-2">Members</h3>
        {chat.memberCount && (
          <p className="text-sm text-muted-foreground">{chat.memberCount.toLocaleString()} members</p>
        )}
      </div>

      {/* Members List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {mockMembers.map((member) => (
            <div key={member.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-card/50 cursor-pointer">
              <div className="relative">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={member.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs">
                    {member.username[0]}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                    member.isOnline ? "bg-green-500" : "bg-gray-500"
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <p className="text-sm font-medium truncate">{member.username}</p>
                  {member.isVerified && <Badge className="h-3 w-3 p-0 bg-primary" />}
                  {getRoleIcon(member.role)}
                </div>
                <p className={`text-xs ${getRoleColor(member.role)}`}>
                  {member.role === "owner" ? "Owner" : member.role === "admin" ? "Admin" : "Member"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
