"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { TransactionButton } from "thirdweb/react"
import { useActiveAccount } from "thirdweb/react"
import { client } from "@/lib/thirdweb"
// import { prepareWrapForRental } from "@/lib/rental" // TODO: Fix this - function doesn't exist
import { Package, Calendar, DollarSign, Zap } from "lucide-react"
import Image from "next/image"
import { NFTWithTraits } from "@/lib/nft-matching"
import { toWei } from "thirdweb"

interface WrapForRentalModalProps {
  isOpen: boolean
  onClose: () => void
  nft: NFTWithTraits
}

export function WrapForRentalModal({ isOpen, onClose, nft }: WrapForRentalModalProps) {
  const account = useActiveAccount()

  const [pricePerDay, setPricePerDay] = useState("")
  const [minDays, setMinDays] = useState("1")
  const [maxDays, setMaxDays] = useState("30")

  const handleWrap = () => {
    if (!pricePerDay || !minDays || !maxDays) {
      alert("Please fill in all fields")
      return
    }

    const minDaysNum = parseInt(minDays)
    const maxDaysNum = parseInt(maxDays)

    if (minDaysNum < 1 || maxDaysNum < minDaysNum || maxDaysNum > 365) {
      alert("Invalid duration. Min must be ≥1, Max must be ≥Min and ≤365")
      return
    }

    return true
  }

  const chain = { id: nft.chainId, name: "ApeChain Curtis" } as any

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-800 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <Package className="h-6 w-6 text-purple-400" />
            Wrap NFT for Rental
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Wrap your NFT into an ERC4907 rental wrapper. Your original NFT will be stored securely in a Token Bound Account.
          </DialogDescription>
        </DialogHeader>

        {/* NFT Preview */}
        <Card className="p-4 bg-gray-800/50 border-gray-700">
          <div className="flex gap-4">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
              {nft.image ? (
                <Image
                  src={nft.image}
                  alt={nft.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  <Package className="h-8 w-8 text-gray-600" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">{nft.name}</h3>
              <p className="text-sm text-gray-400">Token #{nft.tokenId}</p>
              <p className="text-xs text-gray-500 mt-1">{nft.collection}</p>
            </div>
          </div>
        </Card>

        {/* Rental Terms Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="pricePerDay" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Price Per Day (APE)
            </Label>
            <Input
              id="pricePerDay"
              type="number"
              step="0.001"
              min="0"
              placeholder="0.1"
              value={pricePerDay}
              onChange={(e) => setPricePerDay(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Set your daily rental rate in APE tokens
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minDays" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Minimum Days
              </Label>
              <Input
                id="minDays"
                type="number"
                min="1"
                max="365"
                value={minDays}
                onChange={(e) => setMinDays(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white mt-2"
              />
            </div>

            <div>
              <Label htmlFor="maxDays" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Maximum Days
              </Label>
              <Input
                id="maxDays"
                type="number"
                min="1"
                max="365"
                value={maxDays}
                onChange={(e) => setMaxDays(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white mt-2"
              />
            </div>
          </div>
        </div>

        {/* Info Box */}
        <Card className="p-4 bg-blue-500/10 border-blue-500/30">
          <div className="flex gap-3">
            <Zap className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200">
              <p className="font-semibold mb-1">How it works:</p>
              <ul className="space-y-1 text-xs">
                <li>• Your NFT will be transferred to a secure Token Bound Account</li>
                <li>• You'll receive an ERC4907 wrapper NFT representing rental rights</li>
                <li>• Renters pay you directly (minus 2.5% platform fee)</li>
                <li>• You can unwrap anytime when not rented to get your NFT back</li>
                <li>• Renters get temporary usage rights but can't sell or transfer</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-800">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>

          <TransactionButton
            transaction={() => {
              // Verify the active wallet owns this NFT
              if (account && nft.ownerWallet && nft.ownerWallet.toLowerCase() !== account.address.toLowerCase()) {
                const errorMsg = `Cannot wrap NFT: This NFT belongs to ${nft.ownerWallet} but you're connected with ${account.address}. Please switch to the wallet that owns this NFT.`
                console.error("❌", errorMsg)
                throw new Error(errorMsg)
              }

              if (!handleWrap()) {
                throw new Error("Invalid rental terms")
              }

              // TODO: Fix this - prepareWrapForRental doesn't exist
              // Use WrapNFTButton component on profile page instead
              throw new Error("This feature is temporarily disabled. Please use the Wrap NFT button on your profile page.")
            }}
            onTransactionConfirmed={() => {
              onClose()
              alert("NFT wrapped successfully! It's now available for rental.")
            }}
            onError={(error) => {
              console.error("Error wrapping NFT:", error)
              alert("Failed to wrap NFT. Please try again.")
            }}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 neon-glow"
          >
            <Package className="h-4 w-4 mr-2" />
            Wrap for Rental
          </TransactionButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}