import { WalletConnect } from "@/components/web3/wallet-connect"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background cyber-grid flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

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

            <Badge className="mb-4 bg-gradient-to-r from-primary/20 to-secondary/20 text-primary border-primary/30 mx-auto">
              <Zap className="mr-1 h-3 w-3" />
              Web3 Authentication
            </Badge>

            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-muted-foreground">Connect your wallet to access your digital collection</p>
          </CardHeader>

          <CardContent className="flex flex-col items-center space-y-4">
            <WalletConnect />

            <p className="text-xs text-muted-foreground text-center mt-4">
              New users will automatically create an account when connecting for the first time
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
