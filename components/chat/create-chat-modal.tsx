"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BaseModal } from "@/components/shared/BaseModal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Users, Hash, Lock, Search, X, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CreateChatModalProps {
  isOpen: boolean
  onClose: () => void
}

const mockUsers = [
  {
    id: "1",
    username: "NeonArtist",
    displayName: "Neon Artist",
    avatar: "/digital-artist-avatar.png",
    isVerified: true,
  },
  {
    id: "2",
    username: "CyberTrader",
    displayName: "Cyber Trader",
    avatar: "/cyberpunk-avatar-neon.png",
    isVerified: false,
  },
  {
    id: "3",
    username: "DigitalMind",
    displayName: "Digital Mind",
    avatar: "/neon-warrior-avatar.jpg",
    isVerified: true,
  },
]

const mockCollections = [
  {
    id: "1",
    name: "Cyber Samurai Elite",
    image: "/cyberpunk-collection-banner-neon.jpg",
    holders: 1247,
  },
  {
    id: "2",
    name: "Digital Dreams",
    image: "/digital-dreamscape-futuristic.jpg",
    holders: 892,
  },
  {
    id: "3",
    name: "Neon Warriors",
    image: "/neon-warriors-cyberpunk-battle.jpg",
    holders: 2156,
  },
]

export function CreateChatModal({ isOpen, onClose }: CreateChatModalProps) {
  const [chatType, setChatType] = useState<"community" | "private" | "collection">("community")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPrivate: false,
    collection: "",
  })
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [userSearch, setUserSearch] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.displayName.toLowerCase().includes(userSearch.toLowerCase()),
  )

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (chatType === "community" && !formData.name) {
      toast({
        title: "Name required",
        description: "Please enter a name for your community chat",
        variant: "destructive",
      })
      return
    }

    if (chatType === "private" && selectedUsers.length === 0) {
      toast({
        title: "Select users",
        description: "Please select at least one user to chat with",
        variant: "destructive",
      })
      return
    }

    if (chatType === "collection" && !formData.collection) {
      toast({
        title: "Select collection",
        description: "Please select a collection for the chat",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate chat creation
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Chat created!",
        description: `Your ${chatType} chat has been created successfully`,
      })
      onClose()
      // Reset form
      setFormData({
        name: "",
        description: "",
        isPrivate: false,
        collection: "",
      })
      setSelectedUsers([])
      setUserSearch("")
    }, 2000)
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Create New Chat
        </span>
      }
      size="lg"
      scrollable={true}
      footer={
        <div className="flex justify-end space-x-3 w-full">
          <Button type="button" variant="outline" onClick={onClose} className="bg-transparent">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            onClick={handleSubmit}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 neon-glow"
          >
            {isLoading ? "Creating..." : "Create Chat"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
          {/* Chat Type Selection */}
          <div className="space-y-3">
            <Label>Chat Type</Label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant={chatType === "community" ? "default" : "outline"}
                onClick={() => setChatType("community")}
                className={`flex flex-col items-center p-4 h-auto ${
                  chatType === "community"
                    ? "bg-gradient-to-r from-primary to-secondary"
                    : "bg-transparent hover:bg-card/50"
                }`}
              >
                <Users className="h-6 w-6 mb-2" />
                <span className="text-sm">Community</span>
              </Button>
              <Button
                type="button"
                variant={chatType === "private" ? "default" : "outline"}
                onClick={() => setChatType("private")}
                className={`flex flex-col items-center p-4 h-auto ${
                  chatType === "private"
                    ? "bg-gradient-to-r from-primary to-secondary"
                    : "bg-transparent hover:bg-card/50"
                }`}
              >
                <Lock className="h-6 w-6 mb-2" />
                <span className="text-sm">Private</span>
              </Button>
              <Button
                type="button"
                variant={chatType === "collection" ? "default" : "outline"}
                onClick={() => setChatType("collection")}
                className={`flex flex-col items-center p-4 h-auto ${
                  chatType === "collection"
                    ? "bg-gradient-to-r from-primary to-secondary"
                    : "bg-transparent hover:bg-card/50"
                }`}
              >
                <Hash className="h-6 w-6 mb-2" />
                <span className="text-sm">Collection</span>
              </Button>
            </div>
          </div>

          {/* Community Chat Form */}
          {chatType === "community" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Community Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter community name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-card/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your community..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-card/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="private"
                  checked={formData.isPrivate}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPrivate: checked as boolean })}
                />
                <Label htmlFor="private" className="text-sm">
                  Make this community private (invite only)
                </Label>
              </div>
            </>
          )}

          {/* Collection Chat Form */}
          {chatType === "collection" && (
            <div className="space-y-2">
              <Label htmlFor="collection">Select Collection *</Label>
              <Select
                value={formData.collection}
                onValueChange={(value) => setFormData({ ...formData, collection: value })}
              >
                <SelectTrigger className="bg-card/50 border-border/50 focus:border-primary/50">
                  <SelectValue placeholder="Choose a collection" />
                </SelectTrigger>
                <SelectContent>
                  {mockCollections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      <div className="flex items-center space-x-2">
                        <img
                          src={collection.image || "/placeholder.svg"}
                          alt={collection.name}
                          className="w-6 h-6 rounded object-cover"
                        />
                        <span>{collection.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {collection.holders} holders
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only holders of this collection will be able to join the chat
              </p>
            </div>
          )}

          {/* Private Chat - User Selection */}
          {chatType === "private" && (
            <div className="space-y-4">
              <Label>Select Users to Chat With</Label>

              {/* Search Users */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-10 bg-card/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                />
              </div>

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Selected Users ({selectedUsers.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((userId) => {
                      const user = mockUsers.find((u) => u.id === userId)
                      if (!user) return null
                      return (
                        <Badge
                          key={userId}
                          variant="secondary"
                          className="flex items-center space-x-1 pr-1 bg-primary/20 text-primary border-primary/30"
                        >
                          <span>{user.username}</span>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-4 w-4 hover:bg-primary/20"
                            onClick={() => toggleUserSelection(userId)}
                          >
                            <X className="h-2 w-2" />
                          </Button>
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* User List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => toggleUserSelection(user.id)}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUsers.includes(user.id)
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-card/50 border border-transparent"
                    }`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs">
                        {user.displayName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{user.displayName}</p>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                    {selectedUsers.includes(user.id) && (
                      <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <Plus className="h-2 w-2 text-white rotate-45" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
    </BaseModal>
  )
}
