"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Eye } from "lucide-react"
import Link from "next/link"

const relatedNFTs = [
  {
    id: "2",
    title: "Cyber Samurai #002",
    creator: "NeonArtist",
    price: "2.1 ETH",
    image: "/cyberpunk-nft-1.png",
    rarity: "Epic",
    likes: 189,
    views: 987,
  },
  {
    id: "3",
    title: "Cyber Samurai #003",
    creator: "NeonArtist",
    price: "1.8 ETH",
    image: "/cyberpunk-nft-2.png",
    rarity: "Rare",
    likes: 156,
    views: 743,
  },
  {
    id: "4",
    title: "Cyber Samurai #004",
    creator: "NeonArtist",
    price: "3.0 ETH",
    image: "/cyberpunk-nft-3.png",
    rarity: "Legendary",
    likes: 298,
    views: 1456,
  },
  {
    id: "5",
    title: "Cyber Samurai #005",
    creator: "NeonArtist",
    price: "1.5 ETH",
    image: "/cyberpunk-samurai-neon-digital-art.jpg",
    rarity: "Rare",
    likes: 134,
    views: 621,
  },
]

const rarityColors = {
  Legendary: "from-yellow-400 to-orange-500",
  Epic: "from-purple-400 to-pink-500",
  Rare: "from-blue-400 to-cyan-500",
  Common: "from-gray-400 to-gray-500",
}

interface RelatedNFTsProps {
  collectionId: string
  currentNFTId: string
}

export function RelatedNFTs({ collectionId, currentNFTId }: RelatedNFTsProps) {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          More from this collection
        </h2>
        <Button
          variant="outline"
          className="border-primary/50 text-primary hover:bg-primary/10 hover:border-primary bg-transparent"
        >
          View Collection
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedNFTs.map((nft) => (
          <Card
            key={nft.id}
            className="group bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 overflow-hidden"
          >
            <Link href={`/nft/${nft.id}`}>
              <div className="relative">
                <img
                  src={nft.image || "/placeholder.svg"}
                  alt={nft.title}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Rarity Badge */}
                <Badge
                  className={`absolute top-3 left-3 bg-gradient-to-r ${rarityColors[nft.rarity as keyof typeof rarityColors]} text-white border-0 neon-glow`}
                >
                  {nft.rarity}
                </Badge>

                {/* Like Button */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                >
                  <Heart className="h-4 w-4" />
                </Button>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-4 w-full">
                    <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 neon-glow">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {nft.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">by {nft.creator}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary neon-text">{nft.price}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center">
                      <Heart className="mr-1 h-3 w-3" />
                      {nft.likes}
                    </span>
                    <span className="flex items-center">
                      <Eye className="mr-1 h-3 w-3" />
                      {nft.views}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  )
}
