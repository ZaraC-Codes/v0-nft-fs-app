export interface GroupTreasury {
  id: string // Group NFT token ID
  name: string
  description: string
  image?: string
  creatorId: string
  creatorName: string
  creatorAvatar?: string
  createdAt: Date
  walletAddress: string // Token Bound Account address
  totalValue: number // Estimated total value in APE
  memberCount: number
  isPrivate: boolean
  requiredDeposit: number // Required deposit in APE (0 if no deposit)
  members: GroupMember[]
}

export interface GroupMember {
  id: string
  username: string
  walletAddress: string
  avatar?: string
  role: "creator" | "admin" | "member"
  joinedAt: Date
  isOnline?: boolean
  verified?: boolean
  depositAmount: number
  hasDeposited: boolean
  isActive: boolean
}

export interface GroupChatMessage {
  id: string
  type: "message" | "command" | "bot_response" | "system" | "proposal"
  content: string
  timestamp: Date
  sender: {
    id: string
    username: string
    avatar?: string
    isBot?: boolean
  }
  proposalId?: string // If type is 'proposal'
}

export interface GroupProposal {
  id: string
  groupId: string
  proposer: string
  proposalType: ProposalType
  title: string
  description: string
  data: any // Encoded proposal data
  votesFor: number
  votesAgainst: number
  totalMembers: number
  createdAt: Date
  deadline: Date
  executed: boolean
  cancelled: boolean
  votes: ProposalVote[]
}

export interface ProposalVote {
  voter: string
  voterName: string
  support: boolean
  timestamp: Date
}

export enum ProposalType {
  BUY_NFT = "BUY_NFT",
  SELL_NFT = "SELL_NFT",
  RENT_NFT = "RENT_NFT",
  SWAP_NFT = "SWAP_NFT",
  TRANSFER_FUNDS = "TRANSFER_FUNDS",
  ADD_MEMBER = "ADD_MEMBER",
  REMOVE_MEMBER = "REMOVE_MEMBER",
  WITHDRAW_MEMBER = "WITHDRAW_MEMBER",
}

export interface CreateGroupParams {
  name: string
  description: string
  requiredDeposit?: number // In APE
  members: GroupMemberInput[]
}

export interface GroupMemberInput {
  name: string
  walletAddress: string
}

export interface BotCommand {
  command: string
  description: string
  example: string
  requiresVote: boolean
}

export const BOT_COMMANDS_HELP: BotCommand[] = [
  {
    command: "Buy",
    description: "Propose buying an NFT from the marketplace",
    example: "@bot Buy BAYC #3001",
    requiresVote: true,
  },
  {
    command: "Sell",
    description: "Propose selling an NFT from the treasury",
    example: "@bot Sell MAYC #537 for 5 ETH",
    requiresVote: true,
  },
  {
    command: "Rent out",
    description: "Propose renting out an NFT from the treasury",
    example: "@bot Rent out Fade #224 for 5 APE/Day with a 1 day min and 30 day max",
    requiresVote: true,
  },
  {
    command: "Swap",
    description: "Propose swapping an NFT",
    example: "@bot Swap BAYC #123 for CryptoPunk #Any",
    requiresVote: true,
  },
  {
    command: "Balance",
    description: "Check treasury balance and holdings",
    example: "@bot Balance",
    requiresVote: false,
  },
  {
    command: "Add member",
    description: "Propose adding a new member",
    example: "@bot Add member @username 0xWalletAddress",
    requiresVote: true,
  },
  {
    command: "Remove member",
    description: "Propose removing a member",
    example: "@bot Remove member @username",
    requiresVote: true,
  },
  {
    command: "Leave",
    description: "Request to leave the group",
    example: "@bot I want to leave",
    requiresVote: true,
  },
  {
    command: "Help",
    description: "Show all available commands",
    example: "@bot Help",
    requiresVote: false,
  },
]
