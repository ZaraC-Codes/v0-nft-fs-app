"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, ExternalLink } from "lucide-react"

interface NFTGateMessageProps {
  collection: {
    name: string
  }
}

/**
 * Token-gating message component
 * Shows when user doesn't own NFTs from the collection
 */
export function NFTGateMessage({ collection }: NFTGateMessageProps) {
  const scrollToItems = () => {
    // Scroll to Items tab
    const itemsTab = document.querySelector('[value="items"]')
    if (itemsTab) {
      (itemsTab as HTMLElement).click()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <Card className="border-dashed border-2 border-orange-500/50 bg-orange-500/5">
      <CardContent className="p-3 xs:p-4 sm:p-6">
        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 p-2 rounded-lg bg-orange-500/10">
            <Shield className="h-5 w-5 xs:h-6 xs:w-6 text-orange-500" />
          </div>

          {/* Message */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm xs:text-base mb-1">
              Token-Gated Community
            </h3>
            <p className="text-xs xs:text-sm text-muted-foreground">
              You must own an NFT from{" "}
              <span className="font-medium text-foreground">{collection.name}</span>{" "}
              to participate in this chat.
            </p>
          </div>

          {/* CTA Button - Full width on very small screens */}
          <Button
            size="sm"
            onClick={scrollToItems}
            className="w-full xs:w-auto shrink-0 text-xs xs:text-sm
                       touch-manipulation active:scale-95 transition-transform"
          >
            View Collection
            <ExternalLink className="h-3 w-3 xs:h-4 xs:w-4 ml-1.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
