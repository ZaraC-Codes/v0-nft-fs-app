"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Wallet, Clock, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BidModalProps {
  isOpen: boolean
  onClose: () => void
  nft: {
    id: string
    title: string
    image: string
    price: string
  }
}

export function BidModal({ isOpen, onClose, nft }: BidModalProps) {
  const [bidAmount, setBidAmount] = useState("")
  const [duration, setDuration] = useState("7")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmitBid = async () => {
    if (!bidAmount || Number.parseFloat(bidAmount) <= 0) {
      toast({
        title: "Invalid bid amount",
        description: "Please enter a valid bid amount",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate bid submission
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Bid placed successfully!",
        description: `Your bid of ${bidAmount} ETH has been placed on ${nft.title}`,
      })
      onClose()
      setBidAmount("")
    }, 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card/90 backdrop-blur-xl border-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Place a Bid
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* NFT Preview */}
          <div className="flex items-center space-x-3 p-3 bg-card/30 rounded-lg border border-border/50">
            <img src={nft.image || "/placeholder.svg"} alt={nft.title} className="w-12 h-12 rounded-lg object-cover" />
            <div>
              <p className="font-semibold">{nft.title}</p>
              <p className="text-sm text-muted-foreground">Current price: {nft.price}</p>
            </div>
          </div>

          {/* Bid Amount */}
          <div className="space-y-2">
            <Label htmlFor="bidAmount">Your Bid (ETH)</Label>
            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="bidAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="pl-10 bg-card/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>
            <p className="text-xs text-muted-foreground">Minimum bid: 0.1 ETH above current highest bid</p>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Bid Duration (days)</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="duration"
                type="number"
                min="1"
                max="30"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="pl-10 bg-card/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-3 p-4 bg-card/30 rounded-lg border border-border/50">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your bid</span>
              <span className="font-semibold">{bidAmount || "0.00"} ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service fee (2.5%)</span>
              <span className="font-semibold">
                {bidAmount ? (Number.parseFloat(bidAmount) * 0.025).toFixed(3) : "0.000"} ETH
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-primary">
                {bidAmount ? (Number.parseFloat(bidAmount) * 1.025).toFixed(3) : "0.000"} ETH
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleSubmitBid}
              disabled={isLoading || !bidAmount}
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 neon-glow"
            >
              {isLoading ? (
                "Placing Bid..."
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Place Bid
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
