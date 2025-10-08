import { NextRequest, NextResponse } from "next/server"
import { sendGaslessMessage } from "@/lib/gas-sponsorship"
import { verifyCollectionOwnership, getCollectionChatId } from "@/lib/collection-chat"

const CHAT_RELAY_ADDRESS = process.env.NEXT_PUBLIC_GROUP_CHAT_RELAY_ADDRESS || ""

/**
 * POST /api/collections/[contractAddress]/chat/send-message
 * Send a gasless message to collection community chat
 *
 * SECURITY: Server-side NFT ownership verification required
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { contractAddress: string } }
) {
  try {
    const { contractAddress } = params
    const body = await request.json()
    const { sender, content, messageType = 0 } = body

    // Validate inputs
    if (!content || !sender) {
      return NextResponse.json(
        { error: "Missing required fields: sender and content" },
        { status: 400 }
      )
    }

    if (!contractAddress) {
      return NextResponse.json(
        { error: "Contract address is required" },
        { status: 400 }
      )
    }

    if (!CHAT_RELAY_ADDRESS) {
      return NextResponse.json(
        { error: "Chat relay not configured" },
        { status: 500 }
      )
    }

    // Validate content length
    if (content.length > 500) {
      return NextResponse.json(
        { error: "Message too long (max 500 characters)" },
        { status: 400 }
      )
    }

    console.log(`🔐 Verifying NFT ownership for ${sender} in collection ${contractAddress}`)

    // CRITICAL: Verify NFT ownership server-side
    // This prevents unauthorized users from chatting
    const hasNFT = await verifyCollectionOwnership(sender, contractAddress)

    if (!hasNFT) {
      console.log(`❌ Access denied: ${sender} does not own NFTs from ${contractAddress}`)
      return NextResponse.json(
        {
          error: "Access denied",
          message: "You must own at least 1 NFT from this collection to chat",
          requiresNFT: true,
        },
        { status: 403 }
      )
    }

    console.log(`✅ Ownership verified: ${sender} owns NFT(s) from ${contractAddress}`)

    // Get collection's deterministic chat ID
    const groupId = getCollectionChatId(contractAddress)

    console.log(`💬 Sending gasless message for collection ${contractAddress}, groupId: ${groupId}`)

    // Send gasless message via relayer
    const result = await sendGaslessMessage(
      groupId,
      sender,
      content,
      messageType,
      CHAT_RELAY_ADDRESS
    )

    console.log(`✅ Message sent successfully: ${result.transactionHash}`)

    return NextResponse.json({
      success: true,
      transactionHash: result.transactionHash,
      messageId: groupId.toString(),
      gasless: true,
    })
  } catch (error: any) {
    console.error("Error sending collection message:", error)

    // Handle rate limit errors
    if (error.message?.includes("rate limit")) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: error.message,
          retryAfter: 3600, // 1 hour in seconds
        },
        { status: 429 }
      )
    }

    // Handle relayer errors
    if (error.message?.includes("RELAYER_PRIVATE_KEY")) {
      return NextResponse.json(
        { error: "Gasless messaging not configured" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        error: "Failed to send message",
        details: error.message,
      },
      { status: 500 }
    )
  }
}
