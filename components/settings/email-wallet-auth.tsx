"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Wallet, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useConnect } from "thirdweb/react"
import { inAppWallet } from "thirdweb/wallets"
import { client, apeChainCurtis } from "@/lib/thirdweb"
import { useProfile } from "@/components/profile/profile-provider"
import { ProfileService } from "@/lib/profile-service"

export function EmailWalletAuth() {
  const { userProfile, refreshProfile } = useProfile()
  const { connect } = useConnect()
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  if (!userProfile) return null

  const hasEmail = !!userProfile.email
  const linkedWallets = ProfileService.getAllWallets(userProfile)

  // Check if user has an embedded wallet already
  // Embedded wallets are typically Smart Wallets or in-app wallets
  // For now, we'll show the button if they have email but only external wallets
  const hasOnlyExternalWallets = linkedWallets.length > 0 && !linkedWallets.some(w =>
    w.toLowerCase().startsWith('0x') && w.length === 42
  )

  // Don't show if user doesn't have email
  if (!hasEmail) return null

  // Don't show if user already has multiple wallets (likely already has embedded)
  if (linkedWallets.length > 1) {
    return (
      <Card className="border-green-500/50 bg-green-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-500">
            <CheckCircle2 className="h-5 w-5" />
            Email Wallet Active
          </CardTitle>
          <CardDescription>
            Your email is authenticated and linked to your wallets
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const handleEmailAuth = async () => {
    setIsAuthenticating(true)
    try {
      const wallet = inAppWallet({
        auth: {
          options: ["email"],
        },
        smartAccount: {
          chain: apeChainCurtis,
          sponsorGas: false,
        },
      })

      toast.info("Opening email authentication...")

      // Connect with email
      const account = await connect(async () => {
        await wallet.connect({
          client: client,
          chain: apeChainCurtis,
          strategy: "email",
          email: userProfile.email!,
        })
        return wallet
      })

      if (account) {
        // Wallet created and connected!
        // The auth-provider will automatically link it to the profile
        toast.success("Email wallet created and linked!")
        await refreshProfile()
      }
    } catch (error: any) {
      console.error("Email authentication failed:", error)
      if (error.message?.includes("User closed")) {
        toast.error("Authentication cancelled")
      } else {
        toast.error("Failed to authenticate email")
      }
    } finally {
      setIsAuthenticating(false)
    }
  }

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Create Embedded Wallet
        </CardTitle>
        <CardDescription>
          Authenticate with your email to create an embedded wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
          <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1 space-y-2 text-sm">
            <p className="font-medium">What is an embedded wallet?</p>
            <ul className="space-y-1 text-muted-foreground list-disc list-inside">
              <li>A wallet controlled by your email authentication</li>
              <li>No seed phrase needed - secured by your email</li>
              <li>Switch between your external wallet and embedded wallet</li>
              <li>Use for transactions without connecting MetaMask every time</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-mono">{userProfile.email}</span>
          </div>
          <Badge variant="secondary">Ready</Badge>
        </div>

        <Button
          onClick={handleEmailAuth}
          disabled={isAuthenticating}
          className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/80 hover:to-purple-500/80"
        >
          {isAuthenticating ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Authenticating...
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4 mr-2" />
              Click here to authenticate with your email
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
