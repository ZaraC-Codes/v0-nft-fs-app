"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TransactionButton } from "thirdweb/react"
import { useActiveAccount } from "thirdweb/react"
import { client, getChainMetadata, apeChainCurtis } from "@/lib/thirdweb"
import { prepareListForSale, isNFTApproved, prepareApproveNFT } from "@/lib/marketplace"
import { Tag, DollarSign, Info, ShoppingCart, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { PortfolioNFT } from "@/types/profile"
import { useToast } from "@/components/ui/use-toast"

interface ListForSaleModalProps {
  isOpen: boolean
  onClose: () => void
  nft: PortfolioNFT
}

export function ListForSaleModal({ isOpen, onClose, nft }: ListForSaleModalProps) {
  const account = useActiveAccount()
  const { toast } = useToast()

  const [price, setPrice] = useState("")
  const [isApproved, setIsApproved] = useState<boolean | null>(null)
  const [isCheckingApproval, setIsCheckingApproval] = useState(false)

  // Check approval status when modal opens
  useEffect(() => {
    if (isOpen && account) {
      // Verify the active wallet owns this NFT before checking approval
      if (nft.ownerWallet && nft.ownerWallet.toLowerCase() !== account.address.toLowerCase()) {
        console.warn("⚠️ Active wallet doesn't own this NFT")
        setIsApproved(null) // Don't show approval UI if wrong wallet
      } else {
        checkApproval()
      }
    }
  }, [isOpen, account, nft.ownerWallet])

  const checkApproval = async () => {
    if (!account) return

    setIsCheckingApproval(true)
    try {
      console.log("🔍 Checking approval for:")
      console.log("  - Owner (active wallet):", account.address)
      console.log("  - NFT owner (from metadata):", nft.owner)
      console.log("  - Contract:", nft.contractAddress)

      const approved = await isNFTApproved({
        client,
        chain: apeChainCurtis,
        contractAddress: nft.contractAddress,
        ownerAddress: account.address,
        tokenId: nft.tokenId,
        // Let the function auto-detect token type
      })
      console.log("🔍 Approval status:", approved)
      setIsApproved(approved)
    } catch (error) {
      console.error("❌ Error checking approval:", error)
      setIsApproved(false)
    } finally {
      setIsCheckingApproval(false)
    }
  }

  const handleListForSale = () => {
    if (!price || parseFloat(price) <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price greater than 0",
        variant: "destructive"
      })
      return false
    }

    return true
  }

  const chainMetadata = getChainMetadata(nft.chainId)

  if (!account) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-xl border-border/50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold neon-text">Connect Wallet</DialogTitle>
            <DialogDescription>
              Please connect your wallet to list items for sale.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-xl border-border/50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
            <Tag className="h-6 w-6 text-green-400" />
            List {nft.isBundle ? "Bundle" : "NFT"} for Sale
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Set your price and list your {nft.isBundle ? "bundle" : "NFT"} on the marketplace
          </DialogDescription>
        </DialogHeader>

        {/* NFT Preview */}
        <Card className="p-4 bg-card/50 border-border/50">
          <div className="flex gap-4">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-border/30">
              {nft.image ? (
                <Image
                  src={nft.image}
                  alt={nft.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="font-semibold text-foreground">{nft.name}</h3>
                <p className="text-sm text-muted-foreground">{nft.collection}</p>
              </div>
              <div className="flex items-center gap-2">
                {chainMetadata && (
                  <Badge className={`bg-gradient-to-r ${chainMetadata.color} text-white border-0 text-xs`}>
                    {chainMetadata.icon} {chainMetadata.shortName}
                  </Badge>
                )}
                {nft.isBundle && (
                  <Badge className="bg-gradient-to-r from-orange-400 to-red-500 text-white border-0 text-xs">
                    Bundle ({nft.bundleCount})
                  </Badge>
                )}
                {!nft.isBundle && (
                  <p className="text-xs text-muted-foreground">Token #{nft.tokenId}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Pricing Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="price" className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4" />
              Sale Price (APE)
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="10.0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-2 bg-background/50 border-border/50 text-lg"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Set the price buyers will pay to purchase this {nft.isBundle ? "bundle" : "NFT"}
            </p>
          </div>

          {/* Price Info */}
          {nft.lastSalePrice && (
            <Card className="p-3 bg-muted/30 border-border/30">
              <div className="flex items-center gap-2 text-sm">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last Sale Price:</span>
                <span className="font-semibold text-primary">{nft.lastSalePrice} APE</span>
              </div>
            </Card>
          )}

          {/* Platform Fee Notice */}
          <Card className="p-3 bg-primary/5 border-primary/20">
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 font-medium text-primary">
                <Info className="h-4 w-4" />
                <span>Platform Fee: 2.5%</span>
              </div>
              {price && parseFloat(price) > 0 && (
                <div className="text-xs text-muted-foreground space-y-0.5 ml-6">
                  <div className="flex justify-between">
                    <span>Sale Price:</span>
                    <span>{parseFloat(price).toFixed(2)} APE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee (2.5%):</span>
                    <span>{(parseFloat(price) * 0.025).toFixed(2)} APE</span>
                  </div>
                  <div className="flex justify-between font-medium text-foreground pt-1 border-t border-border/20">
                    <span>You'll Receive:</span>
                    <span className="text-primary">{(parseFloat(price) * 0.975).toFixed(2)} APE</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Wrong Wallet Warning */}
        {account && nft.ownerWallet && nft.ownerWallet.toLowerCase() !== account.address.toLowerCase() && (
          <Card className="p-4 bg-destructive/10 border-destructive/30">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-destructive font-medium">
                <Info className="h-5 w-5" />
                <span>Wrong Wallet Connected</span>
              </div>
              <p className="text-sm text-muted-foreground">
                This NFT belongs to <span className="font-mono text-foreground">{nft.ownerWallet.slice(0, 6)}...{nft.ownerWallet.slice(-4)}</span> but you're connected with <span className="font-mono text-foreground">{account.address.slice(0, 6)}...{account.address.slice(-4)}</span>.
              </p>
              <p className="text-sm text-muted-foreground">
                Please switch to the wallet that owns this NFT using the dropdown in the header.
              </p>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-border/50"
          >
            Cancel
          </Button>

          {account && isCheckingApproval && (
            <Button disabled className="flex-1">
              Checking Approval...
            </Button>
          )}

          {account && !isCheckingApproval && isApproved === null && (
            <Button
              onClick={checkApproval}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500"
            >
              Check Approval Status
            </Button>
          )}

          {account && !isCheckingApproval && isApproved === false && (
            <TransactionButton
              transaction={async () => {
                console.log("🔍 Preparing approval transaction for token:", nft.tokenId)
                return await prepareApproveNFT({
                  client,
                  chain: apeChainCurtis,
                  contractAddress: nft.contractAddress,
                  tokenId: nft.tokenId,
                })
              }}
              onTransactionConfirmed={async () => {
                console.log("✅ Approval transaction confirmed!")
                toast({
                  title: "Approval Transaction Confirmed",
                  description: "Verifying approval status...",
                })
                // Wait a moment for blockchain state to update, then re-check
                setTimeout(async () => {
                  await checkApproval()
                  toast({
                    title: "Approval Verified!",
                    description: "You can now list your NFT for sale",
                  })
                }, 2000)
              }}
              onError={(error) => {
                console.error("❌ Approval error:", error)
                toast({
                  title: "Approval Failed",
                  description: error.message,
                  variant: "destructive"
                })
              }}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 neon-glow"
            >
              Approve NFT
            </TransactionButton>
          )}

          {account && !isCheckingApproval && isApproved === true && (
            <>
              <TransactionButton
                transaction={async () => {
                  console.log("🔍 Forcing approval transaction for token:", nft.tokenId)
                  return await prepareApproveNFT({
                    client,
                    chain: apeChainCurtis,
                    contractAddress: nft.contractAddress,
                    tokenId: nft.tokenId,
                  })
                }}
                onTransactionConfirmed={async () => {
                  console.log("✅ Force approval confirmed!")
                  toast({
                    title: "Approved!",
                    description: "NFT approved for marketplace",
                  })
                  setTimeout(async () => {
                    await checkApproval()
                  }, 2000)
                }}
                onError={(error) => {
                  console.error("❌ Force approval error:", error)
                  toast({
                    title: "Approval Failed",
                    description: error.message,
                    variant: "destructive"
                  })
                }}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                Re-approve NFT
              </TransactionButton>

              <TransactionButton
              transaction={() => {
                console.log("🔍 Transaction function called")
                console.log("🔍 Price:", price)
                console.log("🔍 NFT:", nft)
                console.log("🔍 Active account:", account.address)
                console.log("🔍 NFT owner wallet:", nft.ownerWallet)

                // Verify the active wallet owns this NFT
                if (nft.ownerWallet && nft.ownerWallet.toLowerCase() !== account.address.toLowerCase()) {
                  const errorMsg = `Cannot list NFT: This NFT belongs to ${nft.ownerWallet} but you're connected with ${account.address}. Please switch to the wallet that owns this NFT.`
                  console.error("❌", errorMsg)
                  throw new Error(errorMsg)
                }

                if (!handleListForSale()) {
                  console.error("❌ Validation failed")
                  throw new Error("Invalid listing parameters")
                }

                console.log("✅ Validation passed, preparing transaction...")
                const tx = prepareListForSale({
                  client,
                  chain: apeChainCurtis,
                  contractAddress: nft.contractAddress,
                  tokenId: nft.tokenId,
                  price,
                  isBundle: nft.isBundle || false
                })
                console.log("✅ Transaction prepared:", tx)
                return tx
              }}
              onTransactionConfirmed={() => {
                console.log("✅ Transaction confirmed!")
                toast({
                  title: "Listed Successfully!",
                  description: `Your ${nft.isBundle ? "bundle" : "NFT"} is now listed for ${price} APE`,
                })
                onClose()
              }}
              onError={(error) => {
                console.error("❌ Transaction error:", error)
                toast({
                  title: "Listing Failed",
                  description: error.message,
                  variant: "destructive"
                })
              }}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 neon-glow"
            >
              List for Sale
            </TransactionButton>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
