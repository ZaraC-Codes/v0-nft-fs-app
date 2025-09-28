import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap, TrendingUp, Users } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <Badge className="mb-6 bg-gradient-to-r from-primary/20 to-secondary/20 text-primary border-primary/30 neon-glow">
            <Zap className="mr-1 h-3 w-3" />
            Next-Gen NFT Marketplace
          </Badge>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent leading-tight">
            Discover, Collect & Trade
            <br />
            <span className="neon-text">Digital Masterpieces</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Enter the future of digital ownership. Buy, sell, and showcase unique NFTs in our cyberpunk-inspired
            marketplace powered by cutting-edge blockchain technology.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 neon-glow text-lg px-8"
            >
              Explore NFTs
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-secondary/50 text-secondary hover:bg-secondary/10 hover:border-secondary text-lg px-8 bg-transparent"
            >
              Create NFT
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary neon-text mb-1">50K+</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center">
                <Users className="mr-1 h-4 w-4" />
                Active Users
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-secondary neon-text mb-1">125K+</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center">
                <Zap className="mr-1 h-4 w-4" />
                NFTs Traded
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-accent neon-text mb-1">2.5M+</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center">
                <TrendingUp className="mr-1 h-4 w-4" />
                Volume (ETH)
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
