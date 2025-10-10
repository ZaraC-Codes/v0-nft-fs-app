"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap } from "lucide-react"
import { apeChain, sepolia } from "@/lib/thirdweb"
import { NFTCardGrid } from "@/components/nft/cards/NFTCardGrid"
import { PortfolioNFT } from "@/types/profile"

// Convert featured NFTs to PortfolioNFT format for NFTCardGrid
const featuredNFTs: PortfolioNFT[] = [
  {
    contractAddress: "0x1234567890123456789012345678901234567890",
    tokenId: "1",
    name: "Cyber Samurai #001",
    collection: "Cyber Samurai",
    image: "/cyberpunk-samurai-neon-digital-art.jpg",
    chainId: apeChain.id,
    rarity: "Legendary",
    listing: {
      type: "sale" as const,
      listingId: 1,
      sale: { price: "2.5" },
    },
  },
  {
    contractAddress: "0x2345678901234567890123456789012345678901",
    tokenId: "42",
    name: "Digital Dreams",
    collection: "Digital Dreams",
    image: "/futuristic-cityscape-neon-lights-digital.jpg",
    chainId: sepolia.id,
    rarity: "Epic",
    listing: {
      type: "sale" as const,
      listingId: 2,
      sale: { price: "0.018" },
    },
  },
  {
    contractAddress: "0x3456789012345678901234567890123456789012",
    tokenId: "777",
    name: "Neon Genesis",
    collection: "Neon Genesis",
    image: "/abstract-neon-geometric-cyberpunk-art.jpg",
    chainId: apeChain.id,
    rarity: "Legendary",
    listing: {
      type: "sale" as const,
      listingId: 3,
      sale: { price: "3.2" },
    },
  },
  {
    contractAddress: "0x4567890123456789012345678901234567890123",
    tokenId: "99",
    name: "Electric Soul",
    collection: "Electric Soul",
    image: "/electric-portrait-neon-cyberpunk-face.jpg",
    chainId: sepolia.id,
    rarity: "Rare",
    listing: {
      type: "sale" as const,
      listingId: 4,
      sale: { price: "0.012" },
    },
  },
]

export function FeaturedNFTs() {
  const [selectedNFT, setSelectedNFT] = useState<any>(null)

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-primary/20 to-secondary/20 text-primary border-primary/30">
            <Zap className="mr-1 h-3 w-3" />
            Featured Collection
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Trending NFTs
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover the most sought-after digital assets from top creators in our cyberpunk universe
          </p>
        </div>

        {/* NFT Grid - Now using NFTCardGrid component */}
        <NFTCardGrid
          nfts={featuredNFTs}
          size="standard"
          showWatchlist={true}
          showActions={true}
          onCardClick={(nft) => setSelectedNFT(nft)}
          onBuyClick={(nft) => console.log('Buy:', nft)}
          className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        />

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            className="border-primary/50 text-primary hover:bg-primary/10 hover:border-primary bg-transparent"
          >
            View All NFTs
          </Button>
        </div>
      </div>
    </section>
  )
}
