"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Users, Search, Plus, Settings, Hash, Send, Smile, Paperclip, MoreVertical } from "lucide-react"
import { ChatMessages } from "./chat-messages"
import { CreateChatModal } from "./create-chat-modal"

interface Chat {
  id: string
  name: string
  type: "collection" | "private" | "community"
  avatar?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  memberCount?: number
  isOnline?: boolean
  collection?: {
    name: string
    image: string
  }
}

const mockChats: Chat[] = [
  {
    id: "1",
    name: "Cyber Samurai Elite",
    type: "collection",
    avatar: "/cyberpunk-collection-banner-neon.jpg",
    lastMessage: "New drop coming soon! 🔥",
    lastMessageTime: "2m ago",
    unreadCount: 3,
    memberCount: 1247,
    collection: {
      name: "Cyber Samurai Elite",
      image: "/cyberpunk-collection-banner-neon.jpg",
    },
  },
  {
    id: "2",
    name: "NeonArtist",
    type: "private",
    avatar: "/digital-artist-avatar.png",
    lastMessage: "Thanks for the purchase!",
    lastMessageTime: "1h ago",
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: "3",
    name: "Digital Dreams Holders",
    type: "collection",
    avatar: "/digital-dreamscape-futuristic.jpg",
    lastMessage: "Floor price is rising 📈",
    lastMessageTime: "3h ago",
    unreadCount: 12,
    memberCount: 892,
    collection: {
      name: "Digital Dreams",
      image: "/digital-dreamscape-futuristic.jpg",
    },
  },
  {
    id: "4",
    name: "Cyberpunk Collectors",
    type: "community",
    avatar: "/neon-warriors-cyberpunk-battle.jpg",
    lastMessage: "Welcome new members!",
    lastMessageTime: "5h ago",
    unreadCount: 0,
    memberCount: 2156,
  },
  {
    id: "5",
    name: "CyberTrader",
    type: "private",
    avatar: "/cyberpunk-avatar-neon.png",
    lastMessage: "Interested in your NFT",
    lastMessageTime: "1d ago",
    unreadCount: 1,
    isOnline: false,
  },
]

export function ChatInterface() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(mockChats[0])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredChats = mockChats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-80 border-r border-border/50 bg-card/30 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Messages
            </h2>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowCreateModal(true)}
              className="hover:bg-primary/10"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedChat?.id === chat.id ? "bg-primary/10 border border-primary/20" : "hover:bg-card/50"
                }`}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={chat.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                      {chat.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  {chat.type === "private" && (
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                        chat.isOnline ? "bg-green-500" : "bg-gray-500"
                      }`}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1">
                      {chat.type === "collection" && <Hash className="h-3 w-3 text-primary" />}
                      {chat.type === "private" && <MessageCircle className="h-3 w-3 text-secondary" />}
                      {chat.type === "community" && <Users className="h-3 w-3 text-accent" />}
                      <p className="font-semibold text-sm truncate">{chat.name}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{chat.lastMessageTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                    {chat.unreadCount > 0 && (
                      <Badge className="bg-primary text-primary-foreground ml-2 min-w-[20px] h-5 text-xs">
                        {chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                  {chat.memberCount && (
                    <p className="text-xs text-muted-foreground mt-1">{chat.memberCount.toLocaleString()} members</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border/50 bg-card/30 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedChat.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                      {selectedChat.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      {selectedChat.type === "collection" && <Hash className="h-4 w-4 text-primary" />}
                      {selectedChat.type === "private" && <MessageCircle className="h-4 w-4 text-secondary" />}
                      {selectedChat.type === "community" && <Users className="h-4 w-4 text-accent" />}
                      <h3 className="font-semibold">{selectedChat.name}</h3>
                      {selectedChat.type === "collection" && (
                        <Badge className="bg-primary/20 text-primary border-primary/30">Collection Chat</Badge>
                      )}
                      {selectedChat.type === "community" && (
                        <Badge className="bg-accent/20 text-accent border-accent/30">Community</Badge>
                      )}
                    </div>
                    {selectedChat.memberCount && (
                      <p className="text-sm text-muted-foreground">
                        {selectedChat.memberCount.toLocaleString()} members
                      </p>
                    )}
                    {selectedChat.type === "private" && (
                      <p className="text-sm text-muted-foreground">
                        {selectedChat.isOnline ? "Online" : "Last seen recently"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button size="icon" variant="ghost" className="hover:bg-primary/10">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="hover:bg-primary/10">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ChatMessages chat={selectedChat} />

            {/* Message Input */}
            <div className="p-4 border-t border-border/50 bg-card/30 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <Button size="icon" variant="ghost" className="hover:bg-primary/10">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder={`Message ${selectedChat.name}...`}
                    className="pr-20 bg-card/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                    <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-primary/10">
                      <Smile className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 neon-glow">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Chat Modal */}
      <CreateChatModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  )
}
