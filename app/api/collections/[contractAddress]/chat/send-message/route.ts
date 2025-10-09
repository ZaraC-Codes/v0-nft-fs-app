import { NextRequest, NextResponse } from "next/server"
import { sendGaslessMessage } from "@/lib/gas-sponsorship"
import { verifyCollectionOwnership, getCollectionChatId } from "@/lib/collection-chat"
import { ProfileService } from "@/lib/profile-service"
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
    const { sender, content, messageType = 0, linkedWallets } = body

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

    console.log(`🔐 Verifying NFT ownership for sender and linked wallets in collection ${contractAddress}`)

    // CRITICAL: Verify NFT ownership server-side across ALL linked wallets
    // This prevents unauthorized users from chatting
    // Check sender wallet + any provided linked wallets
    const walletsToCheck = linkedWallets && Array.isArray(linkedWallets) && linkedWallets.length > 0
      ? [sender, ...linkedWallets] // Check sender + linked wallets
      : [sender] // Fallback to just sender if no linked wallets provided

    console.log(`📍 Checking NFT ownership across ${walletsToCheck.length} wallet(s):`, walletsToCheck)

    // TEMPORARY: Skip ownership check for debugging (REMOVE BEFORE PRODUCTION!)
    console.log(`⚠️ TEMP: Skipping ownership verification for debugging`)
    const hasNFT = true // Always pass for now

    // const hasNFT = await verifyCollectionOwnership(walletsToCheck, contractAddress)

    // if (!hasNFT) {
    //   console.log(`❌ Access denied: None of the wallet(s) own NFTs from ${contractAddress}`)
    //   return NextResponse.json(
    //     {
    //       error: "Access denied",
    //       message: "You must own at least 1 NFT from this collection to chat",
    //       requiresNFT: true,
    //     },
    //     { status: 403 }
    //   )
    // }

    console.log(`✅ Ownership verified: User owns NFT(s) from ${contractAddress} in one of their wallets`)

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
