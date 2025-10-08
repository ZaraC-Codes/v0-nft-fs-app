import { useActiveAccount } from "thirdweb/react"
import { useProfile } from "@/components/profile/profile-provider"
import { useWalletSwitcher } from "@/components/wallet/wallet-switcher"
import { useEffect, useState } from "react"

/**
 * Hook to ensure profile wallet (embedded) is active for gasless transactions
 * Automatically switches to profile wallet if user is on a different wallet
 */
export function useGaslessWallet() {
  const account = useActiveAccount()
  const { userProfile } = useProfile()
  const { switchWallet, isSwitching } = useWalletSwitcher()
  const [isReady, setIsReady] = useState(false)

  // Get the profile wallet (embedded wallet with gasless capabilities)
  const profileWallet = userProfile?.wallets?.find(w => w.type === 'embedded')

  // Check if currently connected wallet is the profile wallet
  const isUsingProfileWallet = profileWallet && account?.address?.toLowerCase() === profileWallet.address.toLowerCase()

  /**
   * Ensure profile wallet is active
   * Call this before sending gasless transactions
   */
  const ensureProfileWallet = async () => {
    if (!profileWallet) {
      throw new Error("No profile wallet found. Please create a profile wallet for gasless transactions.")
    }

    if (isUsingProfileWallet) {
      setIsReady(true)
      return true
    }

    // Need to switch to profile wallet
    console.log("🔄 Switching to profile wallet for gasless transaction...")
    await switchWallet(profileWallet.address)
    setIsReady(true)
    return true
  }

  // Auto-detect if we're ready (already on profile wallet)
  useEffect(() => {
    if (isUsingProfileWallet) {
      setIsReady(true)
    }
  }, [isUsingProfileWallet])

  return {
    profileWallet,
    isUsingProfileWallet,
    ensureProfileWallet,
    isSwitching,
    isReady: isReady && isUsingProfileWallet,
    account: isUsingProfileWallet ? account : null, // Only return account if on profile wallet
  }
}
