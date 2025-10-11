import { useActiveAccount } from "thirdweb/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export interface UseRequireWalletOptions {
  /** Redirect to this path if wallet is not connected */
  redirectTo?: string

  /** Whether to redirect if wallet is not connected */
  redirect?: boolean

  /** Callback when wallet is not connected */
  onNoWallet?: () => void
}

/**
 * useRequireWallet - Custom hook to require wallet connection
 *
 * Centralized wallet requirement logic to replace duplicate checks across components.
 *
 * @example
 * ```tsx
 * // Basic usage - returns null if no wallet
 * const account = useRequireWallet()
 * if (!account) return null
 *
 * // With redirect
 * const account = useRequireWallet({ redirectTo: "/" })
 *
 * // With callback
 * const account = useRequireWallet({
 *   onNoWallet: () => toast({ title: "Connect wallet" })
 * })
 * ```
 */
export function useRequireWallet(options: UseRequireWalletOptions = {}) {
  const account = useActiveAccount()
  const router = useRouter()

  const { redirectTo, redirect = false, onNoWallet } = options

  useEffect(() => {
    if (!account) {
      // Execute callback if provided
      if (onNoWallet) {
        onNoWallet()
      }

      // Redirect if requested
      if (redirect && redirectTo) {
        router.push(redirectTo)
      }
    }
  }, [account, redirect, redirectTo, onNoWallet, router])

  return account
}

/**
 * useWalletAddress - Get connected wallet address (or null)
 *
 * Convenience hook for when you just need the address.
 *
 * @example
 * ```tsx
 * const address = useWalletAddress()
 * if (!address) return <ConnectWalletPrompt />
 * ```
 */
export function useWalletAddress(): string | null {
  const account = useActiveAccount()
  return account?.address ?? null
}

/**
 * useIsWalletConnected - Check if wallet is connected
 *
 * Boolean convenience hook.
 *
 * @example
 * ```tsx
 * const isConnected = useIsWalletConnected()
 * return isConnected ? <Dashboard /> : <Landing />
 * ```
 */
export function useIsWalletConnected(): boolean {
  const account = useActiveAccount()
  return !!account
}
