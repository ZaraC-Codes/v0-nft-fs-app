"use client"

import { useState, useEffect } from "react"
import { BridgeWidget, TransactionButton, useSwitchActiveWalletChain } from "thirdweb/react"
import { prepareContractCall, getContract } from "thirdweb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { client, apeChainCurtis, APE_TOKEN_ADDRESS } from "@/lib/thirdweb"
import { sepolia } from "thirdweb/chains"
import { ArrowRight, CheckCircle, Info, ExternalLink } from "lucide-react"
import { useActiveAccount } from "thirdweb/react"

interface CrossChainNFTPurchaseProps {
  nftName: string
  nftImage: string
  nftContract: string // Ethereum NFT contract address
  tokenId: bigint
  priceInEth: string // e.g., "0.04"
  seller: string // Seller's address
  marketplaceContract?: string // Optional: OpenSea Seaport, Blur, etc.
}

export function CrossChainNFTPurchase({
  nftName,
  nftImage,
  nftContract,
  tokenId,
  priceInEth,
  seller,
  marketplaceContract = "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC" // OpenSea Seaport V1.5
}: CrossChainNFTPurchaseProps) {
  const account = useActiveAccount()
  const switchChain = useSwitchActiveWalletChain()
  const [step, setStep] = useState<"bridge" | "purchase" | "complete">("bridge")
  const [ethReceived, setEthReceived] = useState<string>()
  const [nftTxHash, setNftTxHash] = useState<string>()

  // Calculate APE needed (example: 1 ETH = 2500 APE, +5% buffer for fees)
  const ethToApeRatio = 2500
  const baseApePrice = parseFloat(priceInEth) * ethToApeRatio
  const apePriceWithBuffer = (baseApePrice * 1.05).toFixed(2)

  // Auto-switch to the correct network based on current step
  useEffect(() => {
    if (!account) return

    const autoSwitchNetwork = async () => {
      try {
        if (step === "bridge") {
          // Switch to Curtis testnet for bridging
          await switchChain(apeChainCurtis)
          console.log("✅ Switched to Curtis testnet for bridging")
        } else if (step === "purchase") {
          // Switch to Sepolia for NFT purchase
          await switchChain(sepolia)
          console.log("✅ Switched to Sepolia testnet for NFT purchase")
        }
      } catch (error) {
        console.log("ℹ️ Network switch cancelled or failed:", error)
        // User cancelled or switch failed - TransactionButton will handle it
      }
    }

    autoSwitchNetwork()
  }, [step, account, switchChain])

  if (!account) {
    return (
      <Card className="max-w-2xl mx-auto bg-card/50 border-border/50">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Please connect your wallet to purchase this NFT</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto bg-card/50 border-border/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <img src={nftImage} alt={nftName} className="w-16 h-16 rounded-lg object-cover" />
          <div className="flex-1">
            <h3 className="text-xl font-bold">{nftName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">Sepolia Testnet NFT</Badge>
              <Badge className="bg-gradient-to-r from-primary to-secondary text-xs">
                Pay with Curtis APE
              </Badge>
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* What User Gets */}
        <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-blue-400 mb-1">You will receive:</p>
              <p className="text-blue-300">
                <strong>{nftName}</strong> on Sepolia testnet
              </p>
              <p className="text-xs text-blue-300/70 mt-1">
                The NFT will appear in your wallet on Sepolia testnet. You can view it in MetaMask
                by switching to Sepolia network, or on OpenSea testnet.
              </p>
            </div>
          </div>
        </div>

        {/* Price Display */}
        <div className="bg-muted/20 p-4 rounded-lg border border-border/50">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">NFT Price (Sepolia)</span>
              <span className="font-medium">{priceInEth} ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">≈ APE equivalent</span>
              <span>{baseApePrice.toFixed(2)} APE</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">+ Bridge & Swap Fees (~5%)</span>
              <span className="text-yellow-500">+{(baseApePrice * 0.05).toFixed(2)} APE</span>
            </div>
            <div className="border-t border-border/50 pt-2 flex justify-between font-bold">
              <span>Total You Pay</span>
              <Badge className="bg-gradient-to-r from-primary to-secondary">
                {apePriceWithBuffer} APE
              </Badge>
            </div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/50 rounded p-2 mt-3">
            <p className="text-xs text-yellow-400">
              ⚠️ All fees are paid by you. Fortuna Square charges no additional platform fees.
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              step === "bridge" ? "bg-primary text-white neon-glow" : "bg-green-500 text-white"
            }`}>
              {step === "bridge" ? "1" : <CheckCircle className="h-6 w-6" />}
            </div>
            <span className="text-xs text-center max-w-20">Bridge Curtis APE to Sepolia ETH</span>
          </div>
          <div className="flex-1 h-0.5 bg-border mx-2" />
          <div className="flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              step === "purchase" ? "bg-primary text-white neon-glow" :
              step === "complete" ? "bg-green-500 text-white" : "bg-muted"
            }`}>
              {step === "complete" ? <CheckCircle className="h-6 w-6" /> : "2"}
            </div>
            <span className="text-xs text-center max-w-20">Buy NFT on Sepolia</span>
          </div>
          <div className="flex-1 h-0.5 bg-border mx-2" />
          <div className="flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              step === "complete" ? "bg-green-500 text-white" : "bg-muted"
            }`}>
              {step === "complete" ? <CheckCircle className="h-6 w-6" /> : "3"}
            </div>
            <span className="text-xs text-center max-w-20">Receive NFT on Sepolia</span>
          </div>
        </div>

        {/* Step 1: Simple Purchase Interface (What User Sees) */}
        {step === "bridge" && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg mb-2">Purchase NFT</h4>
              <p className="text-sm text-muted-foreground">
                Click the button below to purchase this NFT. We'll handle the cross-chain conversion automatically.
              </p>
            </div>

            {/* What the user sees - Simple purchase button */}
            <div className="bg-gradient-to-br from-card/50 to-card/30 border border-border/50 rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">You Pay</p>
                    <p className="text-2xl font-bold">{apePriceWithBuffer} APE</p>
                    <p className="text-xs text-muted-foreground">on ApeChain Curtis</p>
                  </div>
                  <ArrowRight className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">You Receive</p>
                    <p className="text-2xl font-bold">{nftName}</p>
                    <p className="text-xs text-muted-foreground">on Sepolia Testnet</p>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setEthReceived(priceInEth)
                    setStep("purchase")
                  }}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 neon-glow py-6 text-lg font-bold"
                >
                  Buy NFT for {apePriceWithBuffer} APE
                </Button>
              </div>
            </div>

            {/* What happens behind the scenes */}
            <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-400 mb-2">Behind the scenes:</p>
                  <ol className="text-blue-300 space-y-1 list-decimal list-inside">
                    <li>Your {apePriceWithBuffer} APE is bridged from Curtis to Sepolia</li>
                    <li>APE is automatically swapped for {priceInEth} ETH on Sepolia</li>
                    <li>ETH is used to purchase the NFT from the seller</li>
                    <li>NFT is transferred to your wallet on Sepolia</li>
                  </ol>
                  <p className="text-xs text-blue-300/70 mt-2">
                    All of this happens in one seamless transaction from your perspective!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Processing (What User Sees) */}
        {step === "purchase" && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg mb-2">Processing Your Purchase...</h4>
              <p className="text-sm text-muted-foreground">
                Your cross-chain NFT purchase is being processed. This may take a few moments.
              </p>
            </div>

            {/* What the user sees - Processing animation */}
            <div className="bg-gradient-to-br from-card/50 to-card/30 border border-primary/50 rounded-lg p-8">
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
                <div>
                  <p className="text-lg font-semibold mb-2">Completing your purchase...</p>
                  <p className="text-sm text-muted-foreground">
                    We're handling the cross-chain conversion and NFT transfer
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setNftTxHash("0x1234567890abcdef1234567890abcdef12345678")
                    setStep("complete")
                  }}
                  variant="outline"
                  className="mt-4"
                >
                  Simulate Completion (Demo)
                </Button>
              </div>
            </div>

            {/* What happens behind the scenes */}
            <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-400 mb-2">Behind the scenes:</p>
                  <div className="text-blue-300 space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>✓ Bridge transaction confirmed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>✓ APE swapped for {priceInEth} ETH on Sepolia</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Purchasing NFT from seller...</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-50">
                      <div className="h-4 w-4 rounded-full border-2 border-muted" />
                      <span>Transferring NFT to your wallet</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Success - User Has NFT! */}
        {step === "complete" && (
          <div className="text-center space-y-6 py-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto neon-glow">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>

            <div>
              <h4 className="font-bold text-2xl mb-2">Purchase Complete! 🎉</h4>
              <p className="text-muted-foreground mb-4">
                <strong>{nftName}</strong> is now in your wallet on Sepolia testnet
              </p>
            </div>

            <div className="bg-muted/20 p-4 rounded-lg border border-border/50 max-w-md mx-auto">
              <img src={nftImage} alt={nftName} className="w-32 h-32 rounded-lg mx-auto mb-3 object-cover" />
              <p className="text-sm text-muted-foreground mb-3">View your NFT:</p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <a
                    href={`https://testnets.opensea.io/assets/sepolia/${nftContract}/${tokenId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on OpenSea Testnet
                  </a>
                </Button>
                {nftTxHash && (
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${nftTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Transaction on Sepolia
                    </a>
                  </Button>
                )}
              </div>
            </div>

            <Button
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
              asChild
            >
              <a href="/profile">View My Collection</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}