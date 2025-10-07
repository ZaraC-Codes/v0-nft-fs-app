"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TransactionButton, useActiveAccount, useSwitchActiveWalletChain } from "thirdweb/react";
import { buyFromListing } from "@/lib/marketplace";
import { apeChain, apeChain, sepolia, CHAIN_METADATA } from "@/lib/thirdweb";
import { calculateTotalWithFee, formatFeePercentage } from "@/lib/platform-fees";
import type { Chain } from "thirdweb/chains";

interface Listing {
  listingId: bigint;
  tokenId: bigint;
  quantity: bigint;
  pricePerToken: bigint;
  startTimestamp: bigint;
  endTimestamp: bigint;
  listingCreator: string;
  assetContract: string;
  currency: string;
  tokenType: number;
  status: number;
  reserved: boolean;
}

interface NFTMetadata {
  name: string;
  description?: string;
  image: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
}

interface MarketplaceListingProps {
  listing: Listing;
  metadata?: NFTMetadata;
  chain?: Chain; // Optional chain - defaults to Curtis
}

export function MarketplaceListing({ listing, metadata, chain = apeChain }: MarketplaceListingProps) {
  const [quantity, setQuantity] = useState(1n);
  const account = useActiveAccount();
  const switchChain = useSwitchActiveWalletChain();

  // Auto-switch to the correct chain when component mounts
  useEffect(() => {
    if (!account) return;

    const autoSwitchNetwork = async () => {
      try {
        await switchChain(chain);
        console.log(`✅ Switched to ${chain.name} for marketplace`);
      } catch (error) {
        console.log("ℹ️ Network switch cancelled or failed:", error);
        // User cancelled or switch failed - TransactionButton will handle it
      }
    };

    autoSwitchNetwork();
  }, [account, switchChain, chain]);

  const formatPrice = (price: bigint) => {
    return (Number(price) / 1e18).toFixed(4);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isActive = listing.status === 1; // Assuming 1 is ACTIVE status
  const isExpired = Number(listing.endTimestamp) < Date.now() / 1000;
  const chainMetadata = CHAIN_METADATA[chain.id];
  const nativeToken = chainMetadata.nativeToken;

  return (
    <Card className="overflow-hidden bg-card/50 border-border/50">
      <div className="aspect-square relative overflow-hidden">
        {metadata?.image ? (
          <img
            src={metadata.image}
            alt={metadata.name || `Token #${listing.tokenId}`}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <span className="text-2xl font-bold text-muted-foreground">
              #{listing.tokenId.toString()}
            </span>
          </div>
        )}

        {/* Chain Badge */}
        <Badge className={`absolute top-2 left-2 bg-gradient-to-r ${chainMetadata.color} text-white border-0 flex items-center gap-1`}>
          <img src={chainMetadata.icon} alt={chainMetadata.name} className="w-3 h-3" />
          {chainMetadata.shortName}
        </Badge>

        {listing.reserved && (
          <Badge className="absolute top-2 right-2 bg-yellow-500/90">
            Reserved
          </Badge>
        )}

        {!isActive && (
          <Badge className="absolute top-2 right-2 bg-destructive/90">
            {isExpired ? "Expired" : "Inactive"}
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2">
          {metadata?.name || `Token #${listing.tokenId}`}
        </h3>

        {metadata?.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {metadata.description}
          </p>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-medium">
              {formatPrice(listing.pricePerToken)} {nativeToken}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Quantity:</span>
            <span>{listing.quantity.toString()}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Seller:</span>
            <span className="font-mono text-xs">
              {formatAddress(listing.listingCreator)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Expires:</span>
            <span className="text-xs">
              {new Date(Number(listing.endTimestamp) * 1000).toLocaleDateString()}
            </span>
          </div>
        </div>

        {metadata?.attributes && metadata.attributes.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium mb-2">Attributes:</h4>
            <div className="flex flex-wrap gap-1">
              {metadata.attributes.slice(0, 3).map((attr, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {attr.trait_type}: {attr.value}
                </Badge>
              ))}
              {metadata.attributes.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{metadata.attributes.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex-col space-y-3">
        {isActive && !isExpired && account ? (
          <>
            {/* Price Breakdown */}
            <div className="w-full bg-muted/20 rounded-lg p-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Item Price:</span>
                <span>{formatPrice(listing.pricePerToken * quantity)} {nativeToken}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee ({formatFeePercentage("BUY")}):</span>
                <span>{formatPrice(calculateTotalWithFee(listing.pricePerToken * quantity, "BUY").platformFee)} {nativeToken}</span>
              </div>
              <div className="border-t border-border/50 pt-1 flex justify-between font-semibold">
                <span>Total:</span>
                <span className="text-primary">{formatPrice(calculateTotalWithFee(listing.pricePerToken * quantity, "BUY").totalPrice)} {nativeToken}</span>
              </div>
            </div>

            <TransactionButton
              transaction={() =>
                buyFromListing({
                  listingId: listing.listingId,
                  quantityToBuy: quantity,
                  buyFor: account.address,
                  currency: listing.currency,
                  pricePerToken: listing.pricePerToken,
                })
              }
              onTransactionConfirmed={() => {
                console.log("Purchase successful!");
              }}
              onError={(error) => {
                console.error("Purchase failed:", error);
              }}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
            >
              Buy for {formatPrice(calculateTotalWithFee(listing.pricePerToken * quantity, "BUY").totalPrice)} {nativeToken}
            </TransactionButton>
          </>
        ) : (
          <Button disabled className="w-full">
            {!account ? "Connect Wallet" : isExpired ? "Listing Expired" : "Not Available"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}