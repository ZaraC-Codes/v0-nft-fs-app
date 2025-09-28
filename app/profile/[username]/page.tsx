import { UserProfile } from "@/components/profile/user-profile"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

// Mock user data - in a real app, this would come from an API
const mockUser = {
  id: "user1",
  username: "CyberCollector",
  displayName: "Cyber Collector",
  bio: "Digital art enthusiast exploring the cyberpunk metaverse. Collecting rare NFTs and supporting emerging artists in the blockchain space.",
  avatar: "/cyberpunk-avatar-neon.png",
  banner: "/cyberpunk-collection-banner-neon.jpg",
  isVerified: true,
  walletAddress: "0x742d35Cc6634C0532925a3b8D0C9C0E3C5d5c8E9",
  joinedDate: "2024-03-15",
  stats: {
    followers: 2456,
    following: 189,
    nftsOwned: 47,
    nftsCreated: 12,
    totalVolume: "125.7 ETH",
  },
  socialLinks: {
    twitter: "https://twitter.com/cybercollector",
    discord: "CyberCollector#1234",
    website: "https://cybercollector.art",
  },
  collections: [
    {
      id: "collection1",
      name: "Cyber Samurai Elite",
      itemCount: 15,
      floorPrice: "0.8 ETH",
      image: "/cyberpunk-collection-banner-neon.jpg",
    },
    {
      id: "collection2",
      name: "Digital Dreams",
      itemCount: 8,
      floorPrice: "1.2 ETH",
      image: "/digital-dreamscape-futuristic.jpg",
    },
  ],
  ownedNFTs: [
    {
      id: "1",
      title: "Cyber Samurai #001",
      image: "/cyberpunk-samurai-neon-digital-art.jpg",
      price: "2.5 ETH",
      rarity: "Legendary",
    },
    {
      id: "2",
      title: "Digital Dreams #042",
      image: "/digital-dream-1.jpg",
      price: "1.8 ETH",
      rarity: "Epic",
    },
    {
      id: "3",
      title: "Neon Genesis #007",
      image: "/abstract-neon-geometric-cyberpunk-art.jpg",
      price: "3.2 ETH",
      rarity: "Legendary",
    },
    {
      id: "4",
      title: "Electric Soul #156",
      image: "/electric-portrait-neon-cyberpunk-face.jpg",
      price: "1.2 ETH",
      rarity: "Rare",
    },
  ],
  createdNFTs: [
    {
      id: "5",
      title: "Cyber Vision #001",
      image: "/futuristic-cityscape-neon-lights-digital.jpg",
      price: "0.8 ETH",
      rarity: "Rare",
    },
    {
      id: "6",
      title: "Neon Dreams #023",
      image: "/cyberpunk-nft-1.png",
      price: "1.1 ETH",
      rarity: "Epic",
    },
  ],
}

export default function ProfilePage({ params }: { params: { username: string } }) {
  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Header />
      <main>
        <UserProfile user={mockUser} />
      </main>
      <Footer />
    </div>
  )
}
