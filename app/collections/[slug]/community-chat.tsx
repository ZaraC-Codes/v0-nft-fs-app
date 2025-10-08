"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle, Users, Shield } from "lucide-react"
import { useActiveAccount } from "thirdweb/react"
import { ChatInput } from "@/components/chat/chat-input"
import { MessageBubble } from "@/components/chat/message-bubble"
import { MembersDrawer, MembersSidebar } from "@/components/chat/members"
import { NFTGateMessage } from "@/components/chat/nft-gate-message"
import { ChatContainer } from "@/components/chat/chat-container"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useToast } from "@/components/ui/use-toast"
import { getAllCollections } from "@/lib/collection-service"
import { Collection } from "@/types/collection"

interface CommunityChatProps {
  collection: {
    name: string
    contractAddress: string
  }
}

export function CommunityChat({ collection }: CommunityChatProps) {
  const account = useActiveAccount()
  const [messages, setMessages] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [showMembersDrawer, setShowMembersDrawer] = useState(false)
  const [hasNFT, setHasNFT] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const isMobile = useMediaQuery("(max-width: 1024px)")
  const { toast } = useToast()

  // Autocomplete data
  const [autocompleteUsers, setAutocompleteUsers] = useState<Array<{
    id: string
    username: string
    avatar: string
    address: string
  }>>([])
  const [autocompleteCollections, setAutocompleteCollections] = useState<Array<{
    slug: string
    name: string
    symbol?: string
    contractAddress: string
  }>>([])

  // Load collections for autocomplete
  useEffect(() => {
    async function loadCollections() {
      try {
        const cols = await getAllCollections()
        setAutocompleteCollections(cols.map((c: Collection) => ({
          slug: c.slug,
          name: c.name,
          symbol: c.symbol,
          contractAddress: c.contractAddress
        })))
      } catch (error) {
        console.error("Error loading collections:", error)
      }
    }
    loadCollections()
  }, [])

  // Extract unique users from messages for autocomplete
  useEffect(() => {
    const uniqueUsers = new Map()
    messages.forEach(msg => {
      if (!msg.sender.isBot && !uniqueUsers.has(msg.sender.id)) {
        uniqueUsers.set(msg.sender.id, {
          id: msg.sender.id,
          username: msg.sender.username,
          avatar: msg.sender.avatar,
          address: msg.sender.id
        })
      }
    })
    setAutocompleteUsers(Array.from(uniqueUsers.values()))
  }, [messages])

  // Check if user owns NFT from this collection
  useEffect(() => {
    async function checkOwnership() {
      if (!account) {
        setHasNFT(false)
        return
      }

      try {
        // Client-side check (UX hint only - real verification is server-side)
        // For now, assume they have it if connected
        // TODO: Implement actual ownership check
        setHasNFT(true)
      } catch (error) {
        console.error("Error checking ownership:", error)
        setHasNFT(false)
      }
    }

    checkOwnership()
  }, [account, collection.contractAddress])

  // Load messages
  useEffect(() => {
    loadMessages()

    // Poll for new messages every 3 seconds
    const interval = setInterval(loadMessages, 3000)
    return () => clearInterval(interval)
  }, [collection.contractAddress])

  const loadMessages = async () => {
    try {
      const response = await fetch(
        `/api/collections/${collection.contractAddress}/chat/messages`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error("Error loading messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!account || !hasNFT) {
      toast({
        title: "Cannot send message",
        description: "You must own an NFT from this collection to chat",
        variant: "destructive",
      })
      return
    }

    setSending(true)

    try {
      const response = await fetch(
        `/api/collections/${collection.contractAddress}/chat/send-message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: account.address,
            content,
            messageType: 0,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        if (data.requiresNFT) {
          setHasNFT(false)
          toast({
            title: "Access Denied",
            description: data.message || "You must own an NFT from this collection to chat",
            variant: "destructive",
          })
        } else {
          throw new Error(data.error || 'Failed to send message')
        }
        return
      }

      // Reload messages immediately
      await loadMessages()

      toast({
        title: "Message sent!",
        description: "Your message was sent gaslessly",
      })
    } catch (error: any) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-16rem)] sm:h-[600px]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 lg:gap-6 h-full">

        {/* Chat Section */}
        <div className="lg:col-span-3 flex flex-col h-full">
          <Card className="flex-1 flex flex-col h-full
                          border-x-0 sm:border-x rounded-none sm:rounded-xl
                          overflow-hidden">

            {/* Header */}
            <CardHeader className="sticky top-0 z-10
                                  bg-card/95 backdrop-blur-md
                                  border-b py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="truncate">Community Chat</span>
                  <Badge className="hidden sm:inline-flex text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Token-Gated
                  </Badge>
                </CardTitle>

                {isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMembersDrawer(true)}
                    className="touch-manipulation"
                  >
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-xs">{members.length}</span>
                  </Button>
                )}
              </div>
            </CardHeader>

            {/* Messages */}
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Loading messages...</p>
              </div>
            ) : (
              <ChatContainer messages={messages}>
                <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground text-sm">
                        No messages yet. Be the first to say hello!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isMobile={isMobile}
                        collectionAddress={collection.contractAddress}
                      />
                    ))
                  )}
                </div>
              </ChatContainer>
            )}

            {/* Input */}
            <div className="sticky bottom-0 border-t
                            bg-card/95 backdrop-blur-md
                            p-3 sm:p-4 safe-bottom">
              {hasNFT ? (
                <ChatInput
                  onSend={handleSendMessage}
                  disabled={sending}
                  users={autocompleteUsers}
                  collections={autocompleteCollections}
                />
              ) : (
                <NFTGateMessage collection={collection} />
              )}
            </div>
          </Card>
        </div>

        {/* Members Sidebar (Desktop) */}
        <MembersSidebar
          members={members}
          className="hidden lg:block"
        />

        {/* Mobile Members Drawer */}
        {isMobile && (
          <MembersDrawer
            members={members}
            isOpen={showMembersDrawer}
            onClose={() => setShowMembersDrawer(false)}
          />
        )}
      </div>
    </div>
  )
}
