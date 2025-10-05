"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RentNFTButton } from "@/components/rental/rent-nft-button";
import { getActiveRentalListings, getOriginalNFT, type RentalListing, type WrappedNFT } from "@/lib/rental";
import { fromWei } from "thirdweb";
import { Calendar, DollarSign, Package } from "lucide-react";

interface RentalListingWithNFT {
  listing: RentalListing;
  nft: WrappedNFT | null;
}

export default function RentalsPage() {
  const [listings, setListings] = useState<RentalListingWithNFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      console.log("📋 Loading active rental listings...");
      const activeListings = await getActiveRentalListings();
      console.log(`Found ${activeListings.length} active listings`);

      // Fetch NFT details for each listing
      const listingsWithNFT = await Promise.all(
        activeListings.map(async (listing) => {
          try {
            const nft = await getOriginalNFT(listing.wrapperId);
            return { listing, nft };
          } catch (error) {
            console.error(`Failed to fetch NFT for wrapper ${listing.wrapperId}:`, error);
            return { listing, nft: null };
          }
        })
      );

      setListings(listingsWithNFT);
    } catch (error) {
      console.error("Error loading rental listings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Cyber Grid Background */}
      <div className="cyber-grid" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold neon-text mb-2">NFT Rentals</h1>
          <p className="text-gray-400">
            Zero collateral rentals powered by Delegate.cash. Rent NFTs to access token-gated content.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && listings.length === 0 && (
          <Card className="bg-black/40 border-cyan-500/30">
            <CardContent className="py-12 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <p className="text-xl text-gray-400 mb-2">No rental listings yet</p>
              <p className="text-sm text-gray-500">
                Be the first to wrap and list your NFT for rental!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Rental Listings Grid */}
        {!isLoading && listings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(({ listing, nft }) => (
              <Card key={listing.wrapperId.toString()} className="glass-card border-cyan-500/30 hover:border-cyan-500/60 transition-all">
                <CardHeader>
                  <CardTitle className="text-cyan-400">
                    Wrapper #{listing.wrapperId.toString()}
                  </CardTitle>
                  <CardDescription>
                    {nft ? (
                      <>Original: {nft.originalContract.slice(0, 6)}...{nft.originalContract.slice(-4)} #{nft.originalTokenId.toString()}</>
                    ) : (
                      "Loading NFT details..."
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Pricing */}
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">
                        <DollarSign className="inline h-4 w-4" />
                        Price per day
                      </span>
                      <span className="text-lg font-bold text-purple-400">
                        {fromWei(listing.pricePerDay)} APE
                      </span>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        <Calendar className="inline h-4 w-4" />
                        Duration
                      </span>
                      <span className="text-sm font-medium text-blue-400">
                        {listing.minRentalDays.toString()} - {listing.maxRentalDays.toString()} days
                      </span>
                    </div>
                  </div>

                  {/* Owner */}
                  <div className="text-xs text-gray-500">
                    Owner: {listing.owner.slice(0, 6)}...{listing.owner.slice(-4)}
                  </div>

                  {/* Rent Button */}
                  <RentNFTButton listing={listing} onSuccess={loadListings} />

                  {/* Features */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>✅ Zero collateral</p>
                    <p>✅ Delegate.cash integration</p>
                    <p>✅ Token-gate access</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-400">How it Works</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-300 space-y-2">
              <p>1. Browse available rental listings</p>
              <p>2. Choose your rental duration</p>
              <p>3. Pay the rental fee (no collateral!)</p>
              <p>4. Get delegation rights via Delegate.cash</p>
              <p>5. Access token-gated content</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-blue-400">What You Get</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-300 space-y-2">
              <p>✅ Full delegation rights</p>
              <p>✅ Token-gated access</p>
              <p>✅ Works with major platforms</p>
              <p>✅ Zero collateral required</p>
              <p>✅ Auto-expiring rentals</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-green-400">Supported Platforms</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-300 space-y-2">
              <p>🟢 OpenSea</p>
              <p>🟢 Premint.xyz</p>
              <p>🟢 Guild.xyz</p>
              <p>🟢 Snapshot</p>
              <p>🟢 And more...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
