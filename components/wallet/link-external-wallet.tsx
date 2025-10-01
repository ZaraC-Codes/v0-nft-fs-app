"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConnectButton, useActiveAccount, useDisconnect } from "thirdweb/react"
import { createWallet } from "thirdweb/wallets"
import { client, apeChainCurtis } from "@/lib/thirdweb"
import { ProfileService } from "@/lib/profile-service"
import { useProfile } from "@/components/profile/profile-provider"
import { useAuth } from "@/components/auth/auth-provider"
import { toast } from "sonner"
import { Wallet, Link as LinkIcon, CheckCircle2, AlertCircle } from "lucide-react"

export function LinkExternalWallet() {
  const { userProfile, refreshProfile } = useProfile()
  const { user } = useAuth()
  const account = useActiveAccount()
  const { disconnect } = useDisconnect()
  const [isLinking, setIsLinking] = useState(false)

  // External wallet options
  const externalWallets = [
    createWallet("io.metamask"),
    createWallet("io.rabby"),
    createWallet("com.coinbase.wallet"),
    createWallet("io.useglyph"),
    createWallet("walletConnect"),
  ]

  const handleLinkWallet = async () => {
    if (!account?.address || !userProfile) {
      toast.error("Please connect an external wallet first")
      return
    }

    // Check if this is the embedded wallet (primary wallet)
    const isPrimaryWallet = account.address.toLowerCase() === userProfile.walletAddress?.toLowerCase()
    if (isPrimaryWallet) {
      toast.error("This is your primary embedded wallet, cannot link to itself")
      return
    }

    // Check if wallet is already linked
    const linkedWallets = ProfileService.getAllWallets(userProfile)
    const isAlreadyLinked = linkedWallets.some(w => w.toLowerCase() === account.address.toLowerCase())

    if (isAlreadyLinked) {
      toast.error("This wallet is already linked to your account")
      return
    }

    setIsLinking(true)

    try {
      // Request signature to verify wallet ownership
      const message = `Link wallet ${account.address} to Fortuna Square account ${userProfile.username}\n\nTimestamp: ${Date.now()}`

      // Sign the message
      const signature = await account.signMessage({ message })

      if (!signature) {
        throw new Error("Signature verification failed")
      }

      console.log("✅ Wallet signature verified:", signature.slice(0, 20) + "...")

      // Link wallet to profile
      await ProfileService.linkAdditionalWallet(userProfile.id, account.address)

      // Refresh profile data
      await refreshProfile()

      toast.success(`Wallet ${account.address.slice(0, 6)}...${account.address.slice(-4)} linked successfully!`)

      // Disconnect the external wallet after linking
      await disconnect()

    } catch (error: any) {
      console.error("Failed to link wallet:", error)
      if (error.message?.includes("User rejected")) {
        toast.error("Signature rejected. Wallet not linked.")
      } else {
        toast.error("Failed to link wallet. Please try again.")
      }
    } finally {
      setIsLinking(false)
    }
  }

  const linkedWallets = userProfile ? ProfileService.getAllWallets(userProfile) : []
  const primaryWallet = userProfile?.walletAddress

  // Check if currently connected wallet is the embedded wallet or an external one
  const isPrimaryWalletConnected = account?.address?.toLowerCase() === primaryWallet?.toLowerCase()
  const isExternalWalletConnected = account && !isPrimaryWalletConnected

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          Link External Wallets
        </CardTitle>
        <CardDescription>
          Connect MetaMask, Coinbase Wallet, or other external wallets to your account
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Linked Wallets */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Your Wallets</h3>
          {linkedWallets.length > 0 ? (
            <div className="space-y-2">
              {linkedWallets.map((wallet, index) => {
                const isPrimary = wallet.toLowerCase() === primaryWallet?.toLowerCase()
                return (
                  <div
                    key={wallet}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/10 border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <Wallet className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-mono text-sm">
                          {wallet.slice(0, 8)}...{wallet.slice(-6)}
                        </p>
                        {isPrimary && (
                          <p className="text-xs text-muted-foreground">Primary (Embedded Wallet)</p>
                        )}
                      </div>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No wallets linked yet</p>
          )}
        </div>

        {/* Link New Wallet */}
        <div className="space-y-4">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/30">
            <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-1">How to link an external wallet:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Click "Connect External Wallet" below</li>
                <li>Choose your wallet (MetaMask, Coinbase, etc.)</li>
                <li>Sign the message to verify ownership</li>
                <li>Your wallet will be linked to this account</li>
              </ol>
            </div>
          </div>

          {/* Show Connect button only if embedded wallet is connected or no wallet */}
          {isPrimaryWalletConnected || !account ? (
            <ConnectButton
              client={client}
              wallets={externalWallets}
              theme="dark"
              connectButton={{
                label: "Connect External Wallet",
                className: "w-full !bg-gradient-to-r !from-primary !to-secondary hover:!from-primary/80 hover:!to-secondary/80",
              }}
              connectModal={{
                size: "compact",
                title: "Connect External Wallet",
                titleIcon: "",
                showThirdwebBranding: false,
              }}
            />
          ) : isExternalWalletConnected ? (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <p className="text-sm font-medium">
                  External wallet connected: {account?.address.slice(0, 6)}...{account?.address.slice(-4)}
                </p>
              </div>

              <Button
                onClick={handleLinkWallet}
                disabled={isLinking}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
              >
                {isLinking ? "Linking..." : "Sign & Link This Wallet"}
              </Button>

              <Button
                onClick={() => disconnect()}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
