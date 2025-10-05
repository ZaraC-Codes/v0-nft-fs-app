"use client";

import { useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { Button } from "@/components/ui/button";
import { wrapNFT } from "@/lib/rental";
import { toast } from "sonner";
import { Package } from "lucide-react";
import { getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { apeChainCurtis, client } from "@/lib/thirdweb";

interface WrapNFTButtonProps {
  nftContract: string;
  tokenId: string;
  onSuccess?: () => void;
}

export function WrapNFTButton({ nftContract, tokenId, onSuccess }: WrapNFTButtonProps) {
  const account = useActiveAccount();
  const [isWrapping, setIsWrapping] = useState(false);

  const handleWrap = async () => {
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsWrapping(true);

    try {
      // Step 1: Approve RentalManager to transfer NFT
      const rentalManagerAddress = process.env.NEXT_PUBLIC_RENTAL_MANAGER_ADDRESS!;

      const nftContractInstance = getContract({
        client,
        chain: apeChainCurtis,
        address: nftContract,
      });

      console.log("📝 Approving RentalManager to transfer NFT...");
      const approveTx = prepareContractCall({
        contract: nftContractInstance,
        method: "function approve(address to, uint256 tokenId)",
        params: [rentalManagerAddress, BigInt(tokenId)],
      });

      await sendTransaction({
        transaction: approveTx,
        account,
      });

      console.log("✅ Approval successful");

      // Step 2: Wrap the NFT
      console.log("📦 Wrapping NFT for rental...");
      const result = await wrapNFT(account, nftContract, BigInt(tokenId));

      console.log("✅ NFT wrapped successfully:", result);

      toast.success("NFT wrapped successfully! You can now create a rental listing.");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error wrapping NFT:", error);
      toast.error(error.message || "Failed to wrap NFT");
    } finally {
      setIsWrapping(false);
    }
  };

  if (!account) {
    return (
      <Button disabled className="w-full">
        <Package className="h-4 w-4 mr-2" />
        Connect Wallet to Wrap
      </Button>
    );
  }

  return (
    <Button
      onClick={handleWrap}
      disabled={isWrapping}
      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
    >
      {isWrapping ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          Wrapping NFT...
        </>
      ) : (
        <>
          <Package className="h-4 w-4 mr-2" />
          Wrap for Rental
        </>
      )}
    </Button>
  );
}
