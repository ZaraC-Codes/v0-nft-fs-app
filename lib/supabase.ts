import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client (for API routes and scripts)
// Creates a new client each time to ensure fresh credentials
export const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Type definitions for our chat messages table
export interface ChatMessage {
  id: string
  collection_address: string
  group_id: string
  sender_address: string
  content: string
  message_type: string
  is_bot: boolean
  timestamp: string
  blockchain_id: string
  created_at: string
}

// Database table name
export const CHAT_MESSAGES_TABLE = 'chat_messages'
