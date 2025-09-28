import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Eye, Zap } from "lucide-react"

const featuredNFTs = [
  {
    id: 1,
    title: "Cyber Samurai #001",
    creator: "NeonArtist",
    price: "2.5 ETH",
    image: "/cyberpunk-samurai-neon-digital-art.jpg",
    rarity: "Legendary",
    likes: 234,
    views: 1520,
  },
  {
    id: 2,
    title: "Digital Dreams",
    creator: "FutureVision",
    price: "1.8 ETH",
    image: "/futuristic-cityscape-neon-lights-digital.jpg",
    rarity: "Epic",
    likes: 189,
    views: 987,
  },
  {
    id: 3,
    title: "Neon Genesis",
    creator: "CyberCreator",
    price: "3.2 ETH",
    image: "/abstract-neon-geometric-cyberpunk-art.jpg",
    rarity: "Legendary",
    likes: 456,
    views: 2341,
  },
  {
    id: 4,
    title: "Electric Soul",
    creator: "DigitalMind",
    price: "1.2 ETH",
    image: "/electric-portrait-neon-cyberpunk-face.jpg",
    rarity: "Rare",
    likes: 123,
    views: 654,
  },
]

const rarityColors = {
  Legendary: "from-yellow-400 to-orange-500",
  Epic: "from-purple-400 to-pink-500",
  Rare: "from-blue-400 to-cyan-500",
  Common: "from-gray-400 to-gray-500",
}

export function FeaturedNFTs() {
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

        {/* NFT Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredNFTs.map((nft) => (
            <Card
              key={nft.id}
              className="group bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 overflow-hidden"
            >
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
                >
                  <Heart className="h-4 w-4" />
                </Button>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-4 w-full">
                    <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 neon-glow">
                      Place Bid
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
            </Card>
          ))}
        </div>

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
