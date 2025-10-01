"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TransactionButton } from "thirdweb/react"
import { useActiveAccount } from "thirdweb/react"
import { client, getChainMetadata } from "@/lib/thirdweb"
import { prepareListForSale } from "@/lib/marketplace"
import { Tag, DollarSign, Info, ShoppingCart } from "lucide-react"
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

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-border/50"
          >
            Cancel
          </Button>

          {account && (
            <TransactionButton
              transaction={() => {
                if (!handleListForSale()) {
                  throw new Error("Invalid listing parameters")
                }
                return prepareListForSale({
                  client,
                  chain: { id: nft.chainId } as any,
                  contractAddress: nft.contractAddress,
                  tokenId: nft.tokenId,
                  price,
                  isBundle: nft.isBundle || false
                })
              }}
              onTransactionConfirmed={() => {
                toast({
                  title: "Listed Successfully!",
                  description: `Your ${nft.isBundle ? "bundle" : "NFT"} is now listed for ${price} APE`,
                })
                onClose()
              }}
              onError={(error) => {
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
