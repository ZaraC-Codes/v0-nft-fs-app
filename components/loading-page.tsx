"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export function LoadingPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold">Loading page...</h2>
            <p className="text-sm text-muted-foreground">
              First-time compilation may take 30-60 seconds
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}