import { WatchlistPage } from "@/components/watchlist/watchlist-page"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function Watchlist() {
  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Header />
      <main>
        <WatchlistPage />
      </main>
      <Footer />
    </div>
  )
}
