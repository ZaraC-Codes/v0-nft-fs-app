"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Eye } from "lucide-react"
import { useProfile } from "./profile-provider"

interface AddToWatchlistProps {
  contractAddress: string
  tokenId: string
  name: string
  collection: string
  image?: string
  chainId: number
  className?: string
}

export function AddToWatchlist({
  contractAddress,
  tokenId,
  name,
  collection,
  image,
  chainId,
  className = ""
}: AddToWatchlistProps) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, loading } = useProfile()
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)

  const inWatchlist = isInWatchlist(contractAddress, tokenId)

  const handleToggleWatchlist = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsAdding(true)
    try {
      if (inWatchlist) {
        // Find the watchlist item to remove
        // In a real app, you'd have the item ID
        await removeFromWatchlist(`${contractAddress}-${tokenId}`)
        toast({
          title: "Removed from Watchlist",
          description: `${name} has been removed from your watchlist.`,
        })
      } else {
        await addToWatchlist({
          contractAddress,
          tokenId,
          name,
          collection,
          image,
          chainId,
        })
        toast({
          title: "Added to Watchlist",
          description: `${name} has been added to your watchlist.`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update watchlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Button
      variant={inWatchlist ? "default" : "outline"}
      size="sm"
      onClick={handleToggleWatchlist}
      disabled={loading || isAdding}
      className={`${className} ${
        inWatchlist
          ? "bg-blue-600 hover:bg-blue-700 border-blue-600"
          : "hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
      }`}
    >
      <Eye
        className={`h-4 w-4 mr-2 ${
          inWatchlist ? "fill-current" : ""
        }`}
      />
      {inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
    </Button>
  )
}

// Simplified version for icon-only button
export function WatchlistToggle({
  contractAddress,
  tokenId,
  name,
  collection,
  image,
  chainId,
  className = ""
}: AddToWatchlistProps) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, loading, userProfile } = useProfile()
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)

  const inWatchlist = isInWatchlist(contractAddress, tokenId)

  const handleToggleWatchlist = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    // Check if user is logged in
    if (!userProfile) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to your watchlist.",
        variant: "destructive",
      })
      return
    }

    setIsAdding(true)
    try {
      if (inWatchlist) {
        await removeFromWatchlist(`${contractAddress}-${tokenId}`)
        toast({
          title: "Removed from Watchlist",
          description: `${name} has been removed from your watchlist.`,
        })
      } else {
        await addToWatchlist({
          contractAddress,
          tokenId,
          name,
          collection,
          image,
          chainId,
        })
        toast({
          title: "Added to Watchlist",
          description: `${name} has been added to your watchlist.`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update watchlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <button
      onClick={handleToggleWatchlist}
      disabled={loading || isAdding}
      className={`inline-flex items-center justify-center rounded-md h-12 w-12 md:h-10 md:w-10 lg:h-8 lg:w-8 transition-all disabled:pointer-events-none disabled:opacity-50 ${className} ${
        inWatchlist
          ? "text-blue-600 hover:text-blue-700 hover:scale-110"
          : "text-muted-foreground hover:text-blue-600 hover:scale-110"
      }`}
      style={{ position: 'relative', zIndex: 9999 }}
    >
      <Eye
        className={`h-5 w-5 md:h-4 md:w-4 transition-all ${
          inWatchlist ? "fill-current" : ""
        }`}
      />
    </button>
  )
}