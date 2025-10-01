"use client"

import { useState } from "react"
import { useProfile } from "@/components/profile/profile-provider"
import { ProfileService } from "@/lib/profile-service"
import { useActiveAccount } from "thirdweb/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronDown, Wallet, Plus } from "lucide-react"
import { toast } from "sonner"

export function WalletSwitcher() {
  const { userProfile, refreshProfile } = useProfile()
  const account = useActiveAccount()
  const [isLinking, setIsLinking] = useState(false)

  if (!userProfile) return null

  const linkedWallets = ProfileService.getAllWallets(userProfile)
  const activeWallet = userProfile.activeWallet || userProfile.walletAddress
  const currentWalletAddress = account?.address

  const handleSwitchWallet = async (walletAddress: string) => {
    try {
      await ProfileService.setActiveWallet(userProfile.id, walletAddress)
      await refreshProfile()
      toast.success(`Switched to ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`)
    } catch (error) {
      console.error("Failed to switch wallet:", error)
      toast.error("Failed to switch wallet")
    }
  }

  const handleLinkCurrentWallet = async () => {
    if (!currentWalletAddress) {
      toast.error("No wallet connected")
      return
    }

    setIsLinking(true)
    try {
      await ProfileService.linkAdditionalWallet(userProfile.id, currentWalletAddress)
      await refreshProfile()
      toast.success("Wallet linked successfully!")
    } catch (error: any) {
      console.error("Failed to link wallet:", error)
      toast.error(error.message || "Failed to link wallet")
    } finally {
      setIsLinking(false)
    }
  }

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const isWalletLinked = (address: string) => {
    return linkedWallets.some(w => w.toLowerCase() === address.toLowerCase())
  }

  const isPrimaryWallet = (address: string) => {
    return userProfile.walletAddress?.toLowerCase() === address.toLowerCase()
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Wallet className="h-4 w-4" />
            <span className="font-mono text-sm">
              {activeWallet ? formatWalletAddress(activeWallet) : "No Wallet"}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Your Wallets</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {linkedWallets.map((wallet) => (
            <DropdownMenuItem
              key={wallet}
              onClick={() => handleSwitchWallet(wallet)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="font-mono text-sm">{formatWalletAddress(wallet)}</span>
                {isPrimaryWallet(wallet) && (
                  <Badge variant="secondary" className="w-fit text-xs mt-1">
                    Primary
                  </Badge>
                )}
              </div>
              {activeWallet?.toLowerCase() === wallet.toLowerCase() && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}

          {currentWalletAddress && !isWalletLinked(currentWalletAddress) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLinkCurrentWallet}
                disabled={isLinking}
                className="cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Link Current Wallet
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
