import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Twitter, Github, Diamond as Discord, Mail, Zap, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-card/30 border-t border-border/50 mt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img
                src="/fs-temp-logo.png"
                alt="Fortuna Square Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold neon-text text-primary">Fortuna Square</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The premier digital marketplace. Discover, collect, and trade unique NFTs in our advanced
              trading platform.
            </p>
            <div className="flex space-x-2">
              <Button size="icon" variant="ghost" className="hover:text-primary">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="hover:text-primary">
                <Discord className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="hover:text-primary">
                <Github className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Marketplace */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Marketplace</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/explore" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Explore NFTs
              </Link>
              <Link href="/collections" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Collections
              </Link>
              <Link href="/create" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Create NFT
              </Link>
              <Link href="/rankings" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Rankings
              </Link>
              <Link href="/activity" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Activity
              </Link>
            </nav>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Community</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Blog
              </Link>
              <Link href="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Help Center
              </Link>
              <Link href="/docs" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Documentation
              </Link>
              <Link href="/partners" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Partners
              </Link>
              <Link href="/careers" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Careers
              </Link>
            </nav>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">Get the latest news and updates from the Fortuna Square marketplace.</p>
            <div className="space-y-2">
              <Input placeholder="Enter your email" className="bg-card/50 border-border/50 focus:border-primary/50" />
              <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 neon-glow">
                <Mail className="mr-2 h-4 w-4" />
                Subscribe
              </Button>
            </div>
            <Badge className="bg-gradient-to-r from-accent/20 to-secondary/20 text-accent border-accent/30">
              <Zap className="mr-1 h-3 w-3" />
              Weekly NFT Drops
            </Badge>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">© 2025 Fortuna Square. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <div className="flex items-center text-sm text-muted-foreground">
              Made with <Heart className="mx-1 h-3 w-3 text-red-500" /> for the future
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
