import { NFTDetail } from "@/components/nft/nft-detail"
import { RelatedNFTs } from "@/components/nft/related-nfts"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

// Mock NFT data - in a real app, this would come from an API
const mockNFT = {
  id: "1",
  title: "Cyber Samurai #001",
  description:
    "A legendary warrior from the digital realm, forged in the fires of neon and code. This unique piece represents the fusion of ancient honor and futuristic technology.",
  image: "/cyberpunk-samurai-neon-digital-art.jpg",
  creator: {
    id: "creator1",
    username: "NeonArtist",
    avatar: "/digital-artist-avatar.png",
    isVerified: true,
  },
  owner: {
    id: "owner1",
    username: "CyberCollector",
    avatar: "/cyberpunk-avatar-neon.png",
    isVerified: true,
  },
  collection: {
    id: "collection1",
    name: "Cyber Samurai Elite",
    floorPrice: "0.8 ETH",
  },
  price: "2.5 ETH",
  rarity: "Legendary",
  attributes: [
    { trait_type: "Background", value: "Neon City", rarity: "15%" },
    { trait_type: "Armor", value: "Quantum Steel", rarity: "8%" },
    { trait_type: "Weapon", value: "Plasma Katana", rarity: "3%" },
    { trait_type: "Eyes", value: "Cyber Glow", rarity: "12%" },
    { trait_type: "Aura", value: "Electric", rarity: "5%" },
  ],
  stats: {
    views: 1520,
    likes: 234,
    offers: 12,
  },
  blockchain: "Ethereum",
  tokenId: "001",
  contractAddress: "0x742d35Cc6634C0532925a3b8D0C9C0E3C5d5c8E9",
  history: [
    {
      event: "Sale",
      price: "2.5 ETH",
      from: "NeonArtist",
      to: "CyberCollector",
      date: "2025-01-15T10:30:00Z",
    },
    {
      event: "Listing",
      price: "2.5 ETH",
      from: "CyberCollector",
      to: null,
      date: "2025-01-14T15:20:00Z",
    },
    {
      event: "Mint",
      price: null,
      from: null,
      to: "NeonArtist",
      date: "2025-01-10T09:15:00Z",
    },
  ],
}

export default function NFTPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <NFTDetail nft={mockNFT} />
        <RelatedNFTs collectionId={mockNFT.collection.id} currentNFTId={mockNFT.id} />
      </main>
      <Footer />
    </div>
  )
}
