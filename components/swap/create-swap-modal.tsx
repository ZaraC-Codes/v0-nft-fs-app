"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TransactionButton } from "thirdweb/react"
import { useActiveAccount } from "thirdweb/react"
import { apeChainCurtis, sepolia, client, CHAIN_METADATA, getChainMetadata } from "@/lib/thirdweb"
import { prepareCreateSwapListing } from "@/lib/swap"
import { NFTWithTraits, validateSwapCriteria } from "@/lib/nft-matching"
import { ArrowLeftRight, Plus, X } from "lucide-react"
import Image from "next/image"
import { useProfile } from "@/components/profile/profile-provider"

interface CreateSwapModalProps {
  isOpen: boolean
  onClose: () => void
  userNFTs: NFTWithTraits[]
}

export function CreateSwapModal({ isOpen, onClose, userNFTs }: CreateSwapModalProps) {
  const account = useActiveAccount()
  const { userProfile } = useProfile()
  const [selectedNFT, setSelectedNFT] = useState<NFTWithTraits | null>(null)

  // Swap criteria state
  const [wantedCollection, setWantedCollection] = useState("")
  const [wantedTokenId, setWantedTokenId] = useState("Any")
  const [wantedTraits, setWantedTraits] = useState<string[]>([])
  const [newTrait, setNewTrait] = useState("")
  const [selectedChain, setSelectedChain] = useState<number>(apeChainCurtis.id)

  const handleAddTrait = () => {
    if (newTrait.trim() && wantedTraits.length < 3) {
      setWantedTraits([...wantedTraits, newTrait.trim()])
      setNewTrait("")
    }
  }

  const handleRemoveTrait = (index: number) => {
    setWantedTraits(wantedTraits.filter((_, i) => i !== index))
  }

  const handleCreateListing = () => {
    if (!selectedNFT) return

    const criteria = {
      wantedCollection,
      wantedTokenId: wantedTokenId === "Any" ? undefined : wantedTokenId,
      wantedTraits: wantedTraits.length > 0 ? wantedTraits : undefined,
      chainId: selectedChain
    }

    const validation = validateSwapCriteria(criteria)
    if (!validation.isValid) {
      alert(`Invalid criteria: ${validation.errors.join(", ")}`)
      return
    }

    return criteria
  }

  const chain = selectedChain === apeChainCurtis.id ? apeChainCurtis : sepolia

  if (!account) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl bg-black/90 border-cyan-500/50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold neon-text">Connect Wallet</DialogTitle>
            <DialogDescription>
              Please connect your wallet to create swap listings.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-black/90 border-cyan-500/50 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold neon-text flex items-center gap-2">
            <Plus className="h-6 w-6" />
            Create Swap Listing
          </DialogTitle>
          <DialogDescription className="text-base">
            Select an NFT to list and specify what you want in exchange
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto pr-2">
          {/* Step 1: Select NFT to List */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              1. Select NFT to List
            </h3>

            {selectedNFT ? (
              <Card className="glass-card border-cyan-500/50 p-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 relative rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={selectedNFT.image || "/placeholder-nft.png"}
                      alt={selectedNFT.name}
                      fill
                      className="object-cover"
                    />
                    {getChainMetadata(selectedNFT.chainId) && (
                      <Badge className={`absolute top-1 left-1 bg-gradient-to-r ${getChainMetadata(selectedNFT.chainId)!.color} text-white border-0 text-xs flex items-center gap-1`}>
                        <img src={getChainMetadata(selectedNFT.chainId)!.icon} alt={getChainMetadata(selectedNFT.chainId)!.name} className="w-3 h-3" />
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{selectedNFT.name}</h4>
                    <p className="text-sm text-gray-400">{selectedNFT.collection}</p>
                    <p className="text-xs text-gray-500">Token #{selectedNFT.tokenId}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedNFT(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    Change
                  </Button>
                </div>
              </Card>
            ) : (
              <ScrollArea className="h-[200px]">
                <div className="grid grid-cols-4 gap-3">
                  {userNFTs.map((nft) => (
                    <Card
                      key={`${nft.contractAddress}-${nft.tokenId}`}
                      className="glass-card cursor-pointer transition-all hover:border-cyan-400/50 border-gray-700/50"
                      onClick={() => setSelectedNFT(nft)}
                    >
                      <div className="aspect-square relative rounded-lg overflow-hidden">
                        <Image
                          src={nft.image || "/placeholder-nft.png"}
                          alt={nft.name}
                          fill
                          className="object-cover"
                        />
                        {getChainMetadata(nft.chainId) && (
                          <Badge className={`absolute top-1 left-1 bg-gradient-to-r ${getChainMetadata(nft.chainId)!.color} text-white border-0 text-xs flex items-center gap-1`}>
                            <img src={getChainMetadata(nft.chainId)!.icon} alt={getChainMetadata(nft.chainId)!.name} className="w-3 h-3" />
                          </Badge>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="font-medium text-white text-xs truncate">{nft.name}</p>
                        <p className="text-xs text-gray-400 truncate">#{nft.tokenId}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Step 2: Specify What You Want */}
          {selectedNFT && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                2. What do you want in exchange?
              </h3>

              {/* Chain Selection */}
              <div className="space-y-2">
                <Label htmlFor="chain" className="text-white">Chain</Label>
                <Select value={selectedChain.toString()} onValueChange={(v) => setSelectedChain(parseInt(v))}>
                  <SelectTrigger id="chain" className="bg-black/50 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-gray-700">
                    <SelectItem value={apeChainCurtis.id.toString()}>
                      <span className="flex items-center gap-2">
                        {CHAIN_METADATA[apeChainCurtis.id].icon} {CHAIN_METADATA[apeChainCurtis.id].name}
                      </span>
                    </SelectItem>
                    <SelectItem value={sepolia.id.toString()}>
                      <span className="flex items-center gap-2">
                        {CHAIN_METADATA[sepolia.id].icon} {CHAIN_METADATA[sepolia.id].name}
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Collection Name */}
              <div className="space-y-2">
                <Label htmlFor="collection" className="text-white">
                  Collection Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="collection"
                  placeholder="e.g., Bored Ape Yacht Club"
                  value={wantedCollection}
                  onChange={(e) => setWantedCollection(e.target.value)}
                  className="bg-black/50 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>

              {/* Token ID */}
              <div className="space-y-2">
                <Label htmlFor="tokenId" className="text-white">
                  Specific Token ID (optional)
                </Label>
                <Input
                  id="tokenId"
                  placeholder="Any"
                  value={wantedTokenId}
                  onChange={(e) => setWantedTokenId(e.target.value)}
                  className="bg-black/50 border-gray-700 text-white placeholder:text-gray-500"
                />
                <p className="text-xs text-gray-500">Leave as "Any" to accept any token from the collection</p>
              </div>

              {/* Traits */}
              <div className="space-y-2">
                <Label className="text-white">
                  Desired Traits (optional, max 3)
                </Label>

                {wantedTraits.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {wantedTraits.map((trait, index) => (
                      <Badge
                        key={index}
                        className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 pr-1"
                      >
                        {trait}
                        <button
                          onClick={() => handleRemoveTrait(index)}
                          className="ml-1 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Laser Eyes"
                    value={newTrait}
                    onChange={(e) => setNewTrait(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddTrait()
                      }
                    }}
                    disabled={wantedTraits.length >= 3}
                    className="bg-black/50 border-gray-700 text-white placeholder:text-gray-500"
                  />
                  <Button
                    onClick={handleAddTrait}
                    disabled={!newTrait.trim() || wantedTraits.length >= 3}
                    variant="outline"
                    className="border-cyan-500/50 hover:bg-cyan-500/20"
                  >
                    Add
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  {wantedTraits.length === 0
                    ? "Add specific traits you want, or leave empty to accept any traits"
                    : `${3 - wantedTraits.length} trait${3 - wantedTraits.length !== 1 ? 's' : ''} remaining`
                  }
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {selectedNFT && (
            <div className="flex gap-3 pt-4 border-t border-gray-800">
              <TransactionButton
                transaction={() => {
                  // Verify the active wallet owns this NFT
                  if (selectedNFT.ownerWallet && selectedNFT.ownerWallet.toLowerCase() !== account.address.toLowerCase()) {
                    const errorMsg = `Cannot create swap: This NFT belongs to ${selectedNFT.ownerWallet} but you're connected with ${account.address}. Please switch to the wallet that owns this NFT.`
                    console.error("❌", errorMsg)
                    throw new Error(errorMsg)
                  }

                  const criteria = handleCreateListing()
                  if (!criteria) {
                    throw new Error("Invalid criteria")
                  }
                  return prepareCreateSwapListing(
                    client,
                    chain,
                    selectedNFT.contractAddress,
                    {
                      tokenId: selectedNFT.tokenId,
                      wantedCollection: criteria.wantedCollection,
                      wantedTokenId: criteria.wantedTokenId || "0",
                      wantedTraits: criteria.wantedTraits || []
                    }
                  )
                }}
                onTransactionConfirmed={() => {
                  onClose()
                  // TODO: Refresh listings
                }}
                disabled={!wantedCollection.trim()}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                Create Swap Listing
              </TransactionButton>

              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-700 hover:bg-gray-800"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}