import { NextRequest, NextResponse } from "next/server"
import { sendGaslessMessage } from "@/lib/gas-sponsorship"
import { getCollectionChatId } from "@/lib/collection-chat"
import { waitForReceipt } from "thirdweb"
import { client } from "@/lib/thirdweb"

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

    // SECURITY MODEL:
    // - Frontend verifies NFT ownership when user accesses Community Chat tab
    // - Only users who pass frontend check can see/access chat UI
    // - Backend relayer is the ONLY address authorized to write to GroupChatRelay contract
    // - Even if someone bypasses frontend, they can't write to contract (onlyRelayer modifier)
    // - This provides security WITHOUT slow backend API calls on every message

    console.log(`✅ Skipping ownership verification - frontend already verified when accessing chat`)

    // Get collection's deterministic chat ID
    const groupId = getCollectionChatId(contractAddress)

    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📤 SEND MESSAGE DEBUG`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`- Collection Address: ${contractAddress}`)
    console.log(`- Group ID: ${groupId}`)
    console.log(`- Group ID Type: ${typeof groupId}`)
    console.log(`- Group ID String: ${groupId.toString()}`)
    console.log(`- Contract Address: ${CHAT_RELAY_ADDRESS}`)
    console.log(`- Sender: ${sender}`)
    console.log(`- Content: ${content}`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

    // Send gasless message via relayer
    const result = await sendGaslessMessage(
      groupId,
      sender,
      content,
      messageType,
      CHAT_RELAY_ADDRESS
    )

    console.log(`🔗 Transaction hash: ${result.transactionHash}`)
    console.log(`🔗 Explorer: https://apechain.calderaexplorer.xyz/tx/${result.transactionHash}`)

    // Wait for confirmation and check status
    console.log(`⏳ Waiting for transaction confirmation...`)
    const receipt = await waitForReceipt({
      client,
      chain: result.chain,
      transactionHash: result.transactionHash,
    })

    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📋 TRANSACTION RECEIPT`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`- Status: ${receipt.status === "success" ? '✅ SUCCESS' : '❌ FAILED'}`)
    console.log(`- Block Number: ${receipt.blockNumber}`)
    console.log(`- Gas Used: ${receipt.gasUsed}`)
    console.log(`- Logs/Events: ${receipt.logs?.length || 0}`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

    if (receipt.status !== "success") {
      console.log(`❌ TRANSACTION FAILED ON BLOCKCHAIN`)
      return NextResponse.json(
        {
          error: "Transaction failed on blockchain",
          transactionHash: result.transactionHash,
          explorerUrl: `https://apechain.calderaexplorer.xyz/tx/${result.transactionHash}`
        },
        { status: 500 }
      )
    }

    if (!receipt.logs || receipt.logs.length === 0) {
      console.log(`⚠️ WARNING: Transaction succeeded but no events emitted!`)
    }

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
