"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Wallet, Calendar, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface OfferModalProps {
  isOpen: boolean
  onClose: () => void
  nft: {
    id: string
    title: string
    image: string
    price: string
  }
}

export function OfferModal({ isOpen, onClose, nft }: OfferModalProps) {
  const [offerAmount, setOfferAmount] = useState("")
  const [expiration, setExpiration] = useState("7")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmitOffer = async () => {
    if (!offerAmount || Number.parseFloat(offerAmount) <= 0) {
      toast({
        title: "Invalid offer amount",
        description: "Please enter a valid offer amount",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate offer submission
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Offer submitted successfully!",
        description: `Your offer of ${offerAmount} ETH has been sent to the owner`,
      })
      onClose()
      setOfferAmount("")
    }, 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card/90 backdrop-blur-xl border-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
            Make an Offer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* NFT Preview */}
          <div className="flex items-center space-x-3 p-3 bg-card/30 rounded-lg border border-border/50">
            <img src={nft.image || "/placeholder.svg"} alt={nft.title} className="w-12 h-12 rounded-lg object-cover" />
            <div>
              <p className="font-semibold">{nft.title}</p>
              <p className="text-sm text-muted-foreground">Listed for: {nft.price}</p>
            </div>
          </div>

          {/* Offer Amount */}
          <div className="space-y-2">
            <Label htmlFor="offerAmount">Your Offer (ETH)</Label>
            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="offerAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="pl-10 bg-card/50 border-border/50 focus:border-accent/50 focus:ring-accent/20"
              />
            </div>
            <p className="text-xs text-muted-foreground">Make a competitive offer to increase your chances</p>
          </div>

          {/* Expiration */}
          <div className="space-y-2">
            <Label htmlFor="expiration">Offer Expiration (days)</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="expiration"
                type="number"
                min="1"
                max="30"
                value={expiration}
                onChange={(e) => setExpiration(e.target.value)}
                className="pl-10 bg-card/50 border-border/50 focus:border-accent/50 focus:ring-accent/20"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-3 p-4 bg-card/30 rounded-lg border border-border/50">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your offer</span>
              <span className="font-semibold">{offerAmount || "0.00"} ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service fee (2.5%)</span>
              <span className="font-semibold">
                {offerAmount ? (Number.parseFloat(offerAmount) * 0.025).toFixed(3) : "0.000"} ETH
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="font-semibold">Total if accepted</span>
              <span className="font-bold text-accent">
                {offerAmount ? (Number.parseFloat(offerAmount) * 1.025).toFixed(3) : "0.000"} ETH
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleSubmitOffer}
              disabled={isLoading || !offerAmount}
              className="flex-1 bg-gradient-to-r from-accent to-secondary hover:from-accent/80 hover:to-secondary/80 neon-glow"
            >
              {isLoading ? (
                "Submitting..."
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Make Offer
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
