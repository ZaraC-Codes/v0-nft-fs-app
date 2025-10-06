"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { TransactionButton } from "thirdweb/react"
import { useActiveAccount } from "thirdweb/react"
import { apeChainCurtis, sepolia, client, CHAIN_METADATA, getChainMetadata } from "@/lib/thirdweb"
import { prepareApproveNFT, prepareExecuteSwap, isNFTApprovedForSwap } from "@/lib/swap"
import { findMatchingNFTs, getSwapCriteriaDescription, NFTWithTraits, SwapCriteria } from "@/lib/nft-matching"
import { ArrowLeftRight, Check, AlertCircle } from "lucide-react"
import Image from "next/image"
import { useProfile } from "@/components/profile/profile-provider"

interface SwapModalProps {
  isOpen: boolean
  onClose: () => void
  listingId: string
  listedNFT: NFTWithTraits
  swapCriteria: SwapCriteria
}

export function SwapModal({ isOpen, onClose, listingId, listedNFT, swapCriteria }: SwapModalProps) {
  const account = useActiveAccount()
  const { userProfile } = useProfile()
  const [selectedNFT, setSelectedNFT] = useState<NFTWithTraits | null>(null)
  const [matchingNFTs, setMatchingNFTs] = useState<NFTWithTraits[]>([])
  const [isApproved, setIsApproved] = useState(false)
  const [isCheckingApproval, setIsCheckingApproval] = useState(false)

  const chain = swapCriteria.chainId === apeChainCurtis.id ? apeChainCurtis : sepolia

  // Find matching NFTs from user's portfolio
  useEffect(() => {
    if (!userProfile?.portfolio) {
      setMatchingNFTs([])
      return
    }

    // Filter user's NFTs to find matches
    const matches = findMatchingNFTs(userProfile.portfolio as NFTWithTraits[], swapCriteria)
    setMatchingNFTs(matches)
  }, [userProfile, swapCriteria])

  // Check if selected NFT is approved
  useEffect(() => {
    if (!selectedNFT || !account) {
      setIsApproved(false)
      return
    }

    const checkApproval = async () => {
      setIsCheckingApproval(true)
      try {
        const approved = await isNFTApprovedForSwap(
          client,
          chain,
          selectedNFT.contractAddress,
          selectedNFT.tokenId
        )
        setIsApproved(approved)
      } catch (error) {
        console.error("Error checking approval:", error)
        setIsApproved(false)
      } finally {
        setIsCheckingApproval(false)
      }
    }

    checkApproval()
  }, [selectedNFT, account, chain])

  const criteriaDescription = getSwapCriteriaDescription(swapCriteria)

  if (!account) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl bg-black/90 border-cyan-500/50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold neon-text">Connect Wallet</DialogTitle>
            <DialogDescription>
              Please connect your wallet to swap NFTs.
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
            <ArrowLeftRight className="h-6 w-6" />
            Swap NFT
          </DialogTitle>
          <DialogDescription className="text-base">
            Looking for: <span className="text-cyan-400 font-medium">{criteriaDescription}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto pr-2">
          {/* Swap Preview */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
            {/* Listed NFT */}
            <Card className="glass-card border-cyan-500/30 p-4">
              <div className="aspect-square relative rounded-lg overflow-hidden mb-3">
                <Image
                  src={listedNFT.image || "/placeholder-nft.png"}
                  alt={listedNFT.name}
                  fill
                  className="object-cover"
                />
                {getChainMetadata(listedNFT.chainId) && (
                  <Badge className={`absolute top-2 left-2 bg-gradient-to-r ${getChainMetadata(listedNFT.chainId)!.color} text-white border-0 flex items-center gap-1`}>
                    <img src={getChainMetadata(listedNFT.chainId)!.icon} alt={getChainMetadata(listedNFT.chainId)!.name} className="w-3 h-3" />
                    {getChainMetadata(listedNFT.chainId)!.shortName}
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-white truncate">{listedNFT.name}</h3>
              <p className="text-sm text-gray-400 truncate">{listedNFT.collection}</p>
              <p className="text-xs text-gray-500">Token #{listedNFT.tokenId}</p>
            </Card>

            {/* Swap Arrow */}
            <div className="flex items-center justify-center">
              <ArrowLeftRight className="h-8 w-8 text-cyan-400" />
            </div>

            {/* Selected NFT or Placeholder */}
            <Card className={`glass-card p-4 ${selectedNFT ? 'border-green-500/50' : 'border-gray-500/30'}`}>
              {selectedNFT ? (
                <>
                  <div className="aspect-square relative rounded-lg overflow-hidden mb-3">
                    <Image
                      src={selectedNFT.image || "/placeholder-nft.png"}
                      alt={selectedNFT.name}
                      fill
                      className="object-cover"
                    />
                    {getChainMetadata(selectedNFT.chainId) && (
                      <Badge className={`absolute top-2 left-2 bg-gradient-to-r ${getChainMetadata(selectedNFT.chainId)!.color} text-white border-0 flex items-center gap-1`}>
                        <img src={getChainMetadata(selectedNFT.chainId)!.icon} alt={getChainMetadata(selectedNFT.chainId)!.name} className="w-3 h-3" />
                        {getChainMetadata(selectedNFT.chainId)!.shortName}
                      </Badge>
                    )}
                    <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-white truncate">{selectedNFT.name}</h3>
                  <p className="text-sm text-gray-400 truncate">{selectedNFT.collection}</p>
                  <p className="text-xs text-gray-500">Token #{selectedNFT.tokenId}</p>
                </>
              ) : (
                <div className="aspect-square flex items-center justify-center bg-gray-800/50 rounded-lg mb-3">
                  <p className="text-gray-500 text-center text-sm px-4">
                    Select an NFT below
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Matching NFTs */}
          {matchingNFTs.length > 0 ? (
            <>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Your Matching NFTs ({matchingNFTs.length})
                </h3>
                <ScrollArea className="h-[300px]">
                  <div className="grid grid-cols-3 gap-4">
                    {matchingNFTs.map((nft) => (
                      <Card
                        key={`${nft.contractAddress}-${nft.tokenId}`}
                        className={`glass-card cursor-pointer transition-all hover:border-cyan-400/50 ${
                          selectedNFT?.tokenId === nft.tokenId && selectedNFT?.contractAddress === nft.contractAddress
                            ? 'border-cyan-400 ring-2 ring-cyan-400/50'
                            : 'border-gray-700/50'
                        }`}
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
                            <Badge className={`absolute top-2 left-2 bg-gradient-to-r ${getChainMetadata(nft.chainId)!.color} text-white border-0 text-xs flex items-center gap-1`}>
                              <img src={getChainMetadata(nft.chainId)!.icon} alt={getChainMetadata(nft.chainId)!.name} className="w-3 h-3" />
                            </Badge>
                          )}
                          {selectedNFT?.tokenId === nft.tokenId && selectedNFT?.contractAddress === nft.contractAddress && (
                            <div className="absolute top-2 right-2 bg-cyan-500 rounded-full p-1">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="font-medium text-white text-sm truncate">{nft.name}</p>
                          <p className="text-xs text-gray-400 truncate">#{nft.tokenId}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {selectedNFT && !isApproved && (
                  <TransactionButton
                    transaction={() => prepareApproveNFT(
                      client,
                      chain,
                      selectedNFT.contractAddress,
                      selectedNFT.tokenId
                    )}
                    onTransactionConfirmed={() => {
                      setIsApproved(true)
                    }}
                    className="flex-1"
                  >
                    Approve NFT
                  </TransactionButton>
                )}

                <TransactionButton
                  transaction={() => prepareExecuteSwap(
                    client,
                    chain,
                    {
                      listingId,
                      myTokenId: selectedNFT!.tokenId
                    }
                  )}
                  onTransactionConfirmed={() => {
                    onClose()
                    // TODO: Refresh listings and portfolios
                  }}
                  disabled={!selectedNFT || !isApproved}
                  className="flex-1"
                >
                  {isCheckingApproval ? "Checking..." : "Execute Swap"}
                </TransactionButton>

                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-gray-700 hover:bg-gray-800"
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <Card className="glass-card border-yellow-500/30 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-400 mb-1">No Matching NFTs</h3>
                  <p className="text-sm text-gray-400">
                    You don't own any NFTs that match this swap's criteria. The swap requires NFTs from{" "}
                    <span className="text-cyan-400 font-medium">{swapCriteria.wantedCollection}</span>
                    {getChainMetadata(swapCriteria.chainId) && (
                      <> on <span className="text-cyan-400 font-medium">{getChainMetadata(swapCriteria.chainId)!.name}</span></>
                    )}.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}