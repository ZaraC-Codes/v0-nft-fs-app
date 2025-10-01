"use client";

import { ConnectButton } from "thirdweb/react";
import { client, apeChainCurtis } from "@/lib/thirdweb";
import { inAppWallet } from "thirdweb/wallets";
import { useActiveAccount } from "thirdweb/react";
import { ChevronDown } from "lucide-react";

// Embedded wallet for primary account creation
// External wallets are linked separately through Settings page
const embeddedWallet = inAppWallet({
  auth: {
    options: ["email", "google", "apple", "facebook", "x", "passkey"],
  },
  smartAccount: {
    chain: apeChainCurtis,
    sponsorGas: false,
  },
});

export function WalletConnect() {
  const account = useActiveAccount();

  if (account) {
    // When wallet is connected, show wallet address
    return (
      <ConnectButton
        client={client}
        chain={apeChainCurtis}
        wallets={[embeddedWallet]}
        connectButton={{ label: "Connect Wallet" }}
        detailsButton={{
          style: {
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            padding: "8px 16px",
            color: "hsl(var(--foreground))",
            fontWeight: "500",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease",
            minWidth: "160px",
            fontFamily: "monospace",
          },
          render: () => (
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono">
                {account.address.slice(0, 6)}...{account.address.slice(-4)}
              </span>
              <ChevronDown className="h-3 w-3" />
            </div>
          ),
        }}
        connectModal={{
          title: "Your Embedded Wallet",
          titleIcon: "",
          size: "compact",
          showThirdwebBranding: false,
        }}
        detailsModal={{
          footer: () => (
            <div className="text-xs text-muted-foreground text-center">
              To link external wallets (MetaMask, etc.), go to Settings
            </div>
          ),
        }}
        theme={{
          colors: {
            modalBg: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
            accentText: "hsl(var(--primary))",
            primaryText: "hsl(var(--foreground))",
            secondaryText: "hsl(var(--muted-foreground))",
            connectedButtonBg: "hsl(var(--card))",
            connectedButtonBgHover: "hsl(var(--accent))",
          },
        }}
      />
    );
  }

  // When wallet is not connected, show embedded wallet login/signup options only
  return (
    <ConnectButton
      client={client}
      chain={apeChainCurtis}
      wallets={[embeddedWallet]}
      connectButton={{
        label: "Sign In / Sign Up",
        style: {
          background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)",
          border: "1px solid hsl(var(--border))",
          borderRadius: "8px",
          padding: "8px 16px",
          color: "white",
          fontWeight: "500",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "all 0.2s ease",
          boxShadow: "0 0 20px hsl(var(--primary) / 0.3)",
        },
      }}
      connectModal={{
        title: "Sign In or Create Account",
        titleIcon: "",
        size: "compact",
        showThirdwebBranding: false,
      }}
      theme={{
        colors: {
          modalBg: "hsl(var(--background))",
          borderColor: "hsl(var(--border))",
          accentText: "hsl(var(--primary))",
          primaryText: "hsl(var(--foreground))",
          secondaryText: "hsl(var(--muted-foreground))",
          connectedButtonBg: "hsl(var(--card))",
          connectedButtonBgHover: "hsl(var(--accent))",
        },
      }}
    />
  );
}