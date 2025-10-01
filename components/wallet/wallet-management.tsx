"use client"

import { useState } from "react"
import { useProfile } from "@/components/profile/profile-provider"
import { ProfileService } from "@/lib/profile-service"
import { useActiveAccount } from "thirdweb/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, Trash2, Star, Check, Plus } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function WalletManagement() {
  const { userProfile, refreshProfile } = useProfile()
  const account = useActiveAccount()
  const [walletToUnlink, setWalletToUnlink] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  if (!userProfile) return null

  const linkedWallets = ProfileService.getAllWallets(userProfile)
  const currentWalletAddress = account?.address

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const isPrimaryWallet = (address: string) => {
    return userProfile.walletAddress?.toLowerCase() === address.toLowerCase()
  }

  const isActiveWallet = (address: string) => {
    return userProfile.activeWallet?.toLowerCase() === address.toLowerCase()
  }

  const isCurrentWallet = (address: string) => {
    return currentWalletAddress?.toLowerCase() === address.toLowerCase()
  }

  const isWalletLinked = (address: string) => {
    return linkedWallets.some(w => w.toLowerCase() === address.toLowerCase())
  }

  const handleSetPrimary = async (walletAddress: string) => {
    setIsProcessing(true)
    try {
      await ProfileService.setPrimaryWallet(userProfile.id, walletAddress)
      await refreshProfile()
      toast.success("Primary wallet updated")
    } catch (error: any) {
      console.error("Failed to set primary wallet:", error)
      toast.error(error.message || "Failed to set primary wallet")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUnlink = async (walletAddress: string) => {
    setIsProcessing(true)
    try {
      await ProfileService.unlinkWallet(userProfile.id, walletAddress)
      await refreshProfile()
      toast.success("Wallet unlinked successfully")
      setWalletToUnlink(null)
    } catch (error: any) {
      console.error("Failed to unlink wallet:", error)
      toast.error(error.message || "Failed to unlink wallet")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleLinkCurrentWallet = async () => {
    if (!currentWalletAddress) {
      toast.error("No wallet connected")
      return
    }

    setIsProcessing(true)
    try {
      await ProfileService.linkAdditionalWallet(userProfile.id, currentWalletAddress)
      await refreshProfile()
      toast.success("Wallet linked successfully!")
    } catch (error: any) {
      console.error("Failed to link wallet:", error)
      toast.error(error.message || "Failed to link wallet")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Management</CardTitle>
        <CardDescription>
          Manage your connected wallets. Your primary wallet is displayed on your profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Linked Wallets */}
        <div className="space-y-3">
          {linkedWallets.map((wallet) => (
            <div
              key={wallet}
              className="flex items-center justify-between p-4 rounded-lg border bg-card/50"
            >
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{formatWalletAddress(wallet)}</span>
                    {isPrimaryWallet(wallet) && (
                      <Badge variant="default" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Primary
                      </Badge>
                    )}
                    {isActiveWallet(wallet) && (
                      <Badge variant="secondary" className="text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                    {isCurrentWallet(wallet) && (
                      <Badge variant="outline" className="text-xs">
                        Connected
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isPrimaryWallet(wallet) && "Displayed on your profile"}
                    {!isPrimaryWallet(wallet) && isActiveWallet(wallet) && "Used for transactions"}
                    {!isPrimaryWallet(wallet) && !isActiveWallet(wallet) && "Linked wallet"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isPrimaryWallet(wallet) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetPrimary(wallet)}
                    disabled={isProcessing}
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Set Primary
                  </Button>
                )}
                {linkedWallets.length > 1 && !isPrimaryWallet(wallet) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setWalletToUnlink(wallet)}
                    disabled={isProcessing}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Link Current Wallet Button */}
        {currentWalletAddress && !isWalletLinked(currentWalletAddress) && (
          <div className="pt-4 border-t">
            <Button
              onClick={handleLinkCurrentWallet}
              disabled={isProcessing}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Link Currently Connected Wallet
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              {formatWalletAddress(currentWalletAddress)} is connected but not linked to your profile
            </p>
          </div>
        )}

        {/* Info */}
        <div className="text-sm text-muted-foreground space-y-1 pt-4 border-t">
          <p>• <strong>Primary wallet</strong>: Displayed on your profile page</p>
          <p>• <strong>Active wallet</strong>: Used for marketplace transactions</p>
          <p>• <strong>All linked wallets</strong>: NFTs from all wallets shown in portfolio</p>
        </div>
      </CardContent>

      {/* Unlink Confirmation Dialog */}
      <AlertDialog open={!!walletToUnlink} onOpenChange={() => setWalletToUnlink(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlink Wallet?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unlink {walletToUnlink && formatWalletAddress(walletToUnlink)}?
              <br /><br />
              You can always link it again later by connecting it and clicking "Link Current Wallet".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => walletToUnlink && handleUnlink(walletToUnlink)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Unlink Wallet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
