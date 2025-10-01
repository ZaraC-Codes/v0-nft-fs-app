"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileService } from "@/lib/profile-service"
import { useProfile } from "@/components/profile/profile-provider"
import { useAuth } from "@/components/auth/auth-provider"
import { toast } from "sonner"
import { Wallet, Link as LinkIcon, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react"

export function LinkExternalWallet() {
  const { userProfile, refreshProfile } = useProfile()
  const { user } = useAuth()
  const [isLinking, setIsLinking] = useState(false)

  const handleLinkWallet = async () => {
    console.log("🔗 Link Wallet clicked")

    if (!userProfile) {
      console.error("❌ No userProfile")
      toast.error("Profile not loaded. Please refresh and try again.")
      return
    }

    console.log("✅ userProfile loaded:", userProfile.username)

    // Check if browser has wallet extensions available
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      console.error("❌ No window.ethereum found")
      toast.error("No wallet detected. Please install MetaMask, Glyph, or another Ethereum wallet extension first.")
      return
    }

    // Only look for supported Ethereum wallets
    let ethereum = null
    let walletName = ""

    // Check for specific wallet extensions we support
    const win = window as any

    // If window.ethereum has providers array, search through them
    if (win.ethereum?.providers && Array.isArray(win.ethereum.providers)) {
      console.log(`📊 Found ${win.ethereum.providers.length} wallet providers, searching for supported wallets...`)

      // Check for Glyph
      const glyphProvider = win.ethereum.providers.find((p: any) => p.isGlyph)
      if (glyphProvider) {
        ethereum = glyphProvider
        walletName = "Glyph"
        console.log("✅ Found Glyph wallet in providers")
      }
      // Check for MetaMask
      else if (win.ethereum.providers.find((p: any) => p.isMetaMask)) {
        ethereum = win.ethereum.providers.find((p: any) => p.isMetaMask)
        walletName = "MetaMask"
        console.log("✅ Found MetaMask wallet in providers")
      }
      // Check for Rabby
      else if (win.ethereum.providers.find((p: any) => p.isRabby)) {
        ethereum = win.ethereum.providers.find((p: any) => p.isRabby)
        walletName = "Rabby"
        console.log("✅ Found Rabby wallet in providers")
      }
      // Check for Coinbase
      else if (win.ethereum.providers.find((p: any) => p.isCoinbaseWallet)) {
        ethereum = win.ethereum.providers.find((p: any) => p.isCoinbaseWallet)
        walletName = "Coinbase Wallet"
        console.log("✅ Found Coinbase Wallet in providers")
      }
    }

    // If not found in providers array, check directly
    if (!ethereum) {
      // Check for Glyph
      if (win.glyph?.ethereum) {
        ethereum = win.glyph.ethereum
        walletName = "Glyph"
        console.log("✅ Found Glyph wallet")
      }
      // Check for MetaMask
      else if (win.ethereum?.isMetaMask) {
        ethereum = win.ethereum
        walletName = "MetaMask"
        console.log("✅ Found MetaMask wallet")
      }
      // Check for Rabby
      else if (win.ethereum?.isRabby) {
        ethereum = win.ethereum
        walletName = "Rabby"
        console.log("✅ Found Rabby wallet")
      }
      // Check for Coinbase Wallet
      else if (win.ethereum?.isCoinbaseWallet) {
        ethereum = win.ethereum
        walletName = "Coinbase Wallet"
        console.log("✅ Found Coinbase Wallet")
      }
      // Fallback to window.ethereum if it exists
      else if (win.ethereum) {
        ethereum = win.ethereum
        walletName = "Unknown Ethereum Wallet"
        console.log("⚠️ Found unknown Ethereum wallet")
      }
    }

    if (!ethereum) {
      console.error("❌ No supported Ethereum wallet found")
      toast.error("Please install MetaMask, Glyph, Rabby, or Coinbase Wallet extension first.")
      return
    }

    console.log(`🔗 Using ${walletName} for wallet linking`)

    setIsLinking(true)

    try {
      console.log(`📞 Requesting accounts from ${walletName}...`)

      // First check if wallet is already connected
      let accounts = []
      try {
        accounts = await ethereum.request({ method: 'eth_accounts' })
        console.log(`📊 Already connected accounts:`, accounts)
      } catch (err) {
        console.log("⚠️ eth_accounts check failed:", err)
      }

      // If no accounts connected, request connection
      if (!accounts || accounts.length === 0) {
        console.log(`🔌 Wallet not connected. Requesting connection from ${walletName}...`)
        toast.info(`Please approve the connection request in your ${walletName} extension.`)

        try {
          accounts = await ethereum.request({
            method: 'eth_requestAccounts'
          })
          console.log("✅ Connection approved, accounts received:", accounts)
        } catch (err: any) {
          console.error("❌ Connection request failed:", err)
          if (err.code === 4001) {
            toast.error("Connection request rejected. Please approve the connection in your wallet.")
          } else {
            toast.error(`Failed to connect to ${walletName}. Error: ${err.message}`)
          }
          throw err
        }
      } else {
        console.log(`✅ ${walletName} already connected`)
      }

      if (!accounts || accounts.length === 0) {
        toast.error("No wallet account found. Please unlock your wallet and try again.")
        return
      }

      const walletAddress = accounts[0]

      // Check if this is the embedded wallet (primary wallet)
      const isPrimaryWallet = walletAddress.toLowerCase() === userProfile.walletAddress?.toLowerCase()
      if (isPrimaryWallet) {
        toast.error("This is your primary embedded wallet, already linked to your account")
        return
      }

      // Check if wallet is already linked
      const linkedWallets = ProfileService.getAllWallets(userProfile)
      const isAlreadyLinked = linkedWallets.some(w => w.toLowerCase() === walletAddress.toLowerCase())

      if (isAlreadyLinked) {
        toast.error("This wallet is already linked to your account")
        return
      }

      // Request signature from the browser wallet
      const message = `Link wallet ${walletAddress} to Fortuna Square account ${userProfile.username}\n\nTimestamp: ${Date.now()}`

      const signature = await ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      })

      if (!signature) {
        throw new Error("Signature verification failed")
      }

      console.log("✅ Wallet signature verified:", signature.slice(0, 20) + "...")

      // Link wallet to profile
      await ProfileService.linkAdditionalWallet(userProfile.id, walletAddress)

      // Refresh profile data
      await refreshProfile()

      toast.success(`${walletName} wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} linked successfully!`)

    } catch (error: any) {
      console.error("Failed to link wallet:", error)
      if (error.code === 4001 || error.message?.includes("User rejected")) {
        toast.error("Signature rejected. Wallet not linked.")
      } else {
        toast.error(error.message || "Failed to link wallet. Please try again.")
      }
    } finally {
      setIsLinking(false)
    }
  }

  const linkedWallets = userProfile ? ProfileService.getAllWallets(userProfile) : []
  const primaryWallet = userProfile?.walletAddress

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
              <p className="font-medium mb-1">Link an external wallet</p>
              <p className="text-muted-foreground">
                Click "Link Wallet" below. Your browser wallet (MetaMask, Glyph, etc.) will prompt you to sign a message to verify ownership.
              </p>
            </div>
          </div>

          <Button
            onClick={() => {
              console.log("🔘 Button clicked!")
              handleLinkWallet()
            }}
            disabled={isLinking}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {isLinking ? "Linking..." : "Link Wallet"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
