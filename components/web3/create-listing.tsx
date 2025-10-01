"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TransactionButton } from "thirdweb/react";
import { createDirectListing } from "@/lib/marketplace";
import { apeChainCurtis } from "@/lib/thirdweb";

export function CreateListing() {
  const [formData, setFormData] = useState({
    assetContract: "",
    tokenId: "",
    quantity: "1",
    pricePerToken: "",
    duration: "7", // days
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTimestamps = (durationDays: number) => {
    const now = Math.floor(Date.now() / 1000);
    const startTimestamp = BigInt(now);
    const endTimestamp = BigInt(now + (durationDays * 24 * 60 * 60));
    return { startTimestamp, endTimestamp };
  };

  const isFormValid = () => {
    return formData.assetContract &&
           formData.tokenId &&
           formData.quantity &&
           formData.pricePerToken &&
           formData.duration;
  };

  return (
    <Card className="max-w-2xl mx-auto bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Create NFT Listing
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assetContract">NFT Contract Address</Label>
              <Input
                id="assetContract"
                placeholder="0x..."
                value={formData.assetContract}
                onChange={(e) => handleInputChange("assetContract", e.target.value)}
                className="bg-background/50 border-border/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tokenId">Token ID</Label>
              <Input
                id="tokenId"
                type="number"
                placeholder="1"
                value={formData.tokenId}
                onChange={(e) => handleInputChange("tokenId", e.target.value)}
                className="bg-background/50 border-border/50"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                className="bg-background/50 border-border/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricePerToken">Price per Token (APE)</Label>
              <Input
                id="pricePerToken"
                type="number"
                step="0.0001"
                placeholder="0.1"
                value={formData.pricePerToken}
                onChange={(e) => handleInputChange("pricePerToken", e.target.value)}
                className="bg-background/50 border-border/50"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Listing Duration (days)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="365"
              placeholder="7"
              value={formData.duration}
              onChange={(e) => handleInputChange("duration", e.target.value)}
              className="bg-background/50 border-border/50"
              required
            />
          </div>

          <div className="bg-muted/20 p-4 rounded-lg border border-border/50">
            <h3 className="font-semibold mb-2">Listing Preview</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Token ID:</span>
                <span>{formData.tokenId || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity:</span>
                <span>{formData.quantity || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price per Token:</span>
                <span>{formData.pricePerToken ? `${formData.pricePerToken} APE` : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Value:</span>
                <span>
                  {formData.pricePerToken && formData.quantity
                    ? `${(parseFloat(formData.pricePerToken) * parseFloat(formData.quantity)).toFixed(4)} APE`
                    : "—"
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span>{formData.duration ? `${formData.duration} days` : "—"}</span>
              </div>
            </div>
          </div>

          {isFormValid() ? (
            <TransactionButton
              transaction={() => {
                const { startTimestamp, endTimestamp } = calculateTimestamps(parseInt(formData.duration));

                return createDirectListing({
                  assetContract: formData.assetContract,
                  tokenId: BigInt(formData.tokenId),
                  quantity: BigInt(formData.quantity),
                  currency: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // Native token (APE)
                  pricePerToken: BigInt(Math.floor(parseFloat(formData.pricePerToken) * 1e18)), // Convert to wei
                  startTimestamp,
                  endTimestamp,
                  reserved: false,
                });
              }}
              onTransactionConfirmed={() => {
                console.log("Listing created successfully!");
                // Reset form
                setFormData({
                  assetContract: "",
                  tokenId: "",
                  quantity: "1",
                  pricePerToken: "",
                  duration: "7",
                });
              }}
              onError={(error) => {
                console.error("Failed to create listing:", error);
              }}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 neon-glow"
            >
              Create Listing
            </TransactionButton>
          ) : (
            <Button disabled className="w-full">
              Fill all fields to create listing
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}