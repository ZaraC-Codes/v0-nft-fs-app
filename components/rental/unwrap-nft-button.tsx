"use client";

import { useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { Button } from "@/components/ui/button";
import { unwrapNFT } from "@/lib/rental";
import { toast } from "sonner";
import { PackageOpen } from "lucide-react";

interface UnwrapNFTButtonProps {
  wrapperId: string;
  isCurrentlyRented?: boolean;
  onSuccess?: () => void;
}

export function UnwrapNFTButton({ wrapperId, isCurrentlyRented = false, onSuccess }: UnwrapNFTButtonProps) {
  const account = useActiveAccount();
  const [isUnwrapping, setIsUnwrapping] = useState(false);

  const handleUnwrap = async () => {
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }

    if (isCurrentlyRented) {
      toast.error("Cannot unwrap while NFT is rented. Please wait for rental to expire.");
      return;
    }

    setIsUnwrapping(true);

    try {
      console.log("📦 Unwrapping NFT...");

      const result = await unwrapNFT(account, BigInt(wrapperId));

      console.log("✅ NFT unwrapped successfully:", result);

      toast.success("NFT unwrapped successfully! Original NFT returned to your wallet.");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error unwrapping NFT:", error);
      toast.error(error.message || "Failed to unwrap NFT");
    } finally {
      setIsUnwrapping(false);
    }
  };

  if (!account) {
    return (
      <Button disabled variant="outline" className="w-full">
        <PackageOpen className="h-4 w-4 mr-2" />
        Connect Wallet to Unwrap
      </Button>
    );
  }

  return (
    <Button
      onClick={handleUnwrap}
      disabled={isUnwrapping || isCurrentlyRented}
      variant="outline"
      className="w-full border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
    >
      {isUnwrapping ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-400 mr-2" />
          Unwrapping...
        </>
      ) : (
        <>
          <PackageOpen className="h-4 w-4 mr-2" />
          {isCurrentlyRented ? "Currently Rented" : "Unwrap NFT"}
        </>
      )}
    </Button>
  );
}
