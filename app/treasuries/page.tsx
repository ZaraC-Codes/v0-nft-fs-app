"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { CreateGroupModal } from "@/components/group/create-group-modal"
import { Plus, Vault, Users, TrendingUp, Crown, Lock } from "lucide-react"
import { useActiveAccount } from "thirdweb/react"

export default function TreasuriesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const router = useRouter()
  const account = useActiveAccount()

  // Mock treasuries - in production, fetch from smart contract
  const mockTreasuries = [
    {
      id: "1",
      name: "BAYC Legends",
      description: "Elite treasury of Bored Ape holders collaborating on blue-chip NFT investments.",
      image: "https://api.dicebear.com/7.x/shapes/svg?seed=1",
      memberCount: 8,
      totalValue: 2450.8,
      isPrivate: true,
      role: "creator",
    },
  ]

  const handleCreateSuccess = (treasuryId: string) => {
    router.push(`/treasuries/${treasuryId}`)
  }

  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold neon-text mb-2">
                Treasury Groups
              </h1>
              <p className="text-muted-foreground">
                Collaborative NFT portfolios with AI-powered management
              </p>
            </div>

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              disabled={!account}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Treasury
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Your Treasuries</p>
                    <p className="text-3xl font-bold text-primary">{mockTreasuries.length}</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Vault className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Members</p>
                    <p className="text-3xl font-bold text-primary">
                      {mockTreasuries.reduce((acc, t) => acc + t.memberCount, 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-3xl font-bold text-primary">
                      {mockTreasuries.reduce((acc, t) => acc + t.totalValue, 0).toFixed(1)} APE
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Treasuries List */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Your Treasuries</h2>

            {!account ? (
              <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
                <CardContent className="p-12 text-center">
                  <Vault className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
                  <p className="text-muted-foreground mb-4">
                    Connect your wallet to view and create treasury groups
                  </p>
                </CardContent>
              </Card>
            ) : mockTreasuries.length === 0 ? (
              <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
                <CardContent className="p-12 text-center">
                  <Vault className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Treasuries Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first treasury group to start collaborating
                  </p>
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-gradient-to-r from-primary to-secondary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Treasury
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockTreasuries.map((treasury) => (
                  <Card
                    key={treasury.id}
                    className="border-border/50 bg-card/50 backdrop-blur-xl hover:border-primary/50 transition-all cursor-pointer group"
                    onClick={() => router.push(`/treasuries/${treasury.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 border-2 border-background">
                          <AvatarImage src={treasury.image} alt={treasury.name} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary">
                            <Vault className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="group-hover:text-primary transition-colors">
                              {treasury.name}
                            </CardTitle>
                            {treasury.isPrivate && (
                              <Badge variant="outline" className="text-xs">
                                <Lock className="h-3 w-3 mr-1" />
                                Private
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {treasury.description}
                          </p>

                          {treasury.role === "creator" && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs mt-2">
                              <Crown className="h-3 w-3 mr-1" />
                              Creator
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Members</p>
                          <p className="font-bold text-lg">
                            <Users className="h-4 w-4 inline mr-1" />
                            {treasury.memberCount}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-muted-foreground">Total Value</p>
                          <p className="font-bold text-lg text-primary">
                            {treasury.totalValue} APE
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Create Treasury Modal */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}
