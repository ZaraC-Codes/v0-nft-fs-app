import { NextRequest, NextResponse } from "next/server"
import { getContract, readContract } from "thirdweb"
import { client, apeChain } from "@/lib/thirdweb"
import { getCollectionChatId, getMessageType, formatAddress, getAvatarUrl } from "@/lib/collection-chat"

const CHAT_RELAY_ADDRESS = process.env.NEXT_PUBLIC_GROUP_CHAT_RELAY_ADDRESS || ""

/**
 * GET /api/collections/[contractAddress]/chat/messages
 * Fetch all messages for a collection's community chat
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { contractAddress: string } }
) {
  try {
    const { contractAddress } = params

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

    // Get collection's deterministic chat ID
    const groupId = getCollectionChatId(contractAddress)
    console.log(`📬 Fetching messages for collection ${contractAddress}, groupId: ${groupId}`)

    // Get GroupChatRelay contract
    const contract = getContract({
      client,
      chain: apeChain,
      address: CHAT_RELAY_ADDRESS as `0x${string}`,
    })

    // Fetch messages from contract
    const messages = await readContract({
      contract,
      method: "function getGroupMessages(uint256 groupId) external view returns (tuple(uint256 id, uint256 groupId, address sender, string content, uint256 timestamp, uint8 messageType, bool isBot)[])",
      params: [groupId],
    })

    // Transform to frontend format
    const formattedMessages = messages.map((msg: any) => ({
      id: msg.id.toString(),
      type: getMessageType(Number(msg.messageType)),
      content: msg.content,
      timestamp: new Date(Number(msg.timestamp) * 1000).toISOString(),
      sender: {
        id: msg.sender,
        username: msg.isBot ? "Collection Bot" : formatAddress(msg.sender),
        avatar: msg.isBot ? "/bot-avatar.svg" : getAvatarUrl(msg.sender),
        isBot: msg.isBot,
        verified: !msg.isBot, // All holders are verified
      },
    }))

    console.log(`✅ Fetched ${formattedMessages.length} messages for collection ${contractAddress}`)

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
      count: formattedMessages.length,
      groupId: groupId.toString(),
    })
  } catch (error: any) {
    console.error("Error fetching collection messages:", error)

    // Handle contract errors gracefully
    if (error.message?.includes("execution reverted")) {
      // No messages yet for this collection
      return NextResponse.json({
        success: true,
        messages: [],
        count: 0,
      })
    }

    return NextResponse.json(
      { error: "Failed to fetch messages", details: error.message },
      { status: 500 }
    )
  }
}
