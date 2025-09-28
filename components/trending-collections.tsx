import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TrendingUp, Users, Zap, ArrowRight } from "lucide-react"

const trendingCollections = [
  {
    id: 1,
    name: "Cyber Punks Elite",
    creator: "NeonStudio",
    creatorAvatar: "/cyberpunk-avatar-neon.png",
    floorPrice: "0.8 ETH",
    volume: "1,234 ETH",
    change: "+15.2%",
    items: 10000,
    owners: 3456,
    coverImage: "/cyberpunk-collection-banner-neon.jpg",
    previewImages: ["/cyberpunk-nft-1.png", "/cyberpunk-nft-2.png", "/cyberpunk-nft-3.png"],
  },
  {
    id: 2,
    name: "Digital Dreamscape",
    creator: "FutureArt",
    creatorAvatar: "/digital-artist-avatar.png",
    floorPrice: "1.2 ETH",
    volume: "987 ETH",
    change: "+8.7%",
    items: 5000,
    owners: 2134,
    coverImage: "/digital-dreamscape-futuristic.jpg",
    previewImages: ["/digital-dream-1.jpg", "/digital-dream-2.jpg", "/digital-dream-3.jpg"],
  },
  {
    id: 3,
    name: "Neon Warriors",
    creator: "ElectricMind",
    creatorAvatar: "/neon-warrior-avatar.jpg",
    floorPrice: "2.1 ETH",
    volume: "2,456 ETH",
    change: "+23.1%",
    items: 7777,
    owners: 4321,
    coverImage: "/neon-warriors-cyberpunk-battle.jpg",
    previewImages: ["/neon-warrior-1.jpg", "/neon-warrior-2.jpg", "/neon-warrior-3.jpg"],
  },
]

export function TrendingCollections() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <Badge className="mb-4 bg-gradient-to-r from-secondary/20 to-accent/20 text-secondary border-secondary/30">
              <TrendingUp className="mr-1 h-3 w-3" />
              Hot Collections
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              Trending Collections
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Explore the most popular NFT collections that are making waves in the digital art world
            </p>
          </div>
          <Button
            variant="outline"
            className="border-secondary/50 text-secondary hover:bg-secondary/10 hover:border-secondary mt-4 md:mt-0 bg-transparent"
          >
            View All Collections
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {trendingCollections.map((collection, index) => (
            <Card
              key={collection.id}
              className="group bg-card/50 border-border/50 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/20 overflow-hidden"
            >
              {/* Cover Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={collection.coverImage || "/placeholder.svg"}
                  alt={collection.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Rank Badge */}
                <Badge className="absolute top-4 left-4 bg-gradient-to-r from-secondary to-accent text-white border-0 neon-glow">
                  #{index + 1}
                </Badge>

                {/* Preview Images */}
                <div className="absolute bottom-4 left-4 flex space-x-2">
                  {collection.previewImages.map((img, idx) => (
                    <div key={idx} className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white/20">
                      <img src={img || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              <CardContent className="p-6">
                {/* Collection Info */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1 group-hover:text-secondary transition-colors">
                      {collection.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={collection.creatorAvatar || "/placeholder.svg"} />
                        <AvatarFallback>{collection.creator[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">by {collection.creator}</span>
                    </div>
                  </div>
                  <Badge
                    className={`${collection.change.startsWith("+") ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}
                  >
                    {collection.change}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Floor Price</p>
                    <p className="font-semibold text-secondary neon-text">{collection.floorPrice}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Volume</p>
                    <p className="font-semibold text-accent neon-text">{collection.volume}</p>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span className="flex items-center">
                    <Zap className="mr-1 h-3 w-3" />
                    {collection.items.toLocaleString()} items
                  </span>
                  <span className="flex items-center">
                    <Users className="mr-1 h-3 w-3" />
                    {collection.owners.toLocaleString()} owners
                  </span>
                </div>

                {/* Action Button */}
                <Button className="w-full bg-gradient-to-r from-secondary to-accent hover:from-secondary/80 hover:to-accent/80 neon-glow">
                  Explore Collection
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
