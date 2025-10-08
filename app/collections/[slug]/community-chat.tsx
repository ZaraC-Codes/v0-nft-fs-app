"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle, Users, Shield } from "lucide-react"
import { useActiveAccount, useSendTransaction } from "thirdweb/react"
import { getContract, prepareContractCall } from "thirdweb"
import { client, apeChain } from "@/lib/thirdweb"
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
  const { mutateAsync: sendTransaction } = useSendTransaction()
  const [messages, setMessages] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [showMembersDrawer, setShowMembersDrawer] = useState(false)
  const [hasNFT, setHasNFT] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [optimisticMessageId, setOptimisticMessageId] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const optimisticMessageIdRef = useRef<string | null>(null)
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
      if (!userProfile) {
        setHasNFT(false)
        return
      }

      try {
        // Get all linked wallet addresses
        const allWallets = ProfileService.getAllWallets(userProfile)

        if (allWallets.length === 0) {
          setHasNFT(false)
          return
        }

        console.log('🔍 Checking NFT ownership across wallets:', allWallets)

        // Client-side check for UX hint only - server verifies on message send
        // For now, assume they have access if they have wallets
        // The server will do the real verification across all wallets
        setHasNFT(true)
      } catch (error) {
        console.error("Error checking ownership:", error)
        setHasNFT(false)
      }
    }

    checkOwnership()
  }, [userProfile, collection.contractAddress])

  // Load messages - use useCallback to prevent infinite loops
  const loadMessages = useCallback(async () => {
    try {
      console.log('📡 Fetching messages from API...')
      const response = await fetch(
        `/api/collections/${collection.contractAddress}/chat/messages`
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

      // Check if we have an optimistic message and if the real message has appeared
      setMessages(prev => {
        const currentOptimisticId = optimisticMessageIdRef.current
        if (currentOptimisticId) {
          const optimisticMsg = prev.find(m => m.id === currentOptimisticId)
          if (optimisticMsg) {
            console.log('🔍 Checking for real message:', {
              optimisticContent: optimisticMsg.content,
              optimisticSender: optimisticMsg.senderAddress,
              apiMessageCount: data.messages?.length,
              lastApiMessage: data.messages?.[data.messages.length - 1]
            })

            // Check if the real message (with matching content and sender) exists
            const realMessageExists = data.messages.some((m: any) => {
              const contentMatch = m.content === optimisticMsg.content
              const senderMatch = m.senderAddress.toLowerCase() === optimisticMsg.senderAddress.toLowerCase()

              if (contentMatch && senderMatch) {
                console.log('✅ Found matching message in API response:', m)
              }

              return contentMatch && senderMatch
            })

            // If real message exists, clear optimistic ID and show only real messages
            if (realMessageExists) {
              console.log('✅ Real message appeared, removing optimistic message')
              setOptimisticMessageId(null)
              return data.messages || []
            }

            // Otherwise keep showing optimistic message
            console.log('⏳ Keeping optimistic message while waiting for blockchain confirmation')
            return [...(data.messages || []), optimisticMsg]
          }
        }
        console.log('📝 Setting messages:', data.messages?.length || 0)
        return data.messages || []
      })
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

  const handleSendMessage = async (content: string) => {
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
    const tempId = `temp-${Date.now()}`
    const optimisticMessage = {
      id: tempId,
      type: 'message',
      content,
      timestamp: new Date().toISOString(),
      senderAddress: profileWallet.address,
      isBot: false,
      pending: true,
    }
    setOptimisticMessageId(tempId)
    setMessages(prev => {
      console.log('📝 Adding optimistic message. Current messages:', prev.length, 'New total:', prev.length + 1)
      return [...prev, optimisticMessage]
    })

    try {
      console.log('🚀 Preparing to send gasless transaction via ThirdWeb AA...')
      console.log('👛 Using Profile Wallet:', profileWallet.address)

      // SECURITY: Verify NFT ownership server-side BEFORE sending transaction
      // Check ownership across ALL linked wallets
      const allWallets = ProfileService.getAllWallets(userProfile)
      console.log('🔐 Verifying NFT ownership across all linked wallets before transaction...')

      const verifyResponse = await fetch(
        `/api/collections/${collection.contractAddress}/chat/verify-access`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallets: allWallets })
        }
      )

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json()
        throw new Error(errorData.message || 'NFT ownership verification failed')
      }

      console.log('✅ NFT ownership verified server-side')

      // Get groupId for this collection
      const groupId = getCollectionChatId(collection.contractAddress)

      // Get chat relay contract
      const contract = getContract({
        client,
        chain: apeChain,
        address: CHAT_RELAY_ADDRESS as `0x${string}`,
      })

      // Prepare the transaction (using profile wallet as sender)
      const transaction = prepareContractCall({
        contract,
        method: "function sendMessage(uint256 groupId, address sender, string memory content, uint8 messageType) external returns (uint256)",
        params: [groupId, profileWallet.address as `0x${string}`, content, 0],
      })

      console.log('📤 Transaction prepared:', {
        contract: CHAT_RELAY_ADDRESS,
        groupId: groupId.toString(),
        sender: profileWallet.address,
        content,
        gasless: true
      })

      // Send transaction with gas sponsorship via ThirdWeb AA
      const result = await sendTransaction(transaction)

      console.log('✅ Transaction sent:', result.transactionHash)
      console.log('🔗 Explorer:', `https://apechain.calderaexplorer.xyz/tx/${result.transactionHash}`)

      toast({
        title: "Message sent!",
        description: "Your message was sent gaslessly via ThirdWeb AA",
      })

      // The 3-second polling will automatically detect when the real message appears
      // and replace the optimistic message
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

  console.log('🎨 Rendering chat. Messages count:', messages.length, 'Loading:', loading, 'OptimisticID:', optimisticMessageId)

  return (
    <div className="flex flex-col h-[calc(100dvh-16rem)] sm:h-[600px]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 lg:gap-6 h-full">

        {/* Chat Section */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col h-full max-h-[600px] min-h-0
                          border-x-0 sm:border-x rounded-none sm:rounded-xl overflow-hidden">

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
            <CardContent className="flex-1 min-h-0 p-0 overflow-hidden">
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
