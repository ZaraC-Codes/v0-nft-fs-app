"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  TrendingUp,
  ShoppingCart,
  Calendar,
  ArrowLeftRight,
  UserPlus,
  UserMinus,
  LogOut,
  Send,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { voteOnProposal, executeProposal, hasVoted } from "@/lib/group-treasury"
import { useActiveAccount } from "thirdweb/react"

interface ProposalVoteCardProps {
  proposal: any
  groupId: bigint
  members: any[]
  currentUser?: string
}

export function ProposalVoteCard({ proposal, groupId, members, currentUser }: ProposalVoteCardProps) {
  const [voting, setVoting] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [userVoted, setUserVoted] = useState(false)
  const { toast } = useToast()
  const account = useActiveAccount()

  // Check if user has voted
  useState(() => {
    if (currentUser && proposal.id) {
      hasVoted(proposal.id, currentUser).then(setUserVoted)
    }
  })

  const totalMembers = members.filter(m => m.isActive).length
  const totalVotes = Number(proposal.votesFor) + Number(proposal.votesAgainst)
  const approvalPercent = totalMembers > 0 ? (Number(proposal.votesFor) * 100) / totalMembers : 0
  const votingComplete = totalVotes === totalMembers || new Date() >= new Date(Number(proposal.deadline) * 1000)
  const canExecute = approvalPercent >= 90 && votingComplete && !proposal.executed && !proposal.cancelled

  const handleVote = async (support: boolean) => {
    if (!account) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        variant: "destructive",
      })
      return
    }

    setVoting(true)
    try {
      await voteOnProposal(account, proposal.id, support)

      toast({
        title: "Vote Submitted",
        description: `You voted ${support ? "YES" : "NO"} on this proposal`,
      })

      setUserVoted(true)
    } catch (error: any) {
      console.error("Error voting:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit vote",
        variant: "destructive",
      })
    } finally {
      setVoting(false)
    }
  }

  const handleExecute = async () => {
    if (!account) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        variant: "destructive",
      })
      return
    }

    setExecuting(true)
    try {
      await executeProposal(account, proposal.id)

      toast({
        title: "Success",
        description: "Proposal executed successfully",
      })
    } catch (error: any) {
      console.error("Error executing:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to execute proposal",
        variant: "destructive",
      })
    } finally {
      setExecuting(false)
    }
  }

  const getProposalIcon = (type: number) => {
    switch (type) {
      case 0: return <ShoppingCart className="h-5 w-5" />
      case 1: return <TrendingUp className="h-5 w-5" />
      case 2: return <Calendar className="h-5 w-5" />
      case 3: return <ArrowLeftRight className="h-5 w-5" />
      case 4: return <Send className="h-5 w-5" />
      case 5: return <UserPlus className="h-5 w-5" />
      case 6: return <UserMinus className="h-5 w-5" />
      case 7: return <LogOut className="h-5 w-5" />
      default: return <CheckCircle2 className="h-5 w-5" />
    }
  }

  const getProposalTypeLabel = (type: number) => {
    const labels = ["Buy NFT", "Sell NFT", "Rent NFT", "Swap NFT", "Transfer Funds", "Add Member", "Remove Member", "Member Exit"]
    return labels[type] || "Unknown"
  }

  const getProposalColor = (type: number) => {
    const colors = [
      "from-green-400 to-green-600",
      "from-blue-400 to-blue-600",
      "from-purple-400 to-purple-600",
      "from-orange-400 to-orange-600",
      "from-yellow-400 to-yellow-600",
      "from-cyan-400 to-cyan-600",
      "from-red-400 to-red-600",
      "from-gray-400 to-gray-600",
    ]
    return colors[type] || "from-primary to-secondary"
  }

  const getStatusBadge = () => {
    if (proposal.executed) {
      return (
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Executed
        </Badge>
      )
    }

    if (proposal.cancelled) {
      return (
        <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white border-0">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>
      )
    }

    if (canExecute) {
      return (
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Ready to Execute
        </Badge>
      )
    }

    if (votingComplete) {
      return (
        <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white border-0">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      )
    }

    return (
      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0">
        <Clock className="h-3 w-3 mr-1" />
        Active
      </Badge>
    )
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-xl hover:border-primary/50 transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-3 rounded-lg bg-gradient-to-r ${getProposalColor(proposal.proposalType)}`}>
              {getProposalIcon(proposal.proposalType)}
            </div>
            <div>
              <CardTitle className="text-lg mb-1">
                {getProposalTypeLabel(proposal.proposalType)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Proposed by {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Voting Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Approval Progress</span>
            <span className={`font-bold ${approvalPercent >= 90 ? 'text-green-500' : 'text-primary'}`}>
              {approvalPercent.toFixed(1)}% / 90%
            </span>
          </div>

          <Progress value={approvalPercent} className="h-3" />

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-green-500">{Number(proposal.votesFor)}</p>
              <p className="text-xs text-muted-foreground">Yes</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-red-500">{Number(proposal.votesAgainst)}</p>
              <p className="text-xs text-muted-foreground">No</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-muted-foreground">{totalMembers - totalVotes}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>

        {/* Deadline */}
        <div className="flex items-center justify-between text-sm bg-muted/20 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Deadline:</span>
          </div>
          <span className="font-medium">
            {new Date(Number(proposal.deadline) * 1000).toLocaleDateString()}
          </span>
        </div>

        {/* Voting Actions */}
        {!proposal.executed && !proposal.cancelled && !votingComplete && !userVoted && (
          <div className="flex gap-3">
            <Button
              onClick={() => handleVote(true)}
              disabled={voting}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Vote Yes
            </Button>
            <Button
              onClick={() => handleVote(false)}
              disabled={voting}
              variant="outline"
              className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Vote No
            </Button>
          </div>
        )}

        {userVoted && !proposal.executed && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
            <p className="text-sm text-blue-400">You've already voted on this proposal</p>
          </div>
        )}

        {/* Execute Button */}
        {canExecute && (
          <Button
            onClick={handleExecute}
            disabled={executing}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {executing ? "Executing..." : "Execute Proposal"}
          </Button>
        )}

        {/* Member Votes */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Member Votes ({totalVotes}/{totalMembers})</span>
          </div>

          <div className="space-y-1 max-h-40 overflow-y-auto">
            {members.filter(m => m.isActive).map((member) => (
              <div key={member.id} className="flex items-center justify-between text-sm p-2 bg-muted/10 rounded">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-xs">{member.username[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{member.username}</span>
                </div>
                {/* Would check actual vote from contract here */}
                <Badge variant="outline" className="text-xs">
                  Pending
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
