import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, Palette, Music, Camera, Trophy, Sparkles, Globe } from "lucide-react"

const categories = [
  {
    id: 1,
    name: "Gaming",
    icon: Gamepad2,
    count: "12.5K",
    color: "from-blue-400 to-cyan-500",
    description: "Game assets & collectibles",
  },
  {
    id: 2,
    name: "Digital Art",
    icon: Palette,
    count: "8.2K",
    color: "from-purple-400 to-pink-500",
    description: "Unique digital masterpieces",
  },
  {
    id: 3,
    name: "Music",
    icon: Music,
    count: "3.7K",
    color: "from-green-400 to-emerald-500",
    description: "Audio NFTs & soundtracks",
  },
  {
    id: 4,
    name: "Photography",
    icon: Camera,
    count: "5.1K",
    color: "from-orange-400 to-red-500",
    description: "Stunning visual captures",
  },
  {
    id: 5,
    name: "Collectibles",
    icon: Trophy,
    count: "9.8K",
    color: "from-yellow-400 to-orange-500",
    description: "Rare digital collectibles",
  },
  {
    id: 6,
    name: "Virtual Worlds",
    icon: Globe,
    count: "2.3K",
    color: "from-indigo-400 to-purple-500",
    description: "Metaverse assets",
  },
]

export function Categories() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-transparent to-card/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-accent/20 to-primary/20 text-accent border-accent/30">
            <Sparkles className="mr-1 h-3 w-3" />
            Explore Categories
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            Discover Your Passion
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Dive into diverse categories of digital assets and find the perfect NFTs that match your interests
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <Card
                key={category.id}
                className="group bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 cursor-pointer overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${category.color} neon-glow`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="bg-secondary/20 text-secondary border-secondary/30">
                      {category.count} items
                    </Badge>
                  </div>

                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>

                  <p className="text-muted-foreground text-sm">{category.description}</p>

                  {/* Hover Effect */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="h-1 bg-gradient-to-r from-primary to-secondary rounded-full" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
