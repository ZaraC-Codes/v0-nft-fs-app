"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TransactionButton } from "thirdweb/react"
import { useActiveAccount } from "thirdweb/react"
import { apeChain, apeChainCurtis, sepolia, client, CHAIN_METADATA } from "@/lib/thirdweb"
import { prepareUnwrapBundle } from "@/lib/bundle"
import { Package, AlertCircle } from "lucide-react"
import Image from "next/image"
import { NFTWithTraits } from "@/lib/nft-matching"

interface UnwrapBundleButtonProps {
  bundleId: string
  bundleName: string
  chainId: number
  bundledNFTs: NFTWithTraits[]
  className?: string
  onUnwrapComplete?: () => void
}

export function UnwrapBundleButton({
  bundleId,
  bundleName,
  chainId,
  bundledNFTs,
  className,
  onUnwrapComplete
}: UnwrapBundleButtonProps) {
  const account = useActiveAccount()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const chain = chainId === apeChain.id ? apeChain : (chainId === apeChainCurtis.id ? apeChainCurtis : sepolia)

  const handleUnwrap = () => {
    return {
      bundleId,
      nftContracts: bundledNFTs.map(nft => nft.contractAddress),
      tokenIds: bundledNFTs.map(nft => nft.tokenId)
    }
  }

  if (!account) {
    return (
      <Button
        variant="outline"
        className={className}
        onClick={() => alert("Please connect your wallet")}
      >
        <Package className="h-4 w-4 mr-2" />
        Unwrap Bundle
      </Button>
    )
  }

  return (
    <>
      <Button
        variant="outline"
        className={className}
        onClick={() => setIsModalOpen(true)}
      >
        <Package className="h-4 w-4 mr-2" />
        Unwrap Bundle
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-black/90 border-cyan-500/50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold neon-text flex items-center gap-2">
              <Package className="h-6 w-6" />
              Unwrap Bundle
            </DialogTitle>
            <DialogDescription>
              This will extract all NFTs from the bundle and return them to your wallet
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Warning Card */}
            <Card className="glass-card border-yellow-500/30 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-400 mb-1">Permanent Action</h3>
                  <p className="text-sm text-gray-400">
                    Unwrapping will permanently burn the bundle NFT and return all {bundledNFTs.length} individual NFTs to your wallet.
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </Card>

            {/* Bundle Info */}
            <Card className="glass-card border-cyan-500/30 p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{bundleName}</h3>
                  <p className="text-sm text-gray-400">Bundle ID: #{bundleId}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Total NFTs:</span>
                    <span className="ml-2 text-white font-semibold">{bundledNFTs.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Blockchain:</span>
                    <span className="ml-2 text-white font-semibold">
                      {CHAIN_METADATA[chainId].name}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-500 mb-3">NFTs you'll receive:</p>
                  <div className="grid grid-cols-6 gap-2">
                    {bundledNFTs.map((nft) => (
                      <div
                        key={`${nft.contractAddress}-${nft.tokenId}`}
                        className="aspect-square rounded-lg overflow-hidden relative group"
                      >
                        <Image
                          src={nft.image || "/placeholder-nft.png"}
                          alt={nft.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-xs text-center px-1">{nft.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-800">
              <TransactionButton
                transaction={() => {
                  const params = handleUnwrap()
                  return prepareUnwrapBundle(client, chain, params)
                }}
                onTransactionConfirmed={() => {
                  setIsModalOpen(false)
                  if (onUnwrapComplete) {
                    onUnwrapComplete()
                  }
                }}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                Unwrap Bundle
              </TransactionButton>

              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="border-gray-700 hover:bg-gray-800"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}