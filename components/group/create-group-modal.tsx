"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BaseModal } from "@/components/shared/BaseModal"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Users, Wallet, Coins } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { CreateGroupParams, GroupMemberInput } from "@/types/group-treasury"
import { createGroup, initializeGroup } from "@/lib/group-treasury"
import { useActiveAccount } from "thirdweb/react"

interface CreateGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (groupId: string) => void
}

export function CreateGroupModal({ isOpen, onClose, onSuccess }: CreateGroupModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const account = useActiveAccount()

  // Step 1: Group details
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")

  // Step 2: Members
  const [members, setMembers] = useState<GroupMemberInput[]>([])
  const [newMemberName, setNewMemberName] = useState("")
  const [newMemberWallet, setNewMemberWallet] = useState("")

  // Step 3: Deposit requirement
  const [requireDeposit, setRequireDeposit] = useState(false)
  const [depositAmount, setDepositAmount] = useState("")

  const handleAddMember = () => {
    if (!newMemberName.trim() || !newMemberWallet.trim()) {
      toast({
        title: "Error",
        description: "Please enter both member name and wallet address",
        variant: "destructive",
      })
      return
    }

    if (!newMemberWallet.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast({
        title: "Error",
        description: "Invalid wallet address",
        variant: "destructive",
      })
      return
    }

    setMembers([...members, {
      name: newMemberName,
      walletAddress: newMemberWallet,
    }])

    setNewMemberName("")
    setNewMemberWallet("")
  }

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index))
  }

  const handleNext = () => {
    if (step === 1) {
      if (!groupName.trim()) {
        toast({
          title: "Error",
          description: "Please enter a group name",
          variant: "destructive",
        })
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (members.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one member",
          variant: "destructive",
        })
        return
      }
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2)
    }
  }

  const handleCreateGroup = async () => {
    if (!account) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Calculate deposit in wei
      const depositInWei = requireDeposit && depositAmount
        ? BigInt(Math.floor(parseFloat(depositAmount) * 1e18))
        : 0n

      // Step 1: Create group NFT
      toast({
        title: "Creating Group...",
        description: "Step 1: Minting group NFT",
      })

      const createTx = await createGroup(
        account,
        groupName,
        groupDescription,
        depositInWei
      )

      toast({
        title: "Creating Group...",
        description: "Step 2: Initializing group with creator",
      })

      // Get the token ID from the transaction (simplified - in production parse event logs)
      const tokenId = 0n // This would come from parsing the transaction receipt

      // Step 2: Initialize group with creator
      await initializeGroup(account, tokenId, "Creator") // Would use actual username

      toast({
        title: "Success!",
        description: "Group created successfully",
      })

      // Reset form
      setGroupName("")
      setGroupDescription("")
      setMembers([])
      setDepositAmount("")
      setRequireDeposit(false)
      setStep(1)

      onSuccess?.(tokenId.toString())
      onClose()
    } catch (error: any) {
      console.error("Error creating group:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create group",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Treasury Group"
      description="Create a private group with shared wallet and AI bot manager"
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            type="button"
            variant="outline"
            onClick={step === 1 ? onClose : handleBack}
            disabled={loading}
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>

          {step < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleCreateGroup}
              disabled={loading}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              {loading ? "Creating..." : "Create Group"}
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-primary bg-primary/20' : 'border-muted'}`}>
                1
              </div>
              <span className="text-sm font-medium">Details</span>
            </div>

            <div className="h-px w-12 bg-border"></div>

            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-primary bg-primary/20' : 'border-muted'}`}>
                2
              </div>
              <span className="text-sm font-medium">Members</span>
            </div>

            <div className="h-px w-12 bg-border"></div>

            <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-primary bg-primary/20' : 'border-muted'}`}>
                3
              </div>
              <span className="text-sm font-medium">Deposit</span>
            </div>
          </div>

          {/* Step 1: Group Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="groupName">Group Name *</Label>
                <Input
                  id="groupName"
                  placeholder="e.g., BAYC Legends"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="bg-background/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="groupDescription">Description</Label>
                <Textarea
                  id="groupDescription"
                  placeholder="Describe your group's purpose and trading strategy..."
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  className="bg-background/50 border-border/50 min-h-[100px]"
                />
              </div>

              <div className="bg-muted/20 border border-border/50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Wallet className="h-5 w-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Shared Treasury Wallet</p>
                    <p className="text-xs text-muted-foreground">
                      Your group will get a Token Bound Account (ERC6551) wallet controlled by AI bot and group voting.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Add Members */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="memberName">Member Name</Label>
                    <Input
                      id="memberName"
                      placeholder="Username"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      className="bg-background/50 border-border/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="memberWallet">Wallet Address</Label>
                    <Input
                      id="memberWallet"
                      placeholder="0x..."
                      value={newMemberWallet}
                      onChange={(e) => setNewMemberWallet(e.target.value)}
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddMember}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>

              {/* Members List */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Members ({members.length})
                </Label>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {members.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-background/50 border border-border/50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          {member.walletAddress}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(index)}
                        className="ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {members.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No members added yet</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-muted/20 border border-border/50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Member Voting</p>
                    <p className="text-xs text-muted-foreground">
                      All transactions require 90% member approval. You can add more members later via AI bot voting.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Deposit Requirement */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-background/50 border border-border/50 rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Require Deposit from Members</p>
                  <p className="text-xs text-muted-foreground">
                    Members must deposit funds before gaining full access
                  </p>
                </div>
                <Button
                  type="button"
                  variant={requireDeposit ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRequireDeposit(!requireDeposit)}
                >
                  {requireDeposit ? "Required" : "Optional"}
                </Button>
              </div>

              {requireDeposit && (
                <div className="space-y-2">
                  <Label htmlFor="depositAmount">Deposit Amount (APE)</Label>
                  <div className="relative">
                    <Input
                      id="depositAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="bg-background/50 border-border/50 pr-16"
                    />
                    <Badge className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary/20">
                      <Coins className="h-3 w-3 mr-1" />
                      APE
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Each member must deposit this amount to participate in voting
                  </p>
                </div>
              )}

              <div className="bg-muted/20 border border-border/50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Coins className="h-5 w-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Initial Funding</p>
                    <p className="text-xs text-muted-foreground">
                      Member deposits will be transferred to the group's treasury wallet for trading and investments.
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="border-t border-border/50 pt-4 space-y-3">
                <h4 className="font-medium text-sm">Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Group Name:</span>
                    <span className="font-medium">{groupName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Members:</span>
                    <span className="font-medium">{members.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deposit Required:</span>
                    <span className="font-medium">
                      {requireDeposit ? `${depositAmount} APE` : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    </BaseModal>
  )
}
