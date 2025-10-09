import { NextRequest, NextResponse } from "next/server"
import { getSupabaseClient, CHAT_MESSAGES_TABLE } from "@/lib/supabase"
import { getCollectionChatId } from "@/lib/collection-chat"

/**
 * GET /api/collections/[contractAddress]/chat/messages
 * Fetch all messages for a collection's community chat from Supabase cache
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

    const supabase = getSupabaseClient()
    const groupId = getCollectionChatId(contractAddress)

    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📥 FETCH MESSAGES FROM SUPABASE`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`- Collection Address: ${contractAddress}`)
    console.log(`- Group ID: ${groupId}`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

    // Fetch messages from Supabase (instant, no timeout!)
    const { data: messages, error } = await supabase
      .from(CHAT_MESSAGES_TABLE)
      .select('*')
      .eq('collection_address', contractAddress.toLowerCase())
      .order('timestamp', { ascending: true })

    if (error) {
      console.error('Error fetching messages from Supabase:', error)
      return NextResponse.json(
        { error: "Failed to fetch messages", details: error.message },
        { status: 500 }
      )
    }

    // Transform to frontend format
    const formattedMessages = messages.map((msg: any) => ({
      id: msg.blockchain_id,
      type: msg.message_type,
      content: msg.content,
      timestamp: msg.timestamp,
      senderAddress: msg.sender_address,
      isBot: msg.is_bot,
    }))

    console.log(`✅ Fetched ${formattedMessages.length} messages from Supabase`)

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
