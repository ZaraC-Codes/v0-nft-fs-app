import { NextRequest, NextResponse } from "next/server"
import { verifyCollectionOwnership } from "@/lib/collection-chat"

/**
 * POST /api/collections/[contractAddress]/chat/verify-access
 * Verify NFT ownership across multiple wallets for chat access
 *
 * This endpoint is called BEFORE sending gasless transactions
 * to ensure the user owns an NFT in at least one of their linked wallets
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { contractAddress: string } }
) {
  try {
    const { contractAddress } = params
    const body = await request.json()
    const { wallets } = body

    // Validate inputs
    if (!wallets || !Array.isArray(wallets) || wallets.length === 0) {
      return NextResponse.json(
        { error: "Missing required field: wallets array" },
        { status: 400 }
      )
    }

    if (!contractAddress) {
      return NextResponse.json(
        { error: "Contract address is required" },
        { status: 400 }
      )
    }

    console.log(`🔐 Verifying NFT ownership for ${wallets.length} wallet(s) in collection ${contractAddress}`)

    // Verify ownership across ALL provided wallets
    const hasNFT = await verifyCollectionOwnership(wallets, contractAddress)

    if (!hasNFT) {
      console.log(`❌ Access denied: None of the ${wallets.length} wallet(s) own NFTs from ${contractAddress}`)
      return NextResponse.json(
        {
          hasAccess: false,
          error: "Access denied",
          message: "You must own at least 1 NFT from this collection to chat",
        },
        { status: 403 }
      )
    }

    console.log(`✅ Access granted: User owns NFT(s) from ${contractAddress} in at least one wallet`)

    return NextResponse.json({
      hasAccess: true,
      message: "NFT ownership verified"
    })
  } catch (error: any) {
    console.error("Error verifying collection access:", error)
    return NextResponse.json(
      {
        hasAccess: false,
        error: "Failed to verify access",
        details: error.message,
      },
      { status: 500 }
    )
  }
}
