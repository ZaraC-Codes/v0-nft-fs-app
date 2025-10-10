"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Eye, Loader2 } from "lucide-react"
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
          ? "bg-primary hover:bg-primary/90 border-primary"
          : "hover:bg-primary/10 hover:border-primary/20 hover:text-primary"
      }`}
    >
      {isAdding ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Eye
          className={`h-4 w-4 mr-2 ${
            inWatchlist ? "fill-current" : ""
          }`}
        />
      )}
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
      aria-label={inWatchlist ? `Remove ${name} from watchlist` : `Add ${name} to watchlist`}
      aria-pressed={inWatchlist}
      title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
      className={`inline-flex items-center justify-center rounded-md bg-black/10 h-12 w-12 md:h-10 md:w-10 lg:h-8 lg:w-8 transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 touch-manipulation [-webkit-tap-highlight-color:transparent] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className} ${
        inWatchlist
          ? "text-primary drop-shadow-[0_0_8px_rgba(0,255,255,0.6)] hover:drop-shadow-[0_0_10px_rgba(0,255,255,0.7)] hover:scale-110"
          : "text-muted-foreground hover:text-primary hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.4)] hover:scale-105"
      }`}
      style={{ position: 'relative', zIndex: 50 }}
    >
      {isAdding ? (
        <Loader2 className="h-5 w-5 md:h-4 md:w-4 animate-spin" />
      ) : (
        <Eye
          className={`h-5 w-5 md:h-4 md:w-4 transition-all ${
            inWatchlist ? "fill-current" : ""
          }`}
          aria-hidden="true"
        />
      )}
    </button>
  )
}