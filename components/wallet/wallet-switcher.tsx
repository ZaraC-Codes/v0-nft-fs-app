"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useActiveAccount, useDisconnect } from "thirdweb/react"
import { useProfile } from "@/components/profile/profile-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"

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
  const { userProfile } = useProfile()
  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string | null>(null)
  const [isSwitching, setIsSwitching] = useState(false)

  // Get all available wallets from profile using stored metadata
  const availableWallets = userProfile
    ? (userProfile.wallets || []).map((wallet) => {
        const isPrimary = wallet.type === 'embedded'
        const name = isPrimary ? "Embedded Wallet" : "MetaMask"

        return {
          address: wallet.address,
          name,
          isPrimary
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
      if (wallet.isPrimary) {
        // Switching to embedded wallet - disconnect external wallet and reload
        console.log("📱 Switching to embedded wallet - will reload page")
        if (account && (account as any).wallet) {
          await disconnect((account as any).wallet)
        }
        toast.info("Reloading to switch to Embedded Wallet...")
        setTimeout(() => window.location.reload(), 500)
      } else {
        // Switching to MetaMask - use window.ethereum directly
        console.log("🦊 Switching to MetaMask...")

        if (typeof window === 'undefined' || !(window as any).ethereum) {
          toast.error("MetaMask not detected. Please install MetaMask extension.")
          return
        }

        // Disconnect current wallet
        if (account && (account as any).wallet) {
          console.log("📴 Disconnecting embedded wallet...")
          await disconnect((account as any).wallet)
          await new Promise(resolve => setTimeout(resolve, 300))
        }

        // Request MetaMask connection
        const ethereum = (window as any).ethereum
        console.log("🔌 Requesting MetaMask connection...")

        try {
          const accounts = await ethereum.request({
            method: 'eth_requestAccounts'
          })

          if (!accounts || accounts.length === 0) {
            toast.error("No MetaMask account found")
            return
          }

          const connectedAddress = accounts[0]
          console.log("✅ MetaMask connected:", connectedAddress)

          // Verify it's the wallet we expect
          if (connectedAddress.toLowerCase() !== address.toLowerCase()) {
            toast.error(`Please switch to ${address.slice(0, 6)}...${address.slice(-4)} in MetaMask`)
            return
          }

          toast.success("Switched to MetaMask")
          setSelectedWalletAddress(address)

          // Reload page to ensure ThirdWeb picks up the new connection
          setTimeout(() => window.location.reload(), 500)
        } catch (err: any) {
          console.error("❌ MetaMask connection failed:", err)
          if (err.code === 4001) {
            toast.error("MetaMask connection rejected")
          } else {
            toast.error(`Failed to connect to MetaMask: ${err.message}`)
          }
          throw err
        }
      }
    } catch (error: any) {
      console.error("❌ Failed to switch wallet:", error)
      console.error("❌ Error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack
      })
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
