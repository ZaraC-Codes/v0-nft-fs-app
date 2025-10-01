import { ProposalType } from "./group-treasury"

/**
 * AI Bot Command Parser and Configuration
 * Easily extensible - add new commands here
 */

export interface BotCommand {
  name: string
  patterns: string[] // Keywords that trigger this command
  description: string
  requiresVote: boolean
  voteThreshold: number // Percentage (90 = 90%)
  proposalType?: ProposalType
  handler: (params: CommandParams) => Promise<CommandResult>
}

export interface CommandParams {
  groupId: bigint
  sender: string
  message: string
  parsedData: any
}

export interface CommandResult {
  success: boolean
  message: string
  proposalId?: bigint
  requiresVote: boolean
  data?: any
}

// Bot command handlers
async function handleBuyCommand(params: CommandParams): Promise<CommandResult> {
  // Parse: "@bot Buy Gob #51" or "@bot Buy 0xContractAddress 51"
  const regex = /buy\s+(?:(\w+)\s+#(\d+)|0x([a-fA-F0-9]{40})\s+(\d+))/i
  const match = params.message.match(regex)

  if (!match) {
    return {
      success: false,
      message: "Invalid buy command. Format: '@bot Buy CollectionName #TokenId' or '@bot Buy 0xContractAddress TokenId'",
      requiresVote: false,
    }
  }

  const collectionName = match[1] || "Unknown"
  const tokenId = match[2] || match[4]
  const contractAddress = match[3] ? `0x${match[3]}` : ""

  return {
    success: true,
    message: `📋 Proposal created to buy ${collectionName} #${tokenId}. Waiting for group vote (90% approval required).`,
    requiresVote: true,
    data: {
      action: "buy",
      collectionName,
      tokenId,
      contractAddress,
    },
  }
}

async function handleSellCommand(params: CommandParams): Promise<CommandResult> {
  // Parse: "@bot Sell MAYC #537 for 5 ETH"
  const regex = /sell\s+(?:(\w+)\s+#(\d+)|0x([a-fA-F0-9]{40})\s+(\d+))\s+for\s+([\d.]+)\s+(\w+)/i
  const match = params.message.match(regex)

  if (!match) {
    return {
      success: false,
      message: "Invalid sell command. Format: '@bot Sell CollectionName #TokenId for Price Currency'",
      requiresVote: false,
    }
  }

  const collectionName = match[1] || "Unknown"
  const tokenId = match[2] || match[4]
  const price = match[5]
  const currency = match[6]

  return {
    success: true,
    message: `📋 Proposal created to sell ${collectionName} #${tokenId} for ${price} ${currency}. Waiting for group vote (90% approval required).`,
    requiresVote: true,
    data: {
      action: "sell",
      collectionName,
      tokenId,
      price,
      currency,
    },
  }
}

async function handleRentCommand(params: CommandParams): Promise<CommandResult> {
  // Parse: "@bot Rent out Fade #224 for 5 APE/Day with a 1 day min and 30 day max"
  const regex = /rent\s+out\s+(?:(\w+)\s+#(\d+)|0x([a-fA-F0-9]{40})\s+(\d+))\s+for\s+([\d.]+)\s+(\w+)\/day\s+(?:with\s+a\s+)?(\d+)\s+day\s+min\s+(?:and\s+)?(\d+)\s+day\s+max/i
  const match = params.message.match(regex)

  if (!match) {
    return {
      success: false,
      message: "Invalid rent command. Format: '@bot Rent out CollectionName #TokenId for Price Currency/Day with MinDays day min and MaxDays day max'",
      requiresVote: false,
    }
  }

  const collectionName = match[1] || "Unknown"
  const tokenId = match[2] || match[4]
  const pricePerDay = match[5]
  const currency = match[6]
  const minDays = match[7]
  const maxDays = match[8]

  return {
    success: true,
    message: `📋 Proposal created to rent out ${collectionName} #${tokenId} for ${pricePerDay} ${currency}/day (${minDays}-${maxDays} days). Waiting for group vote (90% approval required).`,
    requiresVote: true,
    data: {
      action: "rent",
      collectionName,
      tokenId,
      pricePerDay,
      currency,
      minDays,
      maxDays,
    },
  }
}

async function handleSwapCommand(params: CommandParams): Promise<CommandResult> {
  // Parse: "@bot Swap BAYC #123 for CryptoPunk #Any"
  const regex = /swap\s+(?:(\w+)\s+#(\d+)|0x([a-fA-F0-9]{40})\s+(\d+))\s+for\s+(\w+)\s+#(\d+|any)/i
  const match = params.message.match(regex)

  if (!match) {
    return {
      success: false,
      message: "Invalid swap command. Format: '@bot Swap CollectionName #TokenId for WantedCollection #TokenId' (use #Any for any token)",
      requiresVote: false,
    }
  }

  const collectionName = match[1] || "Unknown"
  const tokenId = match[2] || match[4]
  const wantedCollection = match[5]
  const wantedTokenId = match[6]

  return {
    success: true,
    message: `📋 Proposal created to swap ${collectionName} #${tokenId} for ${wantedCollection} #${wantedTokenId}. Waiting for group vote (90% approval required).`,
    requiresVote: true,
    data: {
      action: "swap",
      collectionName,
      tokenId,
      wantedCollection,
      wantedTokenId,
    },
  }
}

async function handleBalanceCommand(params: CommandParams): Promise<CommandResult> {
  // Mock response - in production, fetch actual balance
  return {
    success: true,
    message: `💰 Current treasury balance: 245.7 APE tokens\n📦 Treasury holds 12 NFTs with estimated value of 2,450.8 APE`,
    requiresVote: false,
  }
}

async function handleAddMemberCommand(params: CommandParams): Promise<CommandResult> {
  // Parse: "@bot Add member @username 0xWalletAddress"
  const regex = /add\s+member\s+@?(\w+)\s+(0x[a-fA-F0-9]{40})/i
  const match = params.message.match(regex)

  if (!match) {
    return {
      success: false,
      message: "Invalid add member command. Format: '@bot Add member @username 0xWalletAddress'",
      requiresVote: false,
    }
  }

  const username = match[1]
  const walletAddress = match[2]

  return {
    success: true,
    message: `📋 Proposal created to add member ${username} (${walletAddress}). Waiting for group vote (90% approval required).`,
    requiresVote: true,
    data: {
      action: "addMember",
      username,
      walletAddress,
    },
  }
}

async function handleRemoveMemberCommand(params: CommandParams): Promise<CommandResult> {
  // Parse: "@bot Remove member @username"
  const regex = /remove\s+member\s+@?(\w+)/i
  const match = params.message.match(regex)

  if (!match) {
    return {
      success: false,
      message: "Invalid remove member command. Format: '@bot Remove member @username'",
      requiresVote: false,
    }
  }

  const username = match[1]

  return {
    success: true,
    message: `📋 Proposal created to remove member ${username}. Waiting for group vote (90% approval required).`,
    requiresVote: true,
    data: {
      action: "removeMember",
      username,
    },
  }
}

async function handleLeaveCommand(params: CommandParams): Promise<CommandResult> {
  return {
    success: true,
    message: `📋 Proposal created for you to leave the group. Waiting for group vote (90% approval required).`,
    requiresVote: true,
    data: {
      action: "leave",
      member: params.sender,
    },
  }
}

async function handleHelpCommand(params: CommandParams): Promise<CommandResult> {
  const helpText = `
🤖 **Treasury AI Bot Commands**

**Trading:**
• \`@bot Buy CollectionName #TokenId\` - Propose buying an NFT
• \`@bot Sell CollectionName #TokenId for Price Currency\` - Propose selling an NFT
• \`@bot Rent out CollectionName #TokenId for Price Currency/Day with MinDays day min and MaxDays day max\` - Propose renting an NFT
• \`@bot Swap CollectionName #TokenId for WantedCollection #TokenId\` - Propose swapping an NFT

**Information:**
• \`@bot Balance\` - Check treasury balance
• \`@bot Portfolio\` - View all treasury NFTs
• \`@bot Members\` - List all group members

**Member Management:**
• \`@bot Add member @username 0xWalletAddress\` - Propose adding a member
• \`@bot Remove member @username\` - Propose removing a member
• \`@bot I want to leave\` - Propose leaving the group

**Voting:**
All transactions require 90% group approval. Members will be notified to vote.
  `.trim()

  return {
    success: true,
    message: helpText,
    requiresVote: false,
  }
}

// Command registry - easily add new commands here!
export const BOT_COMMANDS: Record<string, BotCommand> = {
  buy: {
    name: "buy",
    patterns: ["buy", "purchase", "acquire"],
    description: "Buy an NFT from the marketplace",
    requiresVote: true,
    voteThreshold: 90,
    proposalType: ProposalType.BUY_NFT,
    handler: handleBuyCommand,
  },
  sell: {
    name: "sell",
    patterns: ["sell", "list"],
    description: "Sell an NFT from the treasury",
    requiresVote: true,
    voteThreshold: 90,
    proposalType: ProposalType.SELL_NFT,
    handler: handleSellCommand,
  },
  rent: {
    name: "rent",
    patterns: ["rent", "rent out"],
    description: "Rent out an NFT from the treasury",
    requiresVote: true,
    voteThreshold: 90,
    proposalType: ProposalType.RENT_NFT,
    handler: handleRentCommand,
  },
  swap: {
    name: "swap",
    patterns: ["swap", "trade"],
    description: "Swap an NFT from the treasury",
    requiresVote: true,
    voteThreshold: 90,
    proposalType: ProposalType.SWAP_NFT,
    handler: handleSwapCommand,
  },
  balance: {
    name: "balance",
    patterns: ["balance", "wallet", "funds"],
    description: "Check treasury balance",
    requiresVote: false,
    voteThreshold: 0,
    handler: handleBalanceCommand,
  },
  addMember: {
    name: "addMember",
    patterns: ["add member", "invite"],
    description: "Add a new member to the group",
    requiresVote: true,
    voteThreshold: 90,
    proposalType: ProposalType.ADD_MEMBER,
    handler: handleAddMemberCommand,
  },
  removeMember: {
    name: "removeMember",
    patterns: ["remove member", "kick"],
    description: "Remove a member from the group",
    requiresVote: true,
    voteThreshold: 90,
    proposalType: ProposalType.REMOVE_MEMBER,
    handler: handleRemoveMemberCommand,
  },
  leave: {
    name: "leave",
    patterns: ["leave", "i want to leave", "exit"],
    description: "Leave the group",
    requiresVote: true,
    voteThreshold: 90,
    proposalType: ProposalType.WITHDRAW_MEMBER,
    handler: handleLeaveCommand,
  },
  help: {
    name: "help",
    patterns: ["help", "commands", "what can you do"],
    description: "Show available commands",
    requiresVote: false,
    voteThreshold: 0,
    handler: handleHelpCommand,
  },
}

/**
 * Parse a message and determine if it's a bot command
 */
export function parseMessage(message: string): {
  isCommand: boolean
  command?: BotCommand
  cleanMessage: string
} {
  const cleanMessage = message.trim()

  // Check if message mentions the bot
  if (!cleanMessage.toLowerCase().match(/@bot|@treasury\s+ai/i)) {
    return { isCommand: false, cleanMessage }
  }

  // Find matching command
  for (const cmd of Object.values(BOT_COMMANDS)) {
    for (const pattern of cmd.patterns) {
      const regex = new RegExp(pattern, "i")
      if (cleanMessage.match(regex)) {
        return {
          isCommand: true,
          command: cmd,
          cleanMessage,
        }
      }
    }
  }

  // Bot was mentioned but no command found
  return { isCommand: false, cleanMessage }
}

/**
 * Execute a bot command
 */
export async function executeBotCommand(
  command: BotCommand,
  params: CommandParams
): Promise<CommandResult> {
  try {
    return await command.handler(params)
  } catch (error) {
    console.error("Error executing bot command:", error)
    return {
      success: false,
      message: "❌ An error occurred while processing your command. Please try again.",
      requiresVote: false,
    }
  }
}
