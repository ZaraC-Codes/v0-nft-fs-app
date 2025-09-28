"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Crown, CheckCircle } from "lucide-react"

interface Message {
  id: string
  sender: {
    id: string
    username: string
    avatar: string
    isVerified: boolean
    role?: "owner" | "admin" | "member"
  }
  content: string
  timestamp: string
  type: "text" | "image" | "nft" | "system"
  nft?: {
    id: string
    title: string
    image: string
    price: string
  }
}

const mockMessages: Message[] = [
  {
    id: "1",
    sender: {
      id: "1",
      username: "NeonArtist",
      avatar: "/digital-artist-avatar.png",
      isVerified: true,
      role: "owner",
    },
    content: "Welcome to the Cyber Samurai Elite collection chat! 🎌",
    timestamp: "2025-01-15T10:00:00Z",
    type: "text",
  },
  {
    id: "2",
    sender: {
      id: "2",
      username: "CyberCollector",
      avatar: "/cyberpunk-avatar-neon.png",
      isVerified: true,
      role: "member",
    },
    content: "Amazing collection! Just picked up #001",
    timestamp: "2025-01-15T10:05:00Z",
    type: "text",
  },
  {
    id: "3",
    sender: {
      id: "3",
      username: "DigitalTrader",
      avatar: "/neon-warrior-avatar.jpg",
      isVerified: false,
      role: "member",
    },
    content: "Floor price is looking strong 📈",
    timestamp: "2025-01-15T10:10:00Z",
    type: "text",
  },
  {
    id: "4",
    sender: {
      id: "1",
      username: "NeonArtist",
      avatar: "/digital-artist-avatar.png",
      isVerified: true,
      role: "owner",
    },
    content: "New drop coming soon! Stay tuned for announcements 🔥",
    timestamp: "2025-01-15T10:15:00Z",
    type: "text",
  },
  {
    id: "5",
    sender: {
      id: "4",
      username: "NFTEnthusiast",
      avatar: "/cyberpunk-nft-1.png",
      isVerified: false,
      role: "member",
    },
    content: "Check out this rare piece I just minted!",
    timestamp: "2025-01-15T10:20:00Z",
    type: "nft",
    nft: {
      id: "nft1",
      title: "Cyber Samurai #042",
      image: "/cyberpunk-samurai-neon-digital-art.jpg",
      price: "2.8 ETH",
    },
  },
]

interface ChatMessagesProps {
  chat: {
    id: string
    name: string
    type: "collection" | "private" | "community"
  }
}

export function ChatMessages({ chat }: ChatMessagesProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "owner":
        return "text-yellow-400"
      case "admin":
        return "text-red-400"
      default:
        return "text-muted-foreground"
    }
  }

  const getRoleIcon = (role?: string) => {
    if (role === "owner") {
      return <Crown className="h-3 w-3 text-yellow-400" />
    }
    return null
  }

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {mockMessages.map((message, index) => {
          const isCurrentUser = message.sender.id === "2" // Mock current user
          const showAvatar = index === 0 || mockMessages[index - 1].sender.id !== message.sender.id

          return (
            <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[70%] ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}>
                {/* Avatar */}
                {showAvatar && !isCurrentUser && (
                  <Avatar className="w-8 h-8 mr-3">
                    <AvatarImage src={message.sender.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs">
                      {message.sender.username[0]}
                    </AvatarFallback>
                  </Avatar>
                )}
                {!showAvatar && !isCurrentUser && <div className="w-8 mr-3" />}

                <div className={`space-y-1 ${isCurrentUser ? "items-end" : "items-start"} flex flex-col`}>
                  {/* Sender Info */}
                  {showAvatar && !isCurrentUser && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold">{message.sender.username}</span>
                      {message.sender.isVerified && <CheckCircle className="h-3 w-3 text-primary" />}
                      {getRoleIcon(message.sender.role)}
                      <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
                    </div>
                  )}

                  {/* Message Content */}
                  <div
                    className={`rounded-lg px-3 py-2 ${
                      isCurrentUser
                        ? "bg-gradient-to-r from-primary to-secondary text-white"
                        : "bg-card/50 border border-border/50"
                    }`}
                  >
                    {message.type === "text" && <p className="text-sm">{message.content}</p>}

                    {message.type === "nft" && message.nft && (
                      <div className="space-y-2">
                        <p className="text-sm">{message.content}</p>
                        <div className="bg-background/20 rounded-lg p-3 border border-border/30">
                          <div className="flex items-center space-x-3">
                            <img
                              src={message.nft.image || "/placeholder.svg"}
                              alt={message.nft.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-semibold text-sm">{message.nft.title}</p>
                              <p className="text-xs text-primary font-bold">{message.nft.price}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timestamp for current user */}
                  {isCurrentUser && showAvatar && (
                    <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
