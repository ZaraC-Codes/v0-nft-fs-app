import { NextRequest, NextResponse } from "next/server"

// In-memory storage for messages (in production, use database or IPFS)
const messageStore = new Map<string, any[]>()

export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const { groupId } = params
    const body = await request.json()
    const { sender, content, messageType } = body

    if (!content || !sender) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create message object
    const message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: messageType === 1 ? "command" :
            messageType === 2 ? "bot_response" :
            messageType === 3 ? "system" : "message",
      content,
      timestamp: new Date(),
      sender: sender === "bot" ? {
        id: "bot",
        username: "Treasury AI",
        avatar: "/bot-avatar.svg",
        isBot: true,
      } : {
        id: sender,
        username: sender.slice(0, 6) + "..." + sender.slice(-4),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${sender}`,
        isBot: false,
      },
    }

    // Store message
    const messages = messageStore.get(groupId) || []
    messages.push(message)
    messageStore.set(groupId, messages)

    // TODO: In production, send this to the smart contract via relayer
    // This would call GroupChatRelay.sendMessage() or sendBotMessage()
    // with gas sponsorship via ThirdWeb sponsored transactions

    return NextResponse.json({
      success: true,
      message,
    })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
