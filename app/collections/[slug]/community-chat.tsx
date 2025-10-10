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
  const [sendError, setSendError] = useState<string | null>(null)

  // 🔧 FIX: Support multiple pending messages instead of single optimistic message
  const [optimisticMessages, setOptimisticMessages] = useState<Map<string, any>>(new Map())
  const optimisticMessagesRef = useRef<Map<string, any>>(new Map())
  const isMobile = useMediaQuery("(max-width: 1024px)")
  const { toast } = useToast()

  // Track component re-renders for debugging
  const renderCount = useRef(0)
  renderCount.current++
  console.log('🚨 COMPONENT RENDER 🚨', {
    renderCount: renderCount.current,
    messagesLength: messages.length,
    loading,
    contractAddress: collection.contractAddress
  })

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

  // ✅ FIX: Extract unique users from messages and load from database
  useEffect(() => {
    async function loadMembersFromDatabase() {
      const uniqueWallets = new Set<string>()
      messages.forEach(msg => {
        if (!msg.isBot) {
          uniqueWallets.add(msg.senderAddress)
        }
      })

      // Load profiles from database for all unique wallets
      const profiles = await Promise.all(
        Array.from(uniqueWallets).map(async (wallet) => {
          // Try database first
          const dbProfile = await ProfileService.getProfileByWalletFromDatabase(wallet)
          if (dbProfile) {
            return {
              id: wallet,
              username: dbProfile.username,
              avatar: dbProfile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${wallet}`,
              address: wallet,
              isOnline: false,
            }
          }

          // Fallback to localStorage
          const cachedProfile = ProfileService.getProfileByWallet(wallet)
          return {
            id: wallet,
            username: cachedProfile?.username || `${wallet.slice(0, 6)}...${wallet.slice(-4)}`,
            avatar: cachedProfile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${wallet}`,
            address: wallet,
            isOnline: false,
          }
        })
      )

      setAutocompleteUsers(profiles)
      setMembers(profiles as any)
    }

    loadMembersFromDatabase()
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
        // SAFETY CHECK: Don't re-append if the optimistic message is already confirmed (pending: false)
        // This prevents the "Sending..." status from reappearing after transaction success
        if (currentOptimisticMsg.pending === false) {
          console.log('⏳ Optimistic message confirmed, waiting for blockchain propagation')
          // Keep current messages array as-is, don't re-append the optimistic message
          // The next poll will pick up the real blockchain message
        } else {
          console.log('⏳ Optimistic message still pending, appending it')
          setMessages([...data.messages, currentOptimisticMsg])
        }
      }
    } catch (error) {
      console.error("❌ Error loading messages:", error)
    } finally {
      setLoading(false)
    }
  }, [collection.contractAddress])

  // Load messages and set up polling
  useEffect(() => {
    // Create loadMessages locally to avoid stale closure
    const loadMessagesLocal = async () => {
      try {
        console.log('🚨 LOAD MESSAGES LOCAL CALLED 🚨', {
          contractAddress: collection.contractAddress,
          timestamp: new Date().toISOString(),
          messagesCurrentLength: messages.length
        })

        console.log('📥 Fetching messages from API...')
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

        // 🔧 FIX: Update messages with support for multiple pending messages
        setMessages(prevMessages => {
          console.log('🚨 SET MESSAGES EXECUTING 🚨', {
            prevLength: prevMessages.length,
            newLength: data.messages.length,
            pendingCount: optimisticMessagesRef.current.size,
            contractAddress: collection.contractAddress,
            timestamp: new Date().toISOString()
          })

          const pendingMap = optimisticMessagesRef.current

          // If no pending messages, just use API messages
          if (pendingMap.size === 0) {
            console.log('✅ No pending messages, returning API messages only')
            return data.messages
          }

          console.log('🔍 CHECKING PENDING MESSAGES:', {
            pendingCount: pendingMap.size,
            pendingIds: Array.from(pendingMap.keys())
          })

          // Check which optimistic messages are now in blockchain
          const stillPending: any[] = []
          for (const [tempId, optimisticMsg] of pendingMap) {
            const existsInBlockchain = data.messages.some((m: any) =>
              m.content === optimisticMsg.content &&
              m.senderAddress.toLowerCase() === optimisticMsg.senderAddress.toLowerCase()
            )

            if (existsInBlockchain) {
              console.log(`✅ Message ${tempId} appeared in blockchain, removing from pending`)
              // Remove from tracking
              setOptimisticMessages(prev => {
                const updated = new Map(prev)
                updated.delete(tempId)
                return updated
              })
              optimisticMessagesRef.current.delete(tempId)
            } else {
              console.log(`⏳ Message ${tempId} still pending (confirmed: ${!optimisticMsg.pending})`)
              stillPending.push(optimisticMsg)
            }
          }

          // Return blockchain messages + all still-pending optimistic messages
          return [...data.messages, ...stillPending]
        })

        setLoading(false)
      } catch (error) {
        console.error("❌ Error loading messages:", error)
        setLoading(false)
      }
    }

    console.log('🔄 Setting up message polling for collection:', collection.contractAddress)

    // Load immediately
    loadMessagesLocal()

    // Poll for new messages every 3 seconds
    const interval = setInterval(() => {
      console.log('🔄 Polling for new messages...')
      loadMessagesLocal() // ← Uses local function, no stale closure
    }, 3000)

    return () => {
      console.log('🛑 Clearing message polling interval')
      clearInterval(interval)
    }
  }, [collection.contractAddress]) // ← Only contract address dependency

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

    // 🔧 FIX: Add to Map instead of overwriting single optimistic message
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const optimisticMessage = {
      id: tempId,
      type: 'message',
      content: sanitizeMessageForDisplay(content),  // Match backend sanitization
      timestamp: new Date().toISOString(),
      senderAddress: profileWallet.address,
      isBot: false,
      pending: true,
    }

    // Add to Map to track multiple pending messages
    setOptimisticMessages(prev => new Map(prev).set(tempId, optimisticMessage))
    optimisticMessagesRef.current.set(tempId, optimisticMessage)

    setMessages(prev => {
      console.log('📝 Adding optimistic message. Current messages:', prev.length, 'Pending:', optimisticMessagesRef.current.size)
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

      // 🔧 FIX: Mark message as confirmed in Map
      console.log('✅ Transaction confirmed, marking optimistic message as confirmed')
      setMessages(prev => {
        const updated = prev.map(m =>
          m.id === tempId
            ? { ...m, pending: false }  // Remove "Sending..." but keep message visible
            : m
        )

        // Update the Map and ref
        const confirmedMsg = updated.find(m => m.id === tempId)
        if (confirmedMsg) {
          setOptimisticMessages(prevMap => {
            const updatedMap = new Map(prevMap)
            updatedMap.set(tempId, confirmedMsg)
            return updatedMap
          })
          optimisticMessagesRef.current.set(tempId, confirmedMsg)
          console.log('✅ Updated optimistic message to pending: false in Map')
        }

        return updated
      })

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

      // 🔧 FIX: Remove message from Map on error
      setOptimisticMessages(prev => {
        const updated = new Map(prev)
        updated.delete(tempId)
        return updated
      })
      optimisticMessagesRef.current.delete(tempId)
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
