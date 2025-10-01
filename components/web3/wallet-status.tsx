"use client";

import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from "lucide-react";

export function WalletStatus() {
  const account = useActiveAccount();
  const chain = useActiveWalletChain();

  if (!account) {
    return null;
  }

  const isCorrectChain = chain?.id === 33111; // ApeChain Curtis testnet

  return (
    <div className="flex items-center gap-2 text-sm">
      <Badge variant={isCorrectChain ? "default" : "destructive"} className="flex items-center gap-1">
        {isCorrectChain ? (
          <CheckCircle className="h-3 w-3" />
        ) : (
          <AlertCircle className="h-3 w-3" />
        )}
        {isCorrectChain ? "ApeChain Curtis" : `Wrong Network (${chain?.name || "Unknown"})`}
      </Badge>

      <Badge variant="outline" className="font-mono text-xs">
        {account.address.slice(0, 6)}...{account.address.slice(-4)}
      </Badge>
    </div>
  );
}