"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
import { ProfileService } from "@/lib/profile-service"
import { getCollectionChatId } from "@/lib/collection-chat"
import { useProfile } from "@/components/profile/profile-provider"
import { useGaslessWallet } from "@/hooks/use-gasless-wallet"

interface CommunityChatProps {
  collection: {
    name: string
    contractAddress: string
  }
}

const CHAT_RELAY_ADDRESS = process.env.NEXT_PUBLIC_GROUP_CHAT_RELAY_ADDRESS || "0xC75255aB6eeBb6995718eBa64De276d5B110fb7f"

export function CommunityChat({ collection }: CommunityChatProps) {
  const account = useActiveAccount()
  const { userProfile } = useProfile()
  const { profileWallet, isUsingProfileWallet, ensureProfileWallet, isSwitching } = useGaslessWallet()
  const [messages, setMessages] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [showMembersDrawer, setShowMembersDrawer] = useState(false)
  const [hasNFT, setHasNFT] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [optimisticMessageId, setOptimisticMessageId] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const optimisticMessageIdRef = useRef<string | null>(null)
  const optimisticMessageRef = useRef<any>(null)
  const isMobile = useMediaQuery("(max-width: 1024px)")
  const { toast } = useToast()

  // Keep ref in sync with state
  useEffect(() => {
    optimisticMessageIdRef.current = optimisticMessageId
  }, [optimisticMessageId])

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

  // Extract unique users from messages for autocomplete AND members list
  useEffect(() => {
    const uniqueUsers = new Map()
    messages.forEach(msg => {
      if (!msg.isBot && !uniqueUsers.has(msg.senderAddress)) {
        // Lookup profile
        const profile = ProfileService.getProfileByWallet(msg.senderAddress)

        const userData = {
          id: msg.senderAddress,
          username: profile?.username || `${msg.senderAddress.slice(0, 6)}...${msg.senderAddress.slice(-4)}`,
          avatar: profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderAddress}`,
          address: msg.senderAddress,
          isOnline: false, // Could implement presence detection later
        }

        uniqueUsers.set(msg.senderAddress, userData)
      }
    })

    const usersArray = Array.from(uniqueUsers.values())
    setAutocompleteUsers(usersArray)
    setMembers(usersArray as any) // Also use for members sidebar
  }, [messages])

  // Check if user owns NFT from this collection (checks ALL linked wallets)
  useEffect(() => {
    async function checkOwnership() {
      console.log('🔐 CHECK OWNERSHIP START:', {
        hasUserProfile: !!userProfile,
        userProfile: userProfile ? { username: userProfile.username, walletAddress: userProfile.walletAddress } : null,
        collectionAddress: collection.contractAddress
      })

      if (!userProfile) {
        console.log('❌ NO USER PROFILE - Setting hasNFT=false')
        setHasNFT(false)
        return
      }

      try {
        // Get all linked wallet addresses
        const allWallets = ProfileService.getAllWallets(userProfile)

        console.log('🔍 Checking NFT ownership across wallets:', allWallets)

        if (allWallets.length === 0) {
          console.log('❌ NO WALLETS FOUND - Setting hasNFT=false')
          setHasNFT(false)
          return
        }

        console.log('✅ HAS WALLETS - Setting hasNFT=true (server will verify actual ownership)')

        // Client-side check for UX hint only - server verifies on message send
        // For now, assume they have access if they have wallets
        // The server will do the real verification across all wallets
        setHasNFT(true)
      } catch (error) {
        console.error("❌ Error checking ownership:", error)
        setHasNFT(false)
      }
    }

    checkOwnership()
  }, [userProfile, collection.contractAddress])

  // Load messages - simplified to avoid race conditions
  const loadMessages = useCallback(async () => {
    try {
      console.log('📡 Fetching messages from API...')
      // Add cache-busting timestamp
      const response = await fetch(
        `/api/collections/${collection.contractAddress}/chat/messages?t=${Date.now()}`,
        {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      )

      console.log('📡 API Response:', {
        ok: response.ok,
        status: response.status
      })

      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const data = await response.json()

      console.log('📦 Messages data:', {
        success: data.success,
        count: data.count,
        messagesLength: data.messages?.length
      })

      if (!data.success || !data.messages) {
        console.error('❌ Invalid API response structure:', data)
        return
      }

      // Simplified: Just use the API messages directly, no complex prev logic
      const currentOptimisticId = optimisticMessageIdRef.current

      if (!currentOptimisticId) {
        // No optimistic message, just set the API messages
        console.log('✅ No optimistic message, setting', data.messages.length, 'messages')
        setMessages(data.messages)
        setLoading(false)
        return
      }

      // Get optimistic message from ref (not state to avoid closure issues)
      const currentOptimisticMsg = optimisticMessageRef.current

      if (!currentOptimisticMsg) {
        // Optimistic message already removed, just use API messages
        console.log('✅ Optimistic message not found in ref, setting', data.messages.length, 'messages')
        setMessages(data.messages)
        return
      }

      // Check if optimistic message now exists in real messages
      const realMessageExists = data.messages.some((m: any) =>
        m.content === currentOptimisticMsg.content &&
        m.senderAddress.toLowerCase() === currentOptimisticMsg.senderAddress.toLowerCase()
      )

      if (realMessageExists) {
        console.log('✅ Real message appeared, clearing optimistic state')
        setOptimisticMessageId(null)
        optimisticMessageRef.current = null
        setMessages(data.messages)
      } else {
        console.log('⏳ Optimistic message still pending, appending it')
        setMessages([...data.messages, currentOptimisticMsg])
      }
    } catch (error) {
      console.error("❌ Error loading messages:", error)
    } finally {
      setLoading(false)
    }
  }, [collection.contractAddress])

  // Load messages and set up polling
  useEffect(() => {
    console.log('🔄 Setting up message polling for collection:', collection.contractAddress)
    loadMessages()

    // Poll for new messages every 3 seconds
    const interval = setInterval(() => {
      console.log('🔄 Polling for new messages...')
      loadMessages()
    }, 3000)

    return () => {
      console.log('🛑 Clearing message polling interval')
      clearInterval(interval)
    }
  }, [collection.contractAddress, loadMessages])

  // Sanitization helper matching backend logic
  const sanitizeMessageForDisplay = (input: string): string => {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  const handleSendMessage = async (content: string) => {
    console.log('🔍🔍🔍 SEND MESSAGE CALLED - VERSION 2.0 🔍🔍🔍')
    console.log('🔍 Send message debugging:', {
      hasAccount: !!account,
      accountAddress: account?.address,
      hasProfileWallet: !!profileWallet,
      isUsingProfileWallet,
      hasNFT,
      content,
      collectionAddress: collection.contractAddress
    })

    if (!hasNFT) {
      toast({
        title: "Cannot send message",
        description: "You must own an NFT from this collection to chat",
        variant: "destructive",
      })
      return
    }

    if (!profileWallet) {
      toast({
        title: "Cannot send message",
        description: "Please create a Profile Wallet for gasless messaging",
        variant: "destructive",
      })
      return
    }

    setSending(true)

    try {
      // Ensure we're using the profile wallet for gasless transaction
      if (!isUsingProfileWallet) {
        console.log('🔄 Switching to Profile Wallet for gasless transaction...')
        toast({
          title: "Switching wallet",
          description: "Switching to Profile Wallet for gasless messaging...",
        })
        await ensureProfileWallet()
      }
    } catch (error: any) {
      console.error("❌ Failed to switch to profile wallet:", error)
      toast({
        title: "Wallet switch failed",
        description: "Could not switch to Profile Wallet. Please try again.",
        variant: "destructive",
      })
      setSending(false)
      return
    }

    // Optimistically add message to UI immediately (using profile wallet address)
    // IMPORTANT: Sanitize content to match what blockchain will store
    const tempId = `temp-${Date.now()}`
    const optimisticMessage = {
      id: tempId,
      type: 'message',
      content: sanitizeMessageForDisplay(content),  // Match backend sanitization
      timestamp: new Date().toISOString(),
      senderAddress: profileWallet.address,
      isBot: false,
      pending: true,
    }
    setOptimisticMessageId(tempId)
    optimisticMessageRef.current = optimisticMessage  // Store in ref to avoid closure issues
    setMessages(prev => {
      console.log('📝 Adding optimistic message. Current messages:', prev.length, 'New total:', prev.length + 1)
      return [...prev, optimisticMessage]
    })

    try {
      console.log('🚀 Sending message via backend relayer...')
      console.log('👛 Profile Wallet:', profileWallet.address)

      // Send message via backend relayer API
      // Backend handles: gas sponsorship and transaction signing
      // NFT ownership was already verified when user accessed this chat
      const response = await fetch(
        `/api/collections/${collection.contractAddress}/chat/send-message`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: profileWallet.address,
            content,
            messageType: 0,
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        // Handle specific error codes
        if (response.status === 403) {
          throw new Error("You must own an NFT from this collection to chat")
        }
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please wait before sending more messages.")
        }

        throw new Error(errorData.message || 'Failed to send message')
      }

      const result = await response.json()
      console.log('✅ Message sent via backend relayer:', result.transactionHash)
      console.log('🔗 Explorer:', `https://apechain.calderaexplorer.xyz/tx/${result.transactionHash}`)

      // Mark optimistic message as confirmed (remove pending indicator)
      // Keep the message visible until polling fetches the real blockchain message
      console.log('✅ Transaction confirmed, marking optimistic message as confirmed')
      setMessages(prev => prev.map(m =>
        m.id === tempId
          ? { ...m, pending: false }  // Remove "Sending..." but keep message visible
          : m
      ))

      // Polling will detect the real message and replace the optimistic one
      // This ensures the message is ALWAYS visible to the user

      toast({
        title: "Message sent!",
        description: "Your message was sent gaslessly",
      })
    } catch (error: any) {
      console.error("❌ Send message error:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      })

      // Set persistent error state
      const errorMsg = error.message || "Failed to send message"
      setSendError(errorMsg)

      // Remove optimistic message on error
      setOptimisticMessageId(null)
      optimisticMessageRef.current = null
      setMessages(prev => prev.filter(m => m.id !== tempId))

      toast({
        title: "Message Send Failed",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  console.log('🎨 RENDER DEBUG:', {
    hasNFT,
    hasUserProfile: !!userProfile,
    profileWallet: profileWallet?.address,
    loading,
    messages: messages.length,
    optimisticId: optimisticMessageId,
    sending
  })
  console.log('🎨 Rendering chat. Messages count:', messages.length, 'Loading:', loading, 'OptimisticID:', optimisticMessageId)

  return (
    <div className="flex flex-col h-[calc(100dvh-16rem)] sm:h-[600px]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 lg:gap-6 h-full">

        {/* Chat Section */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col h-full max-h-[600px] min-h-0
                          border-x-0 sm:border-x rounded-none sm:rounded-xl overflow-hidden
                          gap-0 p-0">

            {/* Header */}
            <CardHeader className="bg-card/95 backdrop-blur-md
                                  border-b py-3 sm:py-4 flex-shrink-0">
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
            <CardContent className="flex-1 min-h-0 p-0">
              {loading ? (
                <div className="flex h-full items-center justify-center">
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
            </CardContent>

            {/* Input */}
            <div className="border-t bg-card/95 backdrop-blur-md
                            p-3 sm:p-4 safe-bottom flex-shrink-0">
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
