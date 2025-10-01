"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TransactionButton } from "thirdweb/react"
import { client } from "@/lib/thirdweb"
import { prepareUnwrapNFT } from "@/lib/rental"
import { PackageOpen, AlertTriangle, CheckCircle } from "lucide-react"
import Image from "next/image"

interface UnwrapRentalButtonProps {
  wrapperId: string
  wrapperNFT: {
    name: string
    image?: string
    chainId: number
  }
  originalNFT?: {
    name: string
    contractAddress: string
    tokenId: string
  }
  onUnwrapComplete?: () => void
}

export function UnwrapRentalButton({
  wrapperId,
  wrapperNFT,
  originalNFT,
  onUnwrapComplete,
}: UnwrapRentalButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const chain = { id: wrapperNFT.chainId, name: "ApeChain Curtis" } as any

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="outline"
        className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
      >
        <PackageOpen className="h-4 w-4 mr-2" />
        Unwrap NFT
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
              <PackageOpen className="h-6 w-6 text-orange-400" />
              Unwrap Rental NFT
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Retrieve your original NFT from the rental wrapper
            </DialogDescription>
          </DialogHeader>

          {/* NFT Preview */}
          <Card className="p-4 bg-gray-800/50 border-gray-700">
            <div className="flex gap-4">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                {wrapperNFT.image ? (
                  <Image
                    src={wrapperNFT.image}
                    alt={wrapperNFT.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                    <PackageOpen className="h-8 w-8 text-gray-600" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{wrapperNFT.name}</h3>
                <p className="text-sm text-gray-400">Wrapper ID #{wrapperId}</p>
                {originalNFT && (
                  <p className="text-xs text-gray-500 mt-1">
                    Contains: {originalNFT.name} #{originalNFT.tokenId}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* What Happens */}
          <Card className="p-4 bg-green-500/10 border-green-500/30">
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-200">
                <p className="font-semibold mb-1">What happens:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Your original NFT will be returned to your wallet</li>
                  <li>• The wrapper NFT will be burned (destroyed)</li>
                  <li>• You can list your original NFT for sale or rent again</li>
                  <li>• This action is permanent and cannot be undone</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Warning */}
          <Card className="p-4 bg-yellow-500/10 border-yellow-500/30">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-200">
                <p className="font-semibold mb-1">Important:</p>
                <ul className="space-y-1 text-xs">
                  <li>• You can only unwrap if the NFT is not currently rented</li>
                  <li>• All rental history will be lost</li>
                  <li>• To rent again, you'll need to wrap it again</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <Button
              onClick={() => setIsModalOpen(false)}
              variant="outline"
              className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>

            <TransactionButton
              transaction={() => prepareUnwrapNFT(client, chain, wrapperId)}
              onTransactionConfirmed={() => {
                setIsModalOpen(false)
                if (onUnwrapComplete) {
                  onUnwrapComplete()
                }
              }}
              onError={(error) => {
                console.error("Error unwrapping NFT:", error)
                alert("Failed to unwrap NFT. Make sure it's not currently rented.")
              }}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <PackageOpen className="h-4 w-4 mr-2" />
              Unwrap NFT
            </TransactionButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}