import { CreateNFTForm } from "@/components/nft/create-nft-form"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-card/50 border-border/50 backdrop-blur-xl">
            <CardHeader className="text-center">
              <Badge className="mb-4 bg-gradient-to-r from-accent/20 to-secondary/20 text-accent border-accent/30 mx-auto">
                <Sparkles className="mr-1 h-3 w-3" />
                Create NFT
              </Badge>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                Mint Your Digital Masterpiece
              </h1>
              <p className="text-muted-foreground">
                Transform your digital art into a unique NFT and join the cyberpunk revolution
              </p>
            </CardHeader>
            <CardContent>
              <CreateNFTForm />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
