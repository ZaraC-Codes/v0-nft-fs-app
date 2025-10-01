"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useActiveAccount } from "thirdweb/react"
import { useProfile } from "@/components/profile/profile-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Check } from "lucide-react"
import { toast } from "sonner"

interface WalletSwitcherContextType {
  selectedWalletAddress: string | null
  setSelectedWallet: (address: string) => void
  availableWallets: Array<{ address: string; name: string; isPrimary: boolean }>
}

const WalletSwitcherContext = createContext<WalletSwitcherContextType | undefined>(undefined)

export function WalletSwitcherProvider({ children }: { children: ReactNode }) {
  const account = useActiveAccount()
  const { userProfile } = useProfile()
  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string | null>(null)

  // Get all available wallets from profile
  const availableWallets = userProfile
    ? [
        {
          address: userProfile.walletAddress!,
          name: "Embedded Wallet",
          isPrimary: true,
        },
        ...(userProfile.linkedWallets || []).map((addr) => ({
          address: addr,
          name: "MetaMask", // We'll detect the actual wallet type later
          isPrimary: false,
        })),
      ]
    : []

  // Initialize selected wallet to embedded wallet (primary)
  useEffect(() => {
    if (account?.address && !selectedWalletAddress) {
      setSelectedWalletAddress(account.address)
    }
  }, [account?.address, selectedWalletAddress])

  const setSelectedWallet = (address: string) => {
    setSelectedWalletAddress(address)
    const wallet = availableWallets.find((w) => w.address === address)
    if (wallet) {
      toast.success(`Switched to ${wallet.name}`)
    }
  }

  return (
    <WalletSwitcherContext.Provider
      value={{
        selectedWalletAddress,
        setSelectedWallet,
        availableWallets,
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
  const { selectedWalletAddress, setSelectedWallet, availableWallets } = useWalletSwitcher()

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

          <div className="space-y-2">
            {availableWallets.map((wallet) => {
              const isSelected = wallet.address === selectedWalletAddress
              return (
                <Button
                  key={wallet.address}
                  onClick={() => setSelectedWallet(wallet.address)}
                  variant={isSelected ? "default" : "outline"}
                  className={`w-full justify-between ${
                    isSelected
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
                  {isSelected && <Check className="h-4 w-4" />}
                </Button>
              )
            })}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-3">
            Transactions will be signed with the selected wallet
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
