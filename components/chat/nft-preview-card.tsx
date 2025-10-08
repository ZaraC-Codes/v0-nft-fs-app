"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, ExternalLink } from "lucide-react"
import { getContract, readContract } from "thirdweb"
import { client, apeChain } from "@/lib/thirdweb"

interface NFTPreviewCardProps {
  contractAddress: string
  tokenId: string
}

interface NFTMetadata {
  name: string
  image: string
  description?: string
  attributes?: Array<{ trait_type: string; value: string }>
}

/**
 * NFT preview card that shows on hover over NFT references
 * Displays NFT image, name, and basic info
 */
export function NFTPreviewCard({ contractAddress, tokenId }: NFTPreviewCardProps) {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    loadNFTMetadata()
  }, [contractAddress, tokenId])

  const loadNFTMetadata = async () => {
    try {
      setLoading(true)
      setError(false)

      const contract = getContract({
        client,
        chain: apeChain,
        address: contractAddress,
      })

      // Fetch token URI
      const tokenURI = await readContract({
        contract,
        method: "function tokenURI(uint256 tokenId) view returns (string)",
        params: [BigInt(tokenId)],
      })

      if (!tokenURI) {
        throw new Error("No token URI")
      }

      // Fetch metadata
      const metadataUrl = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/')
      const response = await fetch(metadataUrl)

      if (!response.ok) {
        throw new Error("Failed to fetch metadata")
      }

      const data = await response.json()

      setMetadata({
        name: data.name || `Token #${tokenId}`,
        image: data.image ? data.image.replace('ipfs://', 'https://ipfs.io/ipfs/') : '',
        description: data.description,
        attributes: data.attributes
      })
    } catch (err) {
      console.error("Error loading NFT metadata:", err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="w-64 shadow-xl border-primary/20">
        <CardContent className="p-3">
          <div className="aspect-square bg-muted/50 rounded-lg animate-pulse mb-2" />
          <div className="h-4 bg-muted/50 rounded animate-pulse mb-1" />
          <div className="h-3 bg-muted/50 rounded animate-pulse w-2/3" />
        </CardContent>
      </Card>
    )
  }

  if (error || !metadata) {
    return (
      <Card className="w-64 shadow-xl border-destructive/20">
        <CardContent className="p-3">
          <div className="aspect-square bg-muted/30 rounded-lg flex items-center justify-center mb-2">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Failed to load NFT
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-64 shadow-xl border-primary/20 bg-card/95 backdrop-blur-md">
      <CardContent className="p-0">
        {/* NFT Image */}
        <div className="aspect-square bg-muted/30 rounded-t-lg overflow-hidden">
          {metadata.image ? (
            <img
              src={metadata.image}
              alt={metadata.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* NFT Info */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-sm truncate flex-1">
              {metadata.name}
            </h4>
            <Badge variant="outline" className="text-[10px] shrink-0">
              #{tokenId}
            </Badge>
          </div>

          {metadata.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {metadata.description}
            </p>
          )}

          {/* Top attributes */}
          {metadata.attributes && metadata.attributes.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {metadata.attributes.slice(0, 3).map((attr, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="text-[9px] px-1.5 py-0"
                >
                  {attr.trait_type}: {attr.value}
                </Badge>
              ))}
              {metadata.attributes.length > 3 && (
                <Badge
                  variant="secondary"
                  className="text-[9px] px-1.5 py-0"
                >
                  +{metadata.attributes.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Click to view */}
          <div className="flex items-center gap-1 text-[10px] text-primary">
            <ExternalLink className="h-3 w-3" />
            <span>Click to view details</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
