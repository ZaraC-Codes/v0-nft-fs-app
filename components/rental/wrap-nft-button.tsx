"use client";

import { useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { Button } from "@/components/ui/button";
import { wrapNFT, getLatestWrapperIdForUser } from "@/lib/rental";
import { useToast } from "@/components/ui/use-toast";
import { Package } from "lucide-react";
import { getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { apeChain, client } from "@/lib/thirdweb";
import { ensureCorrectNetwork } from "@/lib/network-utils";

interface WrapNFTButtonProps {
  nftContract: string;
  tokenId: string;
  onSuccess?: (wrapperId: string) => void;
  buttonText?: string;
}

export function WrapNFTButton({ nftContract, tokenId, onSuccess, buttonText = "Wrap for Rental" }: WrapNFTButtonProps) {
  const account = useActiveAccount();
  const { toast } = useToast();
  const [isWrapping, setIsWrapping] = useState(false);

  const handleWrap = async () => {
    if (!account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to wrap NFTs for rental.",
        variant: "destructive"
      });
      return;
    }

    setIsWrapping(true);

    try {
      // Step 0: Ensure user is on the correct network (ApeChain mainnet)
      console.log("🔍 Checking network...");
      const networkCorrect = await ensureCorrectNetwork(apeChain.id);

      if (!networkCorrect) {
        toast({
          title: "Network Switch Required",
          description: "Please switch to ApeChain mainnet in your wallet to wrap NFTs for rental.",
          variant: "destructive",
        });
        setIsWrapping(false);
        return;
      }

      // Step 1: Approve RentalManager to transfer NFT
      const rentalManagerAddress = process.env.NEXT_PUBLIC_RENTAL_MANAGER_ADDRESS!;

      const nftContractInstance = getContract({
        client,
        chain: apeChain,
        address: nftContract,
      });

      console.log("📝 Approving RentalManager to transfer NFT...");
      console.log("NFT Contract:", nftContract);
      console.log("Token ID:", tokenId);
      console.log("RentalManager Address:", rentalManagerAddress);

      const approveTx = prepareContractCall({
        contract: nftContractInstance,
        method: "function approve(address to, uint256 tokenId)",
        params: [rentalManagerAddress, BigInt(tokenId)],
      });

      try {
        const approvalResult = await sendTransaction({
          transaction: approveTx,
          account,
        });
        console.log("✅ Approval successful. TX Hash:", approvalResult.transactionHash);
      } catch (approvalError: any) {
        console.error("❌ Approval failed:", approvalError);
        throw new Error(`Failed to approve NFT transfer: ${approvalError.message || 'Unknown error'}`);
      }

      // Step 2: Wrap the NFT
      console.log("📦 Wrapping NFT for rental...");
      let txResult;
      try {
        txResult = await wrapNFT(account, nftContract, BigInt(tokenId));
        console.log("✅ NFT wrapped successfully. TX Hash:", txResult.transactionHash);
      } catch (wrapError: any) {
        console.error("❌ Wrapping failed:", wrapError);
        throw new Error(`Failed to wrap NFT: ${wrapError.message || 'Unknown error'}`);
      }

      // Step 3: Get latest wrapper ID owned by user (workaround for Curtis testnet)
      console.log("🔍 Finding latest wrapper ID for user...");
      const wrapperId = await getLatestWrapperIdForUser(account.address);
      console.log("🎁 Wrapper ID:", wrapperId.toString());

      // Don't show toast if buttonText is "List for Rent" (modal will show form instead)
      if (buttonText === "Wrap for Rental") {
        toast({
          title: "NFT Wrapped Successfully!",
          description: `Wrapper NFT #${wrapperId} created. Your NFT is now ready for rental.`,
        });
      }

      if (onSuccess) {
        onSuccess(wrapperId.toString());
      }
    } catch (error: any) {
      console.error("Error wrapping NFT:", error);
      toast({
        title: "Wrap Failed",
        description: error.message || "Failed to wrap NFT for rental.",
        variant: "destructive"
      });
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
          {buttonText}
        </>
      )}
    </Button>
  );
}
