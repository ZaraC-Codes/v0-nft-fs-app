"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CrossChainNFTPurchase } from "@/components/web3/cross-chain-nft-purchase"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"

export default function CrossChainDemoPage() {
  // Example Sepolia testnet NFT listing
  const exampleNFT = {
    name: "Test NFT #123",
    image: "https://picsum.photos/400/400?random=testnft123",
    contract: "0x1234567890123456789012345678901234567890", // Example testnet NFT contract
    tokenId: 123n,
    priceInEth: "0.001", // Testnet ETH
    seller: "0x8888887777666655554444333322221111000000",
  }

  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Cross-Chain NFT Purchase
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Buy Ethereum Sepolia testnet NFTs using APE on ApeChain Curtis testnet. We handle the bridging and swapping - you just receive your NFT!
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Badge className="bg-gradient-to-r from-primary to-secondary">
                Pay with APE (Curtis Testnet)
              </Badge>
              <Badge variant="outline">Receive NFT on Sepolia</Badge>
              <Badge variant="outline">Testnet Demo</Badge>
            </div>
          </div>

          {/* How It Works */}
          <Card className="bg-card/50 border-border/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">How It Works</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                    1
                  </div>
                  <h3 className="font-semibold text-lg">Bridge & Swap</h3>
                  <p className="text-sm text-muted-foreground">
                    Your APE is automatically bridged from Curtis testnet to Sepolia testnet and swapped for testnet ETH using the best available rates.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                    2
                  </div>
                  <h3 className="font-semibold text-lg">Purchase NFT</h3>
                  <p className="text-sm text-muted-foreground">
                    The testnet ETH is used to purchase your desired NFT directly on Sepolia testnet from the seller.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                    3
                  </div>
                  <h3 className="font-semibold text-lg">Receive NFT</h3>
                  <p className="text-sm text-muted-foreground">
                    The NFT is transferred to your wallet on Sepolia testnet. View it in MetaMask or any testnet-compatible wallet!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Example Purchase */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Example: Buy Sepolia NFT with Curtis APE</h2>
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-400">
                ⚠️ <strong>Testnet Demo:</strong> This uses ApeChain Curtis testnet and Ethereum Sepolia testnet.
                You'll need testnet APE and testnet ETH to complete transactions. Get Curtis testnet tokens from the
                <a href="https://curtis.hub.caldera.xyz/" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                  ApeChain Curtis Faucet
                </a> and Sepolia testnet ETH from
                <a href="https://sepoliafaucet.com/" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                  Sepolia Faucet
                </a>.
              </p>
            </div>
            <CrossChainNFTPurchase
              nftName={exampleNFT.name}
              nftImage={exampleNFT.image}
              nftContract={exampleNFT.contract}
              tokenId={exampleNFT.tokenId}
              priceInEth={exampleNFT.priceInEth}
              seller={exampleNFT.seller}
            />
          </div>

          {/* Important Notes */}
          <Card className="bg-card/50 border-border/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Important Notes</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">You pay all fees:</strong> Bridge fees, swap fees, gas fees, and the NFT price are all paid by you. Fortuna Square charges no additional platform fees.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">NFT received on Sepolia:</strong> The NFT will appear in your wallet on Sepolia testnet, not ApeChain Curtis. You can view it in MetaMask by switching to Sepolia network.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Exchange rate buffer:</strong> We add a 5% buffer to the exchange rate to account for price fluctuations during the transaction. Any unused testnet APE is not returned.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Two-step process:</strong> You'll need to approve two transactions: one for the bridge/swap (Curtis → Sepolia), and one for the NFT purchase on Sepolia. Make sure your wallet is connected to the correct network for each step.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Testnet only:</strong> This is a testnet demonstration. Both ApeChain Curtis and Ethereum Sepolia are testnets. In production, you'll work with mainnet tokens and NFTs.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Get testnet tokens:</strong> You need Curtis testnet APE to bridge and Sepolia testnet ETH for gas fees. Use the faucet links above to get free testnet tokens.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* External Resources */}
          <Card className="bg-card/50 border-border/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Learn More</h2>
              <div className="space-y-2">
                <a
                  href="https://portal.thirdweb.com/connect/pay/overview"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  ThirdWeb Cross-Chain Documentation
                </a>
                <a
                  href="https://docs.apechain.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  ApeChain Documentation
                </a>
                <a
                  href="https://testnets.opensea.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  OpenSea Testnet
                </a>
                <a
                  href="https://curtis.hub.caldera.xyz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Curtis Testnet Faucet
                </a>
                <a
                  href="https://sepoliafaucet.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Sepolia Testnet Faucet
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}