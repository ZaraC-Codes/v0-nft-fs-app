"use client";

import { useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createRentalListing } from "@/lib/rental";
import { toast } from "sonner";
import { DollarSign, Calendar } from "lucide-react";
import { toWei } from "thirdweb";

interface CreateRentalListingProps {
  wrapperId: string;
  onSuccess?: () => void;
}

export function CreateRentalListing({ wrapperId, onSuccess }: CreateRentalListingProps) {
  const account = useActiveAccount();
  const [isCreating, setIsCreating] = useState(false);

  const [pricePerDay, setPricePerDay] = useState("");
  const [minDays, setMinDays] = useState("");
  const [maxDays, setMaxDays] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }

    // Validation
    const priceValue = parseFloat(pricePerDay);
    const minValue = parseInt(minDays);
    const maxValue = parseInt(maxDays);

    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error("Please enter a valid price per day");
      return;
    }

    if (isNaN(minValue) || minValue < 1) {
      toast.error("Minimum rental duration must be at least 1 day");
      return;
    }

    if (isNaN(maxValue) || maxValue < minValue) {
      toast.error("Maximum rental duration must be greater than or equal to minimum");
      return;
    }

    setIsCreating(true);

    try {
      console.log("📝 Creating rental listing...");
      console.log({
        wrapperId,
        pricePerDay: `${priceValue} APE`,
        minDays: minValue,
        maxDays: maxValue,
      });

      const result = await createRentalListing(
        account,
        BigInt(wrapperId),
        toWei(pricePerDay), // Convert APE to wei
        BigInt(minValue),
        BigInt(maxValue)
      );

      console.log("✅ Rental listing created:", result);

      toast.success("Rental listing created successfully!");

      // Reset form
      setPricePerDay("");
      setMinDays("");
      setMaxDays("");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error creating rental listing:", error);
      toast.error(error.message || "Failed to create rental listing");
    } finally {
      setIsCreating(false);
    }
  };

  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create Rental Listing</CardTitle>
          <CardDescription>Connect your wallet to create a rental listing</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 border-cyan-500/30">
      <CardHeader>
        <CardTitle className="text-cyan-400">Create Rental Listing</CardTitle>
        <CardDescription>Set your rental price and duration</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Price Per Day */}
          <div className="space-y-2">
            <Label htmlFor="pricePerDay" className="text-sm font-medium">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Price Per Day (APE)
            </Label>
            <Input
              id="pricePerDay"
              type="number"
              step="0.001"
              min="0.001"
              value={pricePerDay}
              onChange={(e) => setPricePerDay(e.target.value)}
              placeholder="0.1"
              required
              className="bg-black/60 border-cyan-500/50"
            />
            <p className="text-xs text-gray-400">
              Renters will pay this amount per day + 2.5% platform fee
            </p>
          </div>

          {/* Rental Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minDays" className="text-sm font-medium">
                <Calendar className="inline h-4 w-4 mr-1" />
                Min Days
              </Label>
              <Input
                id="minDays"
                type="number"
                min="1"
                value={minDays}
                onChange={(e) => setMinDays(e.target.value)}
                placeholder="1"
                required
                className="bg-black/60 border-cyan-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxDays" className="text-sm font-medium">
                <Calendar className="inline h-4 w-4 mr-1" />
                Max Days
              </Label>
              <Input
                id="maxDays"
                type="number"
                min="1"
                value={maxDays}
                onChange={(e) => setMaxDays(e.target.value)}
                placeholder="30"
                required
                className="bg-black/60 border-cyan-500/50"
              />
            </div>
          </div>

          {/* Price Preview */}
          {pricePerDay && minDays && maxDays && (
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-cyan-400">Price Preview</p>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Min Rental ({minDays} day{parseInt(minDays) > 1 ? 's' : ''}):</span>
                  <span className="text-white">{(parseFloat(pricePerDay) * parseInt(minDays)).toFixed(4)} APE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Rental ({maxDays} day{parseInt(maxDays) > 1 ? 's' : ''}):</span>
                  <span className="text-white">{(parseFloat(pricePerDay) * parseInt(maxDays)).toFixed(4)} APE</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>+ 2.5% platform fee</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isCreating || !pricePerDay || !minDays || !maxDays}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Creating Listing...
              </>
            ) : (
              "Create Rental Listing"
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Your NFT will be wrapped and available for rent with zero collateral using Delegate.cash
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
