import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturedNFTs } from "@/components/featured-nfts"
import { Categories } from "@/components/categories"
import { TrendingCollections } from "@/components/trending-collections"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Header />
      <main>
        <HeroSection />
        <FeaturedNFTs />
        <Categories />
        <TrendingCollections />
      </main>
      <Footer />
    </div>
  )
}
