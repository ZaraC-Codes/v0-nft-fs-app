"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useActiveAccount, useDisconnect, useConnect } from "thirdweb/react"
import { useProfile } from "@/components/profile/profile-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createWallet, injectedProvider } from "thirdweb/wallets"
import { client } from "@/lib/thirdweb"

interface WalletSwitcherContextType {
  selectedWalletAddress: string | null
  switchWallet: (address: string) => Promise<void>
  availableWallets: Array<{ address: string; name: string; isPrimary: boolean }>
  isSwitching: boolean
}

const WalletSwitcherContext = createContext<WalletSwitcherContextType | undefined>(undefined)

export function WalletSwitcherProvider({ children }: { children: ReactNode }) {
  const account = useActiveAccount()
  const { disconnect } = useDisconnect()
  const { connect } = useConnect()
  const { userProfile } = useProfile()
  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string | null>(null)
  const [isSwitching, setIsSwitching] = useState(false)

  // Get all available wallets from profile
  // Determine which wallet is which based on the currently connected wallet type
  const walletId = (account as any)?.wallet?.id
  const isEmbeddedWalletConnected = walletId === "inApp" || !walletId || walletId === "embedded"

  const availableWallets = userProfile
    ? (userProfile.linkedWallets || []).map((addr) => {
        // If this address matches the currently connected account, use that to determine type
        const isCurrentlyConnected = addr.toLowerCase() === account?.address?.toLowerCase()

        let name = "External Wallet"
        let isPrimary = false

        if (isCurrentlyConnected) {
          // Use the current connection to determine wallet type
          if (isEmbeddedWalletConnected) {
            name = "Embedded Wallet"
            isPrimary = true
          } else {
            name = "MetaMask"
            isPrimary = false
          }
        } else {
          // For non-connected wallet, assume it's the opposite of current
          if (isEmbeddedWalletConnected) {
            name = "MetaMask"
            isPrimary = false
          } else {
            name = "Embedded Wallet"
            isPrimary = true
          }
        }

        return { address: addr, name, isPrimary }
      })
    : []

  // Initialize selected wallet to currently active account
  useEffect(() => {
    if (account?.address && !selectedWalletAddress) {
      setSelectedWalletAddress(account.address)
    }
  }, [account?.address, selectedWalletAddress])

  const switchWallet = async (address: string) => {
    const wallet = availableWallets.find((w) => w.address === address)
    if (!wallet) return

    // If already connected to this wallet, do nothing
    if (account?.address?.toLowerCase() === address.toLowerCase()) {
      toast.info(`Already connected to ${wallet.name}`)
      return
    }

    setIsSwitching(true)

    try {
      // Disconnect current wallet
      if (account && (account as any).wallet) {
        await disconnect((account as any).wallet)
        // Wait for disconnect to complete
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Connect to selected wallet
      if (wallet.isPrimary) {
        // Connect to embedded wallet
        const embeddedWallet = createWallet("inApp")
        await connect(async () => await embeddedWallet.connect({ client }))
        toast.success("Switched to Embedded Wallet")
      } else {
        // Connect to external wallet (MetaMask)
        const metaMaskWallet = createWallet("io.metamask")
        await connect(async () => await metaMaskWallet.connect({ client }))
        toast.success("Switched to MetaMask")
      }

      setSelectedWalletAddress(address)
    } catch (error: any) {
      console.error("Failed to switch wallet:", error)
      toast.error(`Failed to switch wallet: ${error.message}`)
    } finally {
      setIsSwitching(false)
    }
  }

  return (
    <WalletSwitcherContext.Provider
      value={{
        selectedWalletAddress,
        switchWallet,
        availableWallets,
        isSwitching,
      }}
    >
      {children}
    </WalletSwitcherContext.Provider>
  )
}

export function useWalletSwitcher() {
  const context = useContext(WalletSwitcherContext)
  if (!context) {
    throw new Error("useWalletSwitcher must be used within WalletSwitcherProvider")
  }
  return context
}

export function WalletSwitcher() {
  const { selectedWalletAddress, switchWallet, availableWallets, isSwitching } = useWalletSwitcher()
  const account = useActiveAccount()

  if (availableWallets.length <= 1) {
    return null // Don't show switcher if only one wallet
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Active Wallet for Transactions</h3>
          </div>

          {isSwitching && (
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/30">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <p className="text-sm text-primary">Switching wallets...</p>
            </div>
          )}

          <div className="space-y-2">
            {availableWallets.map((wallet) => {
              const isConnected = account?.address?.toLowerCase() === wallet.address.toLowerCase()
              return (
                <Button
                  key={wallet.address}
                  onClick={() => switchWallet(wallet.address)}
                  disabled={isSwitching}
                  variant={isConnected ? "default" : "outline"}
                  className={`w-full justify-between ${
                    isConnected
                      ? "bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    <div className="text-left">
                      <p className="font-medium">{wallet.name}</p>
                      <p className="text-xs font-mono opacity-70">
                        {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                      </p>
                    </div>
                  </div>
                  {isConnected && <Check className="h-4 w-4" />}
                </Button>
              )
            })}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-3">
            {isSwitching
              ? "Please approve the connection in your wallet..."
              : "Click to switch which wallet signs transactions"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
