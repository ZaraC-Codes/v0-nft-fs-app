"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useActiveAccount, useDisconnect, useConnect, useSetActiveWallet } from "thirdweb/react"
import { useProfile } from "@/components/profile/profile-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createWallet, inAppWallet } from "thirdweb/wallets"
import { client, apeChain } from "@/lib/thirdweb"

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
  const setActiveWallet = useSetActiveWallet()
  const { userProfile } = useProfile()
  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string | null>(null)
  const [isSwitching, setIsSwitching] = useState(false)

  // Get all available wallets from profile using stored metadata
  const availableWallets = userProfile
    ? (userProfile.wallets || []).map((wallet) => {
        const isPrimary = wallet.type === 'embedded'

        // Determine wallet name based on type
        let name = "Unknown Wallet"
        if (wallet.type === 'embedded') {
          name = "Profile Wallet"
        } else if (wallet.type === 'metamask') {
          name = "MetaMask"
        } else if (wallet.type === 'glyph') {
          name = "Glyph"
        } else if (wallet.type === 'rabby') {
          name = "Rabby"
        } else if (wallet.type === 'coinbase') {
          name = "Coinbase Wallet"
        } else if (wallet.type === 'external') {
          name = "External Wallet"
        }

        return {
          address: wallet.address,
          name,
          isPrimary,
          type: wallet.type
        }
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
    if (!wallet) {
      console.error("❌ Wallet not found in availableWallets:", address)
      return
    }

    // If already connected to this wallet, do nothing
    if (account?.address?.toLowerCase() === address.toLowerCase()) {
      console.log("ℹ️ Already connected to:", address)
      toast.info(`Already connected to ${wallet.name}`)
      return
    }

    console.log("🔄 Starting wallet switch to:", wallet.name, address)
    setIsSwitching(true)

    try {
      // Disconnect current wallet first
      if (account && (account as any).wallet) {
        console.log("📴 Disconnecting current wallet...")
        await disconnect((account as any).wallet)
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      if (wallet.isPrimary) {
        // Switching to embedded wallet
        console.log("📱 Connecting to embedded wallet...")
        const embeddedWallet = inAppWallet({
          auth: {
            options: ["email", "google", "apple", "facebook", "x", "passkey"],
          },
          smartAccount: {
            chain: apeChain,
            sponsorGas: true,
          },
        })
        await connect(async () => {
          const acc = await embeddedWallet.connect({ client, strategy: "auth_endpoint" })
          console.log("✅ Embedded wallet connected:", acc.address)
          setActiveWallet(embeddedWallet)
          return acc
        })
        toast.success("Switched to Embedded Wallet")
      } else {
        // Switching to MetaMask using ThirdWeb
        console.log("🦊 Connecting to MetaMask...")
        const metaMaskWallet = createWallet("io.metamask")
        await connect(async () => {
          const acc = await metaMaskWallet.connect({ client })
          console.log("✅ MetaMask connected:", acc.address)

          // Verify it's the correct address
          if (acc.address.toLowerCase() !== address.toLowerCase()) {
            toast.error(`Please switch to ${address.slice(0, 6)}...${address.slice(-4)} in MetaMask`)
            throw new Error("Wrong MetaMask account selected")
          }

          setActiveWallet(metaMaskWallet)
          return acc
        })
        toast.success("Switched to MetaMask")
      }

      setSelectedWalletAddress(address)
      console.log("✅ Wallet switch completed successfully")
    } catch (error: any) {
      console.error("❌ Failed to switch wallet:", error)
      if (error.code === 4001) {
        toast.error("Connection rejected")
      } else {
        toast.error(`Failed to switch wallet: ${error.message}`)
      }
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
                <button
                  key={wallet.address}
                  onClick={() => {
                    console.log("🔘 WalletSwitcher button clicked!", wallet.address)
                    switchWallet(wallet.address)
                  }}
                  disabled={isSwitching}
                  style={{ zIndex: 9999, position: 'relative' }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-md border transition-colors ${
                    isConnected
                      ? "bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white border-transparent"
                      : "bg-background hover:bg-accent hover:text-accent-foreground border-input"
                  } ${isSwitching ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
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
                </button>
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
