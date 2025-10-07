# Group Treasury System - Complete Guide

## 🎯 Overview

The Group Treasury System allows users to create private groups with:
- **Shared Treasury Wallet** (ERC6551 Token Bound Account)
- **AI Bot Manager** for natural language commands
- **Democratic Voting** (90% approval required for transactions)
- **Gasless Chat** for seamless Web2-like experience
- **Member Management** via voting

## 📁 What's Been Created

### Smart Contracts (`contracts/`)

1. **GroupTreasuryNFT.sol**
   - ERC721 NFT representing group membership
   - Each group gets one NFT with metadata
   - Stores group info: name, description, creator, deposit requirement
   - Links to Token Bound Account (treasury wallet)

2. **GroupTreasuryManager.sol**
   - Manages all group operations
   - Member management (add/remove/deposit tracking)
   - Proposal creation and voting (90% threshold)
   - Proposal execution after approval
   - Supports 8 proposal types: BUY, SELL, RENT, SWAP, TRANSFER, ADD_MEMBER, REMOVE_MEMBER, WITHDRAW

3. **GroupChatRelay.sol**
   - Handles gasless chat messages
   - Backend relayer submits transactions
   - Stores messages on-chain (encrypted content)
   - Support for: regular messages, commands, bot responses, system messages, proposals

### TypeScript Integration (`lib/`)

1. **group-treasury.ts**
   - Complete TypeScript wrapper for all contracts
   - Functions for group creation, voting, member management
   - Read functions for getting group data
   - Proper typing with ThirdWeb v5

2. **ai-bot-commands.ts**
   - **EASILY EXTENSIBLE** command system
   - Command parser for natural language
   - Pre-built handlers for 9 commands:
     - `@bot Buy BAYC #123`
     - `@bot Sell MAYC #537 for 5 ETH`
     - `@bot Rent out Fade #224 for 5 APE/Day with 1 day min and 30 day max`
     - `@bot Swap BAYC #123 for CryptoPunk #Any`
     - `@bot Balance`
     - `@bot Add member @username 0xWalletAddress`
     - `@bot Remove member @username`
     - `@bot I want to leave`
     - `@bot Help`

### Components (`components/group/`)

1. **create-group-modal.tsx**
   - 3-step group creation wizard
   - Step 1: Group details (name, description)
   - Step 2: Add members (name + wallet address)
   - Step 3: Set deposit requirement (optional)
   - Beautiful UI matching Treasury template design

### Types (`types/`)

1. **group-treasury.ts**
   - Complete TypeScript types
   - GroupTreasury, GroupMember, GroupChatMessage
   - GroupProposal, ProposalVote
   - BOT_COMMANDS_HELP for documentation

### Scripts (`scripts/`)

1. **deploy-group-treasury.ts**
   - Deployment script for all 3 contracts
   - Provides addresses and setup instructions

## 🚀 How to Deploy

### 1. Prerequisites

```bash
# Ensure you have testnet APE tokens
# Add to .env.local:
PRIVATE_KEY=your_private_key_here
```

### 2. Deploy Contracts

```bash
npx hardhat run scripts/deploy-group-treasury.ts --network apechain_curtis
```

### 3. Update Contract Addresses

After deployment, update `lib/group-treasury.ts`:

```typescript
export const GROUP_TREASURY_ADDRESSES = {
  groupNFT: "0xYourGroupNFTAddress",
  manager: "0xYourManagerAddress",
  chatRelay: "0xYourChatRelayAddress",
}
```

### 4. Restart Dev Server

```bash
pnpm run dev
```

## 🏗️ Architecture

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                       │
│  (Create Group Modal, Chat Interface, Voting UI)            │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                  TypeScript Integration                     │
│  (group-treasury.ts, ai-bot-commands.ts)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                   Smart Contracts                           │
│  GroupTreasuryNFT ──► GroupTreasuryManager ──► ChatRelay    │
│         │                      │                      │      │
│         │                      │                      │      │
│  Mints Group NFT         Voting Logic           Chat Storage│
│  Creates TBA Wallet      Member Mgmt           Gasless Txs  │
└─────────────────────────────────────────────────────────────┘
```

### Flow: Creating a Group

1. User clicks "Create Group"
2. Fills out 3-step form
3. System mints GroupTreasuryNFT
4. ERC6551 TBA wallet is created for the group NFT
5. Creator initialized as first member
6. Group ready for trading!

### Flow: AI Bot Command

1. User types: `@bot Buy BAYC #3001`
2. Message sent to backend relayer (gasless)
3. Relayer calls ChatRelay contract
4. Bot command parser detects "buy" command
5. Proposal created in GroupTreasuryManager
6. Members notified to vote
7. When 90% vote yes, proposal executes
8. NFT purchased and sent to group's TBA wallet

### Flow: Voting

1. Proposal created (by bot or member)
2. All active members can vote (yes/no)
3. System calculates approval percentage
4. When 90%+ approve AND voting period ends:
   - Proposal executes automatically
   - Transaction sent from group's TBA wallet
5. Results posted to chat by AI bot

## ✅ What's Complete

- ✅ Smart contracts (3 contracts)
- ✅ TypeScript integration
- ✅ AI bot command parser (9 commands)
- ✅ Group creation modal
- ✅ Deployment script
- ✅ Complete typing system
- ✅ Extensible command system

## 🔨 What Still Needs to Be Built

### 1. Group Treasury Page (Priority: HIGH)

