"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Vault,
  Users,
  MessageCircle,
  Bot,
  Package,
  Send,
  Copy,
  Crown,
  Settings as SettingsIcon,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react"
import { Header } from "@/components/header"
import { useToast } from "@/components/ui/use-toast"
import { NFTDetailsModal } from "@/components/nft/nft-details-modal"
import { ProposalVoteCard } from "@/components/group/proposal-vote-card"
import { useActiveAccount } from "thirdweb/react"
import {
  getGroupMetadata,
  getTokenBoundAccount,
  getGroupMembers,
  getMember,
  getGroupProposals,
  getProposal,
  MessageType,
} from "@/lib/group-treasury"
import { parseMessage, executeBotCommand } from "@/lib/ai-bot-commands"

export default function GroupTreasuryPage() {
  const params = useParams()
  const groupId = params.groupId as string
  const [activeTab, setActiveTab] = useState("chat")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [groupData, setGroupData] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [proposals, setProposals] = useState<any[]>([])
  const [selectedNFT, setSelectedNFT] = useState<any>(null)
  const [isNFTModalOpen, setIsNFTModalOpen] = useState(false)
  const { toast } = useToast()
  const account = useActiveAccount()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load group data
  useEffect(() => {
    async function loadGroupData() {
      if (!groupId) return

      try {
        setLoading(true)

        // Fetch group metadata
        const metadata = await getGroupMetadata(BigInt(groupId))
        const tbaAddress = await getTokenBoundAccount(BigInt(groupId))
        const memberAddresses = await getGroupMembers(BigInt(groupId))

        // Fetch member details
        const memberDetails = await Promise.all(
          memberAddresses.map(async (addr) => {
            const member = await getMember(BigInt(groupId), addr)
            return {
              id: addr,
              username: member.name,
              walletAddress: member.wallet,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${addr}`,
              role: addr.toLowerCase() === metadata.creator.toLowerCase() ? "creator" : "member",
              joinedAt: new Date(Number(member.joinedAt) * 1000),
              isOnline: Math.random() > 0.5,
              verified: true,
              depositAmount: Number(member.depositAmount) / 1e18,
              hasDeposited: member.hasDeposited,
              isActive: member.isActive,
            }
          })
        )

        // Fetch proposals
        const proposalIds = await getGroupProposals(BigInt(groupId))
        const proposalDetails = await Promise.all(
          proposalIds.map(async (id) => await getProposal(id))
        )

        setGroupData({
          id: groupId,
          name: metadata.name,
          description: metadata.description,
          creator: metadata.creator,
          createdAt: new Date(Number(metadata.createdAt) * 1000),
          walletAddress: tbaAddress,
          totalValue: 0, // Calculate from NFTs
          memberCount: Number(metadata.memberCount),
          isPrivate: metadata.isPrivate,
          requiredDeposit: Number(metadata.requiredDeposit) / 1e18,
        })

        setMembers(memberDetails)
        setProposals(proposalDetails)

        // Load messages from API
        loadMessages()
      } catch (error) {
        console.error("Error loading group data:", error)
        toast({
          title: "Error",
          description: "Failed to load group data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadGroupData()
  }, [groupId, toast])

  // Load messages
  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/group/${groupId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error("Error loading messages:", error)
    }
  }

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!groupId) return

    const interval = setInterval(() => {
      loadMessages()
    }, 3000)

    return () => clearInterval(interval)
  }, [groupId])

  // Handle send message
  const handleSendMessage = async () => {
    if (!message.trim() || !account) return

    try {
      // Parse message for bot commands
      const { isCommand, command, cleanMessage } = parseMessage(message)

      // Send message to backend (gasless)
      const response = await fetch(`/api/group/${groupId}/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: account.address,
          content: message,
          messageType: isCommand ? MessageType.COMMAND : MessageType.REGULAR,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      // If it's a bot command, execute it
      if (isCommand && command) {
        const result = await executeBotCommand(command, {
          groupId: BigInt(groupId),
          sender: account.address,
          message: cleanMessage,
          parsedData: {},
        })

        // Send bot response
        await fetch(`/api/group/${groupId}/send-message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: "bot",
            content: result.message,
            messageType: MessageType.BOT_RESPONSE,
          }),
        })

        // If requires vote, create proposal
        if (result.requiresVote && result.data) {
          toast({
            title: "Proposal Created",
            description: "Members will be notified to vote on this proposal.",
          })
        }
      }

      setMessage("")
      loadMessages()
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`
  }

  const getRoleIcon = (role: string) => {
    if (role === "creator") return <Crown className="h-4 w-4 text-yellow-500" />
    return null
  }

  const getRoleBadge = (role: string) => {
    if (role === "creator") {
      return <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs">Creator</Badge>
    }
    return <Badge variant="outline" className="text-xs">Member</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading group...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!groupData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Group Not Found</h1>
              <p className="text-muted-foreground">The group you're looking for doesn't exist.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Group Header */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-xl mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Group Avatar */}
                <div className="relative">
                  <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-xl">
                    <AvatarImage src={`https://api.dicebear.com/7.x/shapes/svg?seed=${groupId}`} alt={groupData.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-2xl md:text-3xl">
                      <Vault className="h-8 w-8 md:h-12 md:w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <Badge className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                    <Vault className="h-3 w-3 mr-1" />
                    Treasury
                  </Badge>
                </div>

                {/* Group Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl md:text-3xl font-bold neon-text">{groupData.name}</h1>
                        {groupData.isPrivate && (
                          <Badge variant="outline" className="text-xs">Private</Badge>
                        )}
                      </div>

                      <p className="text-muted-foreground max-w-2xl">{groupData.description}</p>

                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Treasury Wallet:</span>
                        <Badge variant="outline" className="font-mono text-xs">
                          {formatAddress(groupData.walletAddress)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(groupData.walletAddress)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button variant="outline">
                        <SettingsIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Group Stats */}
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div className="flex flex-col">
                      <span className="font-bold text-lg text-primary">{groupData.totalValue} APE</span>
                      <span className="text-muted-foreground">Total Value</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-lg">{groupData.memberCount}</span>
                      <span className="text-muted-foreground">Members</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-lg">{proposals.length}</span>
                      <span className="text-muted-foreground">Proposals</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-card/50 border border-border/50 mb-6">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>Chat</span>
              </TabsTrigger>
              <TabsTrigger value="proposals" className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Proposals</span>
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>Portfolio</span>
              </TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Chat Section */}
                <div className="lg:col-span-3">
                  <Card className="border-border/50 bg-card/50 backdrop-blur-xl h-[600px] flex flex-col">
                    <CardHeader className="border-b border-border/50">
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Treasury Chat
                        <Badge className="bg-gradient-to-r from-purple-400 to-pink-500 text-white border-0 text-xs">
                          <Bot className="h-3 w-3 mr-1" />
                          AI Enabled
                        </Badge>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 flex flex-col">
                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg) => (
                          <div key={msg.id} className={`flex gap-3 ${msg.type === 'system' ? 'justify-center' : ''}`}>
                            {msg.type !== 'system' && (
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={msg.sender.avatar} alt={msg.sender.username} />
                                <AvatarFallback className="text-xs">
                                  {msg.sender.isBot ? <Bot className="h-4 w-4" /> : msg.sender.username[0]}
                                </AvatarFallback>
                              </Avatar>
                            )}

                            <div className={`flex-1 ${msg.type === 'system' ? 'text-center' : ''}`}>
                              {msg.type === 'system' ? (
                                <div className="text-xs text-muted-foreground bg-muted/20 rounded px-3 py-1 inline-block">
                                  {msg.content}
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">{msg.sender.username}</span>
                                    {msg.sender.isBot && (
                                      <Badge className="bg-gradient-to-r from-purple-400 to-pink-500 text-white border-0 text-xs">
                                        <Bot className="h-3 w-3 mr-1" />
                                        AI Bot
                                      </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(msg.timestamp).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <div className={`text-sm p-3 rounded-lg ${
                                    msg.sender.isBot
                                      ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20'
                                      : 'bg-muted/20'
                                  }`}>
                                    {msg.content}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Message Input */}
                      <div className="border-t border-border/50 p-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Type your message or @bot for commands..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1 bg-background/50 border-border/50"
                          />
                          <Button onClick={handleSendMessage} className="bg-gradient-to-r from-primary to-secondary">
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Use @bot to interact with the AI wallet manager (e.g., "@bot help")
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Members Sidebar */}
                <div className="space-y-6">
                  <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Members ({members.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="space-y-2 p-4 max-h-80 overflow-y-auto">
                        {members.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-2 hover:bg-muted/20 rounded">
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={member.avatar} alt={member.username} />
                                  <AvatarFallback className="text-xs">{member.username[0]}</AvatarFallback>
                                </Avatar>
                                {member.isOnline && (
                                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <span className="text-sm font-medium truncate">{member.username}</span>
                                  {getRoleIcon(member.role)}
                                </div>
                                <div className="flex items-center gap-1">
                                  {getRoleBadge(member.role)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Proposals Tab */}
            <TabsContent value="proposals" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {proposals.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No proposals yet</p>
                    <p className="text-sm text-muted-foreground mt-2">Use the AI bot to create proposals</p>
                  </div>
                ) : (
                  proposals.map((proposal) => (
                    <ProposalVoteCard
                      key={proposal.id.toString()}
                      proposal={proposal}
                      groupId={BigInt(groupId)}
                      members={members}
                      currentUser={account?.address}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            {/* Portfolio Tab */}
            <TabsContent value="portfolio" className="space-y-6">
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No NFTs in treasury yet</p>
                <p className="text-sm text-muted-foreground mt-2">Use the AI bot to purchase NFTs</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* NFT Details Modal */}
      <NFTDetailsModal
        nft={selectedNFT}
        isOpen={isNFTModalOpen}
        onClose={() => setIsNFTModalOpen(false)}
      />
    </div>
  )
}
