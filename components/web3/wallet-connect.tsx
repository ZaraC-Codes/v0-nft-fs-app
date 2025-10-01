"use client";

import { ConnectButton } from "thirdweb/react";
import { client, apeChainCurtis } from "@/lib/thirdweb";
import { createWallet } from "thirdweb/wallets";
import { useActiveAccount } from "thirdweb/react";
import { Badge } from "@/components/ui/badge";
import { Wallet, ChevronDown } from "lucide-react";

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.zerion.wallet"),
];

export function WalletConnect() {
  const account = useActiveAccount();

  if (account) {
    // When wallet is connected, show a custom button with address
    return (
      <ConnectButton
        client={client}
        chain={apeChainCurtis}
        wallets={wallets}
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
          title: "Connect to ApeChain NFT Marketplace",
          titleIcon: "/logo.png",
          size: "wide",
        }}
        detailsModal={{
          footer: () => (
            <div className="text-xs text-muted-foreground text-center">
              Connected to ApeChain Curtis Testnet
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

  // When wallet is not connected, show connect button
  return (
    <ConnectButton
      client={client}
      chain={apeChainCurtis}
      wallets={wallets}
      connectButton={{
        label: "Connect Wallet",
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
        title: "Connect to ApeChain NFT Marketplace",
        titleIcon: "/logo.png",
        size: "wide",
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