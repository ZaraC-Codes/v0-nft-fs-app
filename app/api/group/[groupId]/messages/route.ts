import { NextRequest, NextResponse } from "next/server"

// In-memory storage for messages (shared with send-message route)
// In production, this would be a database or fetch from smart contract
const messageStore = new Map<string, any[]>()

// Initialize with a welcome message for new groups
function getDefaultMessages(groupId: string) {
  return [
    {
      id: `msg-welcome-${groupId}`,
      type: "system",
      content: "Treasury AI Bot has joined the chat",
      timestamp: new Date(),
      sender: {
        id: "bot",
        username: "Treasury AI",
        avatar: "/bot-avatar.svg",
        isBot: true,
      },
    },
    {
      id: `msg-welcome-2-${groupId}`,
      type: "bot_response",
      content: "👋 Welcome to your group treasury! I'm here to help manage your collective NFT portfolio. Type '@bot help' to see available commands.",
      timestamp: new Date(),
      sender: {
        id: "bot",
        username: "Treasury AI",
        avatar: "/bot-avatar.svg",
        isBot: true,
      },
    },
  ]
}

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const { groupId } = params

    // Get messages from store, or return default messages
    let messages = messageStore.get(groupId)

    if (!messages || messages.length === 0) {
      messages = getDefaultMessages(groupId)
      messageStore.set(groupId, messages)
    }

    // TODO: In production, fetch from smart contract:
    // const onChainMessages = await getGroupMessages(BigInt(groupId))
    // Transform and return on-chain messages

    return NextResponse.json({
      success: true,
      messages,
      count: messages.length,
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
