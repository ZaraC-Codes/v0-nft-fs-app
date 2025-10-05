"use client";

import { useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { rentNFT, calculateRentalCost, type RentalListing } from "@/lib/rental";
import { toast } from "sonner";
import { Calendar, DollarSign } from "lucide-react";
import { toEther } from "thirdweb";

interface RentNFTButtonProps {
  listing: RentalListing;
  onSuccess?: () => void;
}

export function RentNFTButton({ listing, onSuccess }: RentNFTButtonProps) {
  const account = useActiveAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [isRenting, setIsRenting] = useState(false);
  const [rentalDays, setRentalDays] = useState("");

  const rentalDaysNumber = parseInt(rentalDays) || 0;
  const costs = rentalDaysNumber > 0
    ? calculateRentalCost(listing.pricePerDay, BigInt(rentalDaysNumber))
    : null;

  const handleRent = async () => {
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }

    const days = parseInt(rentalDays);

    if (isNaN(days) || days < Number(listing.minRentalDays) || days > Number(listing.maxRentalDays)) {
      toast.error(`Rental duration must be between ${listing.minRentalDays} and ${listing.maxRentalDays} days`);
      return;
    }

    if (!costs) {
      toast.error("Invalid rental duration");
      return;
    }

    setIsRenting(true);

    try {
      console.log("🎫 Renting NFT...");
      console.log({
        wrapperId: listing.wrapperId.toString(),
        days,
        rentalCost: toEther(costs.rentalCost),
        platformFee: toEther(costs.platformFee),
        totalCost: toEther(costs.totalCost),
      });

      const result = await rentNFT(
        account,
        listing.wrapperId,
        BigInt(days),
        costs.totalCost
      );

      console.log("✅ NFT rented successfully:", result);

      toast.success(`NFT rented for ${days} day${days > 1 ? 's' : ''}! You now have delegation rights via Delegate.cash`);

      setIsOpen(false);
      setRentalDays("");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error renting NFT:", error);
      toast.error(error.message || "Failed to rent NFT");
    } finally {
      setIsRenting(false);
    }
  };

  if (!account) {
    return (
      <Button disabled className="w-full">
        Connect Wallet to Rent
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
          Rent NFT
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/95 border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">Rent NFT</DialogTitle>
          <DialogDescription>
            Choose your rental duration and pay to get delegation rights
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Pricing Info */}
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
            <p className="text-sm font-medium text-cyan-400 mb-2">Listing Details</p>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Price per day:</span>
                <span className="text-white">{toEther(listing.pricePerDay)} APE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Duration range:</span>
                <span className="text-white">
                  {listing.minRentalDays.toString()} - {listing.maxRentalDays.toString()} days
                </span>
              </div>
            </div>
          </div>

          {/* Rental Duration Input */}
          <div className="space-y-2">
            <Label htmlFor="rentalDays">
              <Calendar className="inline h-4 w-4 mr-1" />
              Rental Duration (days)
            </Label>
            <Input
              id="rentalDays"
              type="number"
              min={Number(listing.minRentalDays)}
              max={Number(listing.maxRentalDays)}
              value={rentalDays}
              onChange={(e) => setRentalDays(e.target.value)}
              placeholder={`${listing.minRentalDays} - ${listing.maxRentalDays}`}
              className="bg-black/60 border-cyan-500/50"
            />
          </div>

          {/* Cost Breakdown */}
          {costs && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <p className="text-sm font-medium text-purple-400 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Cost Breakdown
              </p>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Rental cost:</span>
                  <span className="text-white">{toEther(costs.rentalCost)} APE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Platform fee (2.5%):</span>
                  <span className="text-white">{toEther(costs.platformFee)} APE</span>
                </div>
                <div className="h-px bg-gray-700 my-2" />
                <div className="flex justify-between font-medium">
                  <span className="text-purple-400">Total:</span>
                  <span className="text-purple-400">{toEther(costs.totalCost)} APE</span>
                </div>
              </div>
            </div>
          )}

          {/* What You Get */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-xs text-blue-400 font-medium mb-2">✨ What you get:</p>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• Delegation rights via Delegate.cash</li>
              <li>• Access to token-gated content</li>
              <li>• Works with OpenSea, Premint, Guild.xyz, etc.</li>
              <li>• Zero collateral required</li>
              <li>• Automatic expiration after {rentalDays || "X"} day{rentalDaysNumber > 1 ? 's' : ''}</li>
            </ul>
          </div>

          {/* Rent Button */}
          <Button
            onClick={handleRent}
            disabled={isRenting || !rentalDays || rentalDaysNumber < Number(listing.minRentalDays) || rentalDaysNumber > Number(listing.maxRentalDays)}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            {isRenting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Renting NFT...
              </>
            ) : (
              <>Rent for {rentalDays || "X"} day{rentalDaysNumber > 1 ? 's' : ''}</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
