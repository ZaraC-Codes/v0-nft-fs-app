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

    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📥 READ MESSAGES DEBUG`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`- Collection Address: ${contractAddress}`)
    console.log(`- Group ID: ${groupId}`)
    console.log(`- Group ID Type: ${typeof groupId}`)
    console.log(`- Group ID String: ${groupId.toString()}`)
    console.log(`- Contract Address: ${CHAT_RELAY_ADDRESS}`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

    // Get GroupChatRelay contract
    const contract = getContract({
      client,
      chain: apeChain,
      address: CHAT_RELAY_ADDRESS as `0x${string}`,
    })

    // Fetch messages from contract
    const messages = await readContract({
      contract,
      method: {
        type: "function",
        name: "getGroupMessages",
        inputs: [{ name: "groupId", type: "uint256", internalType: "uint256" }],
        outputs: [{
          name: "",
          type: "tuple[]",
          internalType: "struct GroupChatRelay.Message[]",
          components: [
            { name: "id", type: "uint256", internalType: "uint256" },
            { name: "groupId", type: "uint256", internalType: "uint256" },
            { name: "sender", type: "address", internalType: "address" },
            { name: "content", type: "string", internalType: "string" },
            { name: "timestamp", type: "uint256", internalType: "uint256" },
            { name: "messageType", type: "uint8", internalType: "enum GroupChatRelay.MessageType" },
            { name: "isBot", type: "bool", internalType: "bool" }
          ]
        }],
        stateMutability: "view"
      },
      params: [groupId],
    })

    // Transform to frontend format
    // Frontend will lookup user profile for username/avatar
    const formattedMessages = messages.map((msg: any) => ({
      id: msg.id.toString(),
      type: getMessageType(Number(msg.messageType)),
      content: msg.content,
      timestamp: new Date(Number(msg.timestamp) * 1000).toISOString(),
      senderAddress: msg.sender, // Raw address for frontend profile lookup
      isBot: msg.isBot,
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
