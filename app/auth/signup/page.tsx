import { WalletConnect } from "@/components/web3/wallet-connect"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background cyber-grid flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-accent/5" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative">
        <Card className="bg-card/50 border-border/50 backdrop-blur-xl">
          <CardHeader className="text-center pb-4">
            {/* Logo */}
            <Link href="/" className="flex items-center justify-center space-x-2 mb-4">
              <img
                src="/fs-temp-logo.png"
                alt="Fortuna Square Logo"
                className="h-10 w-10 object-contain"
              />
              <span className="text-2xl font-bold neon-text text-primary">Fortuna Square</span>
            </Link>

            <Badge className="mb-4 bg-gradient-to-r from-secondary/20 to-accent/20 text-secondary border-secondary/30 mx-auto">
              <Sparkles className="mr-1 h-3 w-3" />
              Join the Future
            </Badge>

            <h1 className="text-2xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-muted-foreground">Connect your wallet to start your journey in the digital realm</p>
          </CardHeader>

          <CardContent className="flex flex-col items-center space-y-4">
            <WalletConnect />

            <p className="text-xs text-muted-foreground text-center mt-4">
              Connect with Google, Apple, Facebook, email, or your existing wallet to create an account
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