**File to create:** `app/groups/[groupId]/page.tsx`

Use `app/treasury/page.tsx` as template. Needs:
- Group header with stats
- Chat interface with message history
- AI bot integration
- Members sidebar
- Portfolio view
- Voting UI for proposals

### 2. Backend Chat Relayer (Priority: HIGH)

**File to create:** `app/api/group/send-message/route.ts`

Needs:
- Accept chat messages from frontend
- Submit to ChatRelay contract (gasless)
- Use ThirdWeb sponsored transactions
- Handle bot commands
- Return bot responses

### 3. AI Bot Integration (Priority: HIGH)

**File to create:** `app/api/group/bot/route.ts`

Needs:
- Use ThirdWeb AI Chat API (available via MCP!)
- Parse commands using `ai-bot-commands.ts`
- Create proposals via GroupTreasuryManager
- Post responses to ChatRelay
- Handle voting notifications

### 4. Voting UI Component (Priority: HIGH)

**File to create:** `components/group/proposal-vote-card.tsx`

Needs:
- Display active proposals
- Vote yes/no buttons
- Real-time vote count
- Progress bar (90% threshold)
- Execute button when threshold met

### 5. Member Management UI (Priority: MEDIUM)

**File to create:** `components/group/members-panel.tsx`

Needs:
- Display all members
- Show deposit status
- Online/offline indicators
- Role badges (creator, admin, member)

### 6. Groups Discovery Page (Priority: MEDIUM)

**File to create:** `app/groups/page.tsx`

Needs:
- List user's groups
- "Create Group" button
- Group cards with stats
- Navigate to specific group

### 7. Real-time Updates (Priority: MEDIUM)

**Options:**
- WebSocket connection for live chat
- Polling for new messages/votes
- ThirdWeb event listeners for on-chain events

### 8. Gas Sponsorship Setup (Priority: HIGH)

**Needs:**
- Backend relayer wallet funding
- ThirdWeb sponsored transaction configuration
- Rate limiting for abuse prevention

## 🔧 How to Add New Bot Commands

Adding new commands is SUPER EASY! Just edit `lib/ai-bot-commands.ts`:

```typescript
// 1. Add handler function
async function handleTransferCommand(params: CommandParams): Promise<CommandResult> {
  // Parse command
  const regex = /transfer\s+([\d.]+)\s+(\w+)\s+to\s+(0x[a-fA-F0-9]{40})/i
  const match = params.message.match(regex)

  if (!match) {
    return {
      success: false,
      message: "Invalid format. Use: '@bot Transfer 100 APE to 0xAddress'",
      requiresVote: false,
    }
  }

  const [, amount, currency, recipient] = match

  return {
    success: true,
    message: `Proposal created to transfer ${amount} ${currency} to ${recipient}`,
    requiresVote: true,
    data: { action: "transfer", amount, currency, recipient },
  }
}

// 2. Add to BOT_COMMANDS registry
export const BOT_COMMANDS: Record<string, BotCommand> = {
  // ... existing commands ...

  transfer: {
    name: "transfer",
    patterns: ["transfer", "send funds"],
    description: "Transfer funds from treasury",
    requiresVote: true,
    voteThreshold: 90,
    proposalType: ProposalType.TRANSFER_FUNDS,
    handler: handleTransferCommand,
  },
}
```

That's it! The command is now available.

## 🎨 Design System

All UI matches the Treasury template design:
- Cyberpunk theme with neon accents
- Glassmorphism cards
- Gradient buttons and badges
- Dark mode colors
- Radix UI components

## 🔒 Security Features

1. **90% Voting Threshold** - Prevents single-member control
2. **Proposal Deadlines** - 7-day voting period
3. **Member Verification** - Only active members can vote
4. **Deposit Tracking** - Ensures members have stake
5. **On-chain Transparency** - All votes and actions recorded
6. **Rate Limiting** - Prevents spam (to be implemented in relayer)

## 📊 Testing Strategy

### Local Testing

1. Deploy to testnet
2. Create test group with multiple wallet addresses
3. Test commands in chat
4. Verify voting works
5. Check proposal execution

### What to Test

- [ ] Group creation with/without deposit
- [ ] Member addition via bot
- [ ] Buy command creates proposal
- [ ] Voting reaches 90% threshold
- [ ] Proposal executes correctly
- [ ] Member removal works
- [ ] Leave command works
- [ ] Chat messages persist
- [ ] Gasless transactions work

## 🚦 Next Steps

1. **Deploy contracts** to testnet
2. **Update contract addresses** in `lib/group-treasury.ts`
3. **Create group treasury page** using Treasury template
4. **Build backend relayer** for gasless chat
5. **Integrate ThirdWeb AI Chat API** for bot intelligence
6. **Create voting UI** component
7. **Add real-time updates** (WebSocket or polling)
8. **Test end-to-end** with multiple wallets

## 💡 Tips

- The bot command system is VERY extensible - add as many commands as you want!
- Use the Treasury mock page as your UI template - it's already perfect
- ThirdWeb AI Chat API can be called via the MCP tools you have access to
- Gasless transactions require backend relayer - fund it with testnet APE
- Consider adding Discord/Telegram notifications for votes

## 🤝 Support

If you need help:
- Check smart contract comments for detailed explanations
- Review TypeScript integration for usage examples
- Look at Treasury mock page for UI patterns
- Test commands in `ai-bot-commands.ts` first

---

**This system is production-ready** once you complete the remaining UI components and backend relayer!
