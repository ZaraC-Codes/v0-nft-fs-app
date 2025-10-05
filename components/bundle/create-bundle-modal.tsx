"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TransactionButton, useSendTransaction } from "thirdweb/react"
import { useActiveAccount } from "thirdweb/react"
import { apeChain, apeChainCurtis, sepolia, client } from "@/lib/thirdweb"
import { prepareApproveNFTContract, prepareCreateBundle, getUniqueNFTContracts, generateBundleMetadataURI } from "@/lib/bundle"
import { cancelListing } from "@/lib/marketplace"
import { Package, Plus, X, Check, AlertCircle, Image as ImageIcon } from "lucide-react"
import { ChainBadge } from "@/components/ui/chain-badge"
import Image from "next/image"
import { useProfile } from "@/components/profile/profile-provider"
import { NFTWithTraits } from "@/lib/nft-matching"
import { useToast } from "@/components/ui/use-toast"

interface CreateBundleModalProps {
  isOpen: boolean
  onClose: () => void
  userNFTs: NFTWithTraits[]
}

export function CreateBundleModal({ isOpen, onClose, userNFTs }: CreateBundleModalProps) {
  const account = useActiveAccount()
  const { userProfile } = useProfile()
  const { toast } = useToast()
  const { mutateAsync: sendTransaction } = useSendTransaction()
  const [selectedNFTs, setSelectedNFTs] = useState<NFTWithTraits[]>([])
  const [bundleName, setBundleName] = useState("")
  const [bundleDescription, setBundleDescription] = useState("")
  const [step, setStep] = useState<"select" | "customize" | "delist" | "approve" | "create">("select")
  const [approvedContracts, setApprovedContracts] = useState<Set<string>>(new Set())
  const [delistedNFTs, setDelistedNFTs] = useState<Set<string>>(new Set())
  const [isApprovingAll, setIsApprovingAll] = useState(false)
  const [isDelistingAll, setIsDelistingAll] = useState(false)
  const [thumbnailIndices, setThumbnailIndices] = useState<number[]>([0, 1, 2]) // Indices of NFTs to show as thumbnails

  // Check which selected NFTs have active listings
  const listedNFTs = selectedNFTs.filter(nft =>
    nft.listing?.type === "sale" && nft.listing.listingId !== undefined
  )
  const needsDelisting = listedNFTs.length > 0 && listedNFTs.some(nft => {
    const key = `${nft.contractAddress}-${nft.tokenId}`
    return !delistedNFTs.has(key)
  })

  // Get the chain from the first selected NFT (all must be same chain)
  const selectedChain = selectedNFTs.length > 0
    ? (selectedNFTs[0].chainId === apeChain.id
        ? apeChain
        : selectedNFTs[0].chainId === apeChainCurtis.id
          ? apeChainCurtis
          : sepolia)
    : apeChain // Default to mainnet

  const handleToggleNFT = (nft: NFTWithTraits) => {
    setSelectedNFTs(prev => {
      const isSelected = prev.some(
        n => n.contractAddress === nft.contractAddress && n.tokenId === nft.tokenId
      )

      if (isSelected) {
        return prev.filter(
          n => !(n.contractAddress === nft.contractAddress && n.tokenId === nft.tokenId)
        )
      } else {
        // Check if all NFTs are on the same chain
        if (prev.length > 0 && prev[0].chainId !== nft.chainId) {
          alert("All NFTs in a bundle must be on the same blockchain")
          return prev
        }

        // Limit to 50 NFTs per bundle
        if (prev.length >= 50) {
          alert("Maximum 50 NFTs per bundle")
          return prev
        }

        return [...prev, nft]
      }
    })
  }

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedNFTs([])
      setBundleName("")
      setBundleDescription("")
      setStep("select")
      setApprovedContracts(new Set())
      setDelistedNFTs(new Set())
    }
  }, [isOpen])

  const handleProceedToApproval = () => {
    if (selectedNFTs.length === 0) {
      alert("Please select at least 1 NFT")
      return
    }
    if (!bundleName.trim()) {
      alert("Please enter a bundle name")
      return
    }

    // Debug logging
    console.log("🔍 Selected NFTs:", selectedNFTs.length)
    console.log("🔍 Listed NFTs:", listedNFTs.length)
    console.log("🔍 Listed NFTs details:", listedNFTs.map(nft => ({
      name: nft.name,
      hasListing: !!nft.listing,
      listingType: nft.listing?.type,
      listingId: nft.listing?.listingId
    })))
    console.log("🔍 Needs delisting:", needsDelisting)

    // Go to customize step to select cover image and thumbnails
    setStep("customize")
  }

  const handleProceedFromCustomize = () => {
    // After customization, check if delisting is needed
    if (needsDelisting) {
      console.log("✅ Going to delist step")
      setStep("delist")
    } else {
      console.log("⏭️ Skipping delist, going to approve step")
      setStep("approve")
    }
  }

  const handleProceedToCreate = () => {
    setStep("create")
  }

  const handleDelistAll = async () => {
    if (!account) return

    setIsDelistingAll(true)
    console.log("🔄 Starting delist all...")

    try {
      for (const nft of listedNFTs) {
        const key = `${nft.contractAddress}-${nft.tokenId}`
        if (delistedNFTs.has(key)) {
          console.log(`⏭️ Skipping already delisted: ${nft.name}`)
          continue
        }

        if (nft.listing?.listingId === undefined) {
          console.log(`⚠️ No listing ID for: ${nft.name}`)
          continue
        }

        console.log(`📝 Delisting: ${nft.name} (listing ${nft.listing.listingId})`)

        const transaction = cancelListing(nft.listing.listingId)
        await sendTransaction(transaction)

        // Mark as delisted
        setDelistedNFTs(prev => new Set(prev).add(key))
        console.log(`✅ Delisted: ${nft.name}`)
      }

      console.log("✅ All NFTs delisted!")
    } catch (error) {
      console.error("❌ Error during delist all:", error)
      alert("Failed to delist some NFTs. Please try again or delist individually.")
    } finally {
      setIsDelistingAll(false)
    }
  }

  const handleApproveAll = async () => {
    if (!account) return

    setIsApprovingAll(true)
    console.log("🔄 Starting approve all...")

    try {
      for (const contract of uniqueContracts) {
        if (approvedContracts.has(contract)) {
          console.log(`⏭️ Skipping already approved: ${contract}`)
          continue
        }

        console.log(`📝 Approving: ${contract}`)

        const transaction = prepareApproveNFTContract(client, selectedChain, contract)
        await sendTransaction(transaction)

        // Mark as approved
        setApprovedContracts(prev => new Set(prev).add(contract))
        console.log(`✅ Approved: ${contract}`)
      }

      console.log("✅ All contracts approved!")
    } catch (error) {
      console.error("❌ Error during approve all:", error)
      alert("Failed to approve some contracts. Please try again or approve individually.")
    } finally {
      setIsApprovingAll(false)
    }
  }

  const handleCreateBundle = () => {
    if (!selectedNFTs.length || !bundleName.trim()) return

    // Always use FS logo for consistent branding on external platforms
    const bundleImageUrl = "/fs-temp-logo.png"

    // Get selected thumbnails
    const thumbnailData = thumbnailIndices
      .filter(index => index < selectedNFTs.length)
      .map(index => ({
        name: selectedNFTs[index].name,
        image: selectedNFTs[index].image || "/placeholder.svg",
        tokenId: selectedNFTs[index].tokenId
      }))

    // Generate metadata URI with cover image and thumbnails
    const metadataURI = generateBundleMetadataURI(
      bundleName,
      "Fortuna Square Bundle NFTs - ERC6551-powered NFT bundles on ApeChain. Bundle multiple NFTs into a single tradeable NFT, then unwrap anytime to retrieve the original individual assets.",
      bundleImageUrl,
      selectedNFTs.map(nft => ({
        name: nft.name,
        contractAddress: nft.contractAddress,
        tokenId: nft.tokenId,
        image: nft.image
      })),
      thumbnailData
    )

    return {
      nftContracts: selectedNFTs.map(nft => nft.contractAddress),
      tokenIds: selectedNFTs.map(nft => nft.tokenId),
      bundleName,
      bundleTokenURI: metadataURI
    }
  }

  const uniqueContracts = getUniqueNFTContracts(selectedNFTs)

  if (!account) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl bg-black/90 border-cyan-500/50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold neon-text">Connect Wallet</DialogTitle>
            <DialogDescription>
              Please connect your wallet to create bundles.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl bg-black/90 border-cyan-500/50 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold neon-text flex items-center gap-2">
            <Package className="h-6 w-6" />
            Create Bundle
          </DialogTitle>
          <DialogDescription className="text-base">
            {step === "select" && "Select NFTs to bundle together"}
            {step === "customize" && "Choose preview thumbnails"}
            {step === "delist" && "Cancel listings for selected NFTs"}
            {step === "approve" && "Approve NFT contracts for bundling"}
            {step === "create" && "Create your bundle"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto pr-2">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step === "select" ? "text-cyan-400" : "text-gray-500"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step === "select" ? "border-cyan-400 bg-cyan-400/20" : "border-gray-500"
              }`}>
                {step !== "select" ? <Check className="h-4 w-4" /> : "1"}
              </div>
              <span className="text-sm font-medium">Select NFTs</span>
            </div>
            <div className="h-px w-12 bg-gray-700" />
            <div className={`flex items-center gap-2 ${step === "approve" ? "text-cyan-400" : "text-gray-500"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step === "approve" ? "border-cyan-400 bg-cyan-400/20" : "border-gray-500"
              }`}>
                {step === "create" ? <Check className="h-4 w-4" /> : "2"}
              </div>
              <span className="text-sm font-medium">Approve</span>
            </div>
            <div className="h-px w-12 bg-gray-700" />
            <div className={`flex items-center gap-2 ${step === "create" ? "text-cyan-400" : "text-gray-500"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step === "create" ? "border-cyan-400 bg-cyan-400/20" : "border-gray-500"
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Create</span>
            </div>
          </div>

          {/* Step 1: Select NFTs */}
          {step === "select" && (
            <>
              {/* Bundle Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bundleName" className="text-white">
                    Bundle Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="bundleName"
                    placeholder="e.g., My Rare NFT Collection"
                    value={bundleName}
                    onChange={(e) => setBundleName(e.target.value)}
                    className="bg-black/50 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bundleDescription" className="text-white">
                    Description (optional)
                  </Label>
                  <Textarea
                    id="bundleDescription"
                    placeholder="Describe your bundle..."
                    value={bundleDescription}
                    onChange={(e) => setBundleDescription(e.target.value)}
                    className="bg-black/50 border-gray-700 text-white placeholder:text-gray-500 min-h-[80px]"
                  />
                </div>
              </div>

              {/* Selected NFTs Preview */}
              {selectedNFTs.length > 0 && (
                <Card className="glass-card border-cyan-500/50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">Selected NFTs ({selectedNFTs.length}/50)</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedNFTs([])}
                      className="text-gray-400 hover:text-white"
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedNFTs.map((nft) => (
                      <div
                        key={`${nft.contractAddress}-${nft.tokenId}`}
                        className="relative w-20 h-20 rounded-lg overflow-hidden group"
                      >
                        <Image
                          src={nft.image || "/placeholder-nft.png"}
                          alt={nft.name}
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() => handleToggleNFT(nft)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <X className="h-5 w-5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* NFT Selection Grid */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Select NFTs to Bundle
                </h3>
                <ScrollArea className="h-[400px]">
                  <div className="grid grid-cols-4 gap-3">
                    {userNFTs.map((nft) => {
                      const isSelected = selectedNFTs.some(
                        n => n.contractAddress === nft.contractAddress && n.tokenId === nft.tokenId
                      )

                      return (
                        <Card
                          key={`${nft.contractAddress}-${nft.tokenId}`}
                          className={`glass-card cursor-pointer transition-all hover:border-cyan-400/50 ${
                            isSelected
                              ? 'border-cyan-400 ring-2 ring-cyan-400/50'
                              : 'border-gray-700/50'
                          }`}
                          onClick={() => handleToggleNFT(nft)}
                        >
                          <div className="aspect-square relative rounded-lg overflow-hidden">
                            <Image
                              src={nft.image || "/placeholder-nft.png"}
                              alt={nft.name}
                              fill
                              className="object-cover"
                            />
                            {nft.chainId && (
                              <div className="absolute top-1 left-1">
                                <ChainBadge chainId={nft.chainId} size="sm" />
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute top-1 right-1 bg-cyan-500 rounded-full p-1">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <p className="font-medium text-white text-xs truncate">{nft.name}</p>
                            <p className="text-xs text-gray-400 truncate">#{nft.tokenId}</p>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-800">
                <Button
                  onClick={handleProceedToApproval}
                  disabled={selectedNFTs.length === 0 || !bundleName.trim()}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                >
                  Continue to Approval
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-gray-700 hover:bg-gray-800"
                >
                  Cancel
                </Button>
              </div>
            </>
          )}

          {/* Step: Customize Cover & Thumbnails */}
          {step === "customize" && (
            <>
              <div className="space-y-6">
                {/* Thumbnail Selection */}
                <Card className="glass-card border-purple-500/30 p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-400" />
                    Select Preview Thumbnails (up to 3)
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose up to 3 NFTs to show as preview thumbnails on your bundle card
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedNFTs.map((nft, index) => {
                      const isSelected = thumbnailIndices.includes(index)
                      const selectionNumber = isSelected ? thumbnailIndices.indexOf(index) + 1 : null

                      return (
                        <div
                          key={`${nft.contractAddress}-${nft.tokenId}`}
                          onClick={() => {
                            if (isSelected) {
                              // Remove from selection
                              setThumbnailIndices(prev => prev.filter(i => i !== index))
                            } else if (thumbnailIndices.length < 3) {
                              // Add to selection (max 3)
                              setThumbnailIndices(prev => [...prev, index])
                            }
                          }}
                          className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                            isSelected
                              ? "border-purple-400 ring-2 ring-purple-400/50"
                              : "border-gray-700 hover:border-gray-600"
                          } ${thumbnailIndices.length >= 3 && !isSelected ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <div className="aspect-square overflow-hidden rounded-lg">
                            <img
                              src={nft.image || "/placeholder.svg"}
                              alt={nft.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-purple-400 rounded-full w-6 h-6 flex items-center justify-center">
                              <span className="text-xs font-bold text-black">{selectionNumber}</span>
                            </div>
                          )}
                          <div className="p-2">
                            <p className="text-xs font-medium truncate">{nft.name}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleProceedFromCustomize}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                >
                  Continue
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStep("select")}
                  className="border-gray-700 hover:bg-gray-800"
                >
                  Back
                </Button>
              </div>
            </>
          )}

          {/* Step: Delist NFTs (conditional) */}
          {step === "delist" && (
            <>
              <Card className="glass-card border-red-500/30 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-400 mb-1">Delist NFTs First</h3>
                    <p className="text-sm text-gray-400 mb-3">
                      {listedNFTs.length} NFT{listedNFTs.length !== 1 ? 's are' : ' is'} currently listed and must be delisted before bundling.
                    </p>
                    {delistedNFTs.size < listedNFTs.length && (
                      <Button
                        onClick={handleDelistAll}
                        disabled={isDelistingAll}
                        className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-sm"
                      >
                        {isDelistingAll ? "Delisting..." : `Delist All (${listedNFTs.length - delistedNFTs.size} remaining)`}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  {listedNFTs.map((nft) => {
                    const key = `${nft.contractAddress}-${nft.tokenId}`
                    const isDelisted = delistedNFTs.has(key)

                    return (
                      <div key={key} className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                            {nft.image && (
                              <Image
                                src={nft.image}
                                alt={nft.name}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-white">{nft.name}</div>
                            <div className="text-sm text-gray-400">
                              Listed for {nft.listing?.sale?.price} APE
                            </div>
                          </div>
                        </div>
                        {isDelisted ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            Delisted
                          </Badge>
                        ) : (
                          <TransactionButton
                            transaction={() => {
                              if (nft.listing?.listingId === undefined) {
                                throw new Error("No listing ID found")
                              }
                              return cancelListing(nft.listing.listingId)
                            }}
                            onTransactionConfirmed={() => {
                              setDelistedNFTs(prev => new Set(prev).add(key))
                            }}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30"
                          >
                            Delist
                          </TransactionButton>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Card>

              <div className="flex gap-3 pt-4 border-t border-gray-800">
                <Button
                  onClick={() => setStep("approve")}
                  disabled={listedNFTs.some(nft => {
                    const key = `${nft.contractAddress}-${nft.tokenId}`
                    return !delistedNFTs.has(key)
                  })}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50"
                >
                  Continue to Approval
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStep("select")}
                  className="border-gray-700 hover:bg-gray-800"
                >
                  Back
                </Button>
              </div>
            </>
          )}

          {/* Step 2: Approve Contracts */}
          {step === "approve" && (
            <>
              <Card className="glass-card border-yellow-500/30 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-yellow-400 mb-1">Contract Approvals Required</h3>
                    <p className="text-sm text-gray-400 mb-2">
                      Approve {uniqueContracts.length} NFT contract{uniqueContracts.length !== 1 ? 's' : ''} to allow bundling.
                    </p>
                    {approvedContracts.size > 0 && (
                      <p className="text-xs text-green-400 mb-3">
                        {approvedContracts.size} of {uniqueContracts.length} approved
                      </p>
                    )}
                    {approvedContracts.size < uniqueContracts.length && (
                      <Button
                        onClick={handleApproveAll}
                        disabled={isApprovingAll}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-sm"
                      >
                        {isApprovingAll ? "Approving..." : `Approve All (${uniqueContracts.length - approvedContracts.size} remaining)`}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {uniqueContracts.map((contract, index) => {
                    const isApproved = approvedContracts.has(contract)
                    return (
                      <div key={contract} className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/50 border border-gray-700">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 font-mono truncate" title={contract}>{contract}</div>
                        </div>
                        {isApproved ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 flex-shrink-0 text-xs">
                            <Check className="h-3 w-3 mr-1" />
                            Approved
                          </Badge>
                        ) : (
                          <TransactionButton
                            transaction={() => prepareApproveNFTContract(
                              client,
                              selectedChain,
                              contract
                            )}
                            onTransactionConfirmed={() => {
                              setApprovedContracts(prev => new Set(prev).add(contract))
                              console.log(`✅ Approved contract: ${contract}`)
                            }}
                            onError={(error) => {
                              console.error(`❌ Error approving ${contract}:`, error)
                            }}
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-xs px-3 py-1.5 flex-shrink-0 whitespace-nowrap"
                          >
                            Approve
                          </TransactionButton>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Card>

              <div className="flex gap-3 pt-4 border-t border-gray-800">
                <Button
                  onClick={handleProceedToCreate}
                  disabled={approvedContracts.size !== uniqueContracts.length}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50"
                >
                  Continue to Bundle Creation
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStep("select")}
                  className="border-gray-700 hover:bg-gray-800"
                >
                  Back
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Create Bundle */}
          {step === "create" && (
            <>
              <Card className="glass-card border-cyan-500/50 p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{bundleName}</h3>
                    {bundleDescription && (
                      <p className="text-gray-400 text-sm">{bundleDescription}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Total NFTs:</span>
                      <span className="ml-2 text-white font-semibold">{selectedNFTs.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Blockchain:</span>
                      <span className="ml-2 text-white font-semibold">
                        {CHAIN_METADATA[selectedChain.id].name}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-xs text-gray-500 mb-3">Bundle Preview:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedNFTs.slice(0, 6).map((nft) => (
                        <div
                          key={`${nft.contractAddress}-${nft.tokenId}`}
                          className="w-16 h-16 rounded-lg overflow-hidden relative"
                        >
                          <Image
                            src={nft.image || "/placeholder-nft.png"}
                            alt={nft.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                      {selectedNFTs.length > 6 && (
                        <div className="w-16 h-16 rounded-lg bg-gray-800 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">+{selectedNFTs.length - 6}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              <div className="flex gap-3 pt-4 border-t border-gray-800">
                <TransactionButton
                  transaction={() => {
                    console.log("🎯 Create Bundle button clicked!")
                    console.log("  - Selected NFTs:", selectedNFTs.length)
                    console.log("  - Bundle name:", bundleName)
                    console.log("  - Chain:", selectedChain.id)

                    const params = handleCreateBundle()
                    console.log("  - Bundle params:", params)

                    if (!params) {
                      console.error("❌ Invalid bundle parameters")
                      throw new Error("Invalid bundle parameters")
                    }

                    console.log("📝 Preparing createBundle transaction...")
                    const tx = prepareCreateBundle(client, selectedChain, params)
                    console.log("✅ Transaction prepared:", tx)
                    return tx
                  }}
                  onTransactionConfirmed={(receipt) => {
                    console.log("✅ Bundle created successfully!", receipt)

                    // Clear portfolio cache to force immediate refresh
                    if (account) {
                      const { portfolioCache } = require("@/lib/portfolio-cache")
                      const allWallets = userProfile?.wallets?.map(w => w.address) || [account.address]
                      portfolioCache.clearForWallets(allWallets)
                      console.log("🗑️ Cleared portfolio cache after bundle creation")
                    }

                    onClose()
                  }}
                  onError={(error) => {
                    console.error("❌ Bundle creation error:", error)
                    toast({
                      title: "Bundle Creation Failed",
                      description: error.message || "Failed to create bundle. Please check console for details.",
                      variant: "destructive"
                    })
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 neon-glow"
                >
                  Create Bundle
                </TransactionButton>
                <Button
                  variant="outline"
                  onClick={() => setStep("approve")}
                  className="border-gray-700 hover:bg-gray-800"
                >
                  Back
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}