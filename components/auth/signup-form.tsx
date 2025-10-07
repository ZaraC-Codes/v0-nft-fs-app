"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ConnectButton, useActiveAccount } from "thirdweb/react"
import { client, apeChain } from "@/lib/thirdweb"
import { inAppWallet } from "thirdweb/wallets"
import { Mail } from "lucide-react"

export function SignupForm() {
  const account = useActiveAccount()
  const router = useRouter()

  // Redirect to profile once wallet is connected
  useEffect(() => {
    if (account?.address) {
      console.log("✅ Embedded wallet created:", account.address)
      // Auth provider will auto-create profile, then redirect
      setTimeout(() => {
        router.push("/")
      }, 1000)
    }
  }, [account, router])

  const embeddedWallet = inAppWallet({
    auth: {
      options: ["email", "google", "apple", "facebook", "x", "passkey"],
    },
    smartAccount: {
      chain: apeChain,
      sponsorGas: false,
    },
  })

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-6">
        <p className="text-sm text-muted-foreground">
          Create your account using email or social login.
        </p>
        <p className="text-xs text-muted-foreground">
          You can link external wallets (MetaMask, etc.) after signup.
        </p>
      </div>

      <ConnectButton
        client={client}
        wallets={[embeddedWallet]}
        theme="dark"
        connectButton={{
          label: "Create Account",
          className: "w-full !bg-gradient-to-r !from-secondary !to-accent hover:!from-secondary/80 hover:!to-accent/80 !neon-glow !h-11",
        }}
        connectModal={{
          size: "compact",
          title: "Create Your Account",
          titleIcon: "",
          showThirdwebBranding: false,
        }}
      />

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Signup methods: Email • Google • Apple • Facebook • X (Twitter) • Passkey
        </p>
      </div>
    </div>
  )
}
