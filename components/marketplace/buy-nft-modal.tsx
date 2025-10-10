"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TransactionButton } from "thirdweb/react"
import { useActiveAccount } from "thirdweb/react"
import { client, getChainMetadata } from "@/lib/thirdweb"
import { prepareBuyNFT } from "@/lib/marketplace"
import { ShoppingCart, Info, AlertCircle, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { PortfolioNFT } from "@/types/profile"
import { useToast } from "@/components/ui/use-toast"
import { BaseModal, BaseModalError } from "@/components/shared/BaseModal"

interface BuyNFTModalProps {
  isOpen: boolean
  onClose: () => void
  nft: PortfolioNFT
}

export function BuyNFTModal({ isOpen, onClose, nft }: BuyNFTModalProps) {
  const account = useActiveAccount()
  const { toast } = useToast()
  const [isPurchasing, setIsPurchasing] = useState(false)

  const chainMetadata = getChainMetadata(nft.chainId)
  const salePrice = nft.listing?.sale?.price || "0"
  const platformFee = parseFloat(salePrice) * 0.025
  const sellerReceives = parseFloat(salePrice) * 0.975

  if (!account) {
    return (
      <BaseModalError
        isOpen={isOpen}
        onClose={onClose}
        title="Connect Wallet"
        description="Please connect your wallet to purchase items."
      />
    )
  }

  if (!nft.listing || nft.listing.type !== "sale") {
    return (
      <BaseModalError
        isOpen={isOpen}
        onClose={onClose}
        title="Not For Sale"
        description={`This ${nft.isBundle ? "bundle" : "NFT"} is not currently listed for sale.`}
      />
    )
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
          Complete Purchase
        </span>
      }
      description="Review and confirm your purchase"
      size="lg"
      titleIcon={<ShoppingCart className="h-6 w-6 text-green-400" />}
      footer={
        <div className="flex gap-3 w-full">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPurchasing}
            className="flex-1 border-border/50"
          >
            Cancel
          </Button>

          {account && (
            <TransactionButton
              transaction={() => {
                setIsPurchasing(true)
                return prepareBuyNFT({
                  client,
                  chain: { id: nft.chainId } as any,
                  contractAddress: nft.contractAddress,
                  tokenId: nft.tokenId,
                  price: salePrice,
                  isBundle: nft.isBundle || false
                })
              }}
              onTransactionConfirmed={() => {
                setIsPurchasing(false)
                toast({
                  title: "Purchase Successful!",
                  description: `You now own ${nft.name}`,
                })
                onClose()
              }}
              onError={(error) => {
                setIsPurchasing(false)
                toast({
                  title: "Purchase Failed",
                  description: error.message,
                  variant: "destructive"
                })
              }}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 neon-glow"
            >
              {isPurchasing ? "Processing..." : `Buy for ${salePrice} APE`}
            </TransactionButton>
          )}
        </div>
      }
    >

        {/* NFT Preview */}
        <Card className="p-4 bg-card/50 border-border/50">
          <div className="flex gap-4">
            <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 border-2 border-primary/20">
              {nft.image ? (
                <Image
                  src={nft.image}
                  alt={nft.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-bold text-xl text-foreground">{nft.name}</h3>
                <p className="text-sm text-muted-foreground">{nft.collection}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {chainMetadata && (
                  <Badge className={`bg-gradient-to-r ${chainMetadata.color} text-white border-0 flex items-center gap-1`}>
                    <img src={chainMetadata.icon} alt={chainMetadata.name} className="w-3 h-3" />
                    {chainMetadata.shortName}
                  </Badge>
                )}
                {nft.isBundle && (
                  <Badge className="bg-gradient-to-r from-orange-400 to-red-500 text-white border-0">
                    Bundle ({nft.bundleCount} items)
                  </Badge>
                )}
                {!nft.isBundle && (
                  <Badge variant="outline" className="border-primary/30">
                    Token #{nft.tokenId}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Price Breakdown */}
        <Card className="p-4 bg-card/50 border-border/50 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Info className="h-4 w-4" />
            Price Breakdown
          </div>
          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Item Price</span>
              <span className="font-medium">{salePrice} APE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform Fee (2.5%)</span>
              <span className="font-medium">{platformFee.toFixed(4)} APE</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span>Total Price</span>
              <span className="text-primary neon-text">{salePrice} APE</span>
            </div>
          </div>

          <Card className="p-3 bg-muted/30 border-border/30 mt-2">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                The seller will receive {sellerReceives.toFixed(4)} APE after the 2.5% platform fee is deducted.
              </p>
            </div>
          </Card>
        </Card>

        {/* Warning Notice */}
        <Card className="p-3 bg-yellow-500/10 border-yellow-500/30">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-yellow-600 dark:text-yellow-400">
                Important: Review Before Purchase
              </p>
              <p className="text-muted-foreground text-xs">
                Make sure you have sufficient APE tokens in your wallet. This transaction cannot be reversed once confirmed.
              </p>
            </div>
          </div>
        </Card>
    </BaseModal>
  )
}
