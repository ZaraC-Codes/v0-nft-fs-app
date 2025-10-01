import { prepareContractCall, sendTransaction, readContract, getContract } from "thirdweb"
import { client } from "./thirdweb"
import { apeChainCurtis } from "./thirdweb"

// Contract addresses (update after deployment)
export const GROUP_TREASURY_ADDRESSES = {
  groupNFT: "0x0000000000000000000000000000000000000000", // Update after deployment
  manager: "0x0000000000000000000000000000000000000000", // Update after deployment
  chatRelay: "0x0000000000000000000000000000000000000000", // Update after deployment
}

// ABIs
export const GROUP_NFT_ABI = [
  "function createGroup(address to, string memory name, string memory description, uint256 requiredDeposit) external returns (uint256)",
  "function getGroupMetadata(uint256 tokenId) external view returns (tuple(string name, string description, address creator, uint256 createdAt, bool isPrivate, uint256 memberCount, uint256 requiredDeposit))",
  "function getTokenBoundAccount(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)"
] as const

export const GROUP_MANAGER_ABI = [
  "function initializeGroup(uint256 groupId, address creator, string memory creatorName) external",
  "function makeDeposit(uint256 groupId) external payable",
  "function createProposal(uint256 groupId, uint8 proposalType, bytes memory data) external returns (uint256)",
  "function vote(uint256 proposalId, bool support) external",
  "function executeProposal(uint256 proposalId) external",
  "function getMemberCount(uint256 groupId) external view returns (uint256)",
  "function getGroupMembers(uint256 groupId) external view returns (address[] memory)",
  "function getMember(uint256 groupId, address wallet) external view returns (tuple(address wallet, string name, uint256 joinedAt, uint256 depositAmount, bool hasDeposited, bool isActive))",
  "function getProposal(uint256 proposalId) external view returns (uint256 id, uint256 groupId, address proposer, uint8 proposalType, bytes memory data, uint256 votesFor, uint256 votesAgainst, uint256 createdAt, uint256 deadline, bool executed, bool cancelled)",
  "function hasVoted(uint256 proposalId, address voter) external view returns (bool)",
  "function getGroupProposals(uint256 groupId) external view returns (uint256[] memory)"
] as const

export const CHAT_RELAY_ABI = [
  "function sendMessage(uint256 groupId, address sender, string memory content, uint8 messageType) external returns (uint256)",
  "function sendBotMessage(uint256 groupId, string memory content, uint8 messageType) external returns (uint256)",
  "function sendSystemMessage(uint256 groupId, string memory content) external returns (uint256)",
  "function getGroupMessages(uint256 groupId) external view returns (tuple(uint256 id, uint256 groupId, address sender, string content, uint256 timestamp, uint8 messageType, bool isBot)[] memory)",
  "function getGroupMessagesPaginated(uint256 groupId, uint256 offset, uint256 limit) external view returns (tuple(uint256 id, uint256 groupId, address sender, string content, uint256 timestamp, uint8 messageType, bool isBot)[] memory)",
  "function getMessageCount(uint256 groupId) external view returns (uint256)"
] as const

// Enums
export enum ProposalType {
  BUY_NFT = 0,
  SELL_NFT = 1,
  RENT_NFT = 2,
  SWAP_NFT = 3,
  TRANSFER_FUNDS = 4,
  ADD_MEMBER = 5,
  REMOVE_MEMBER = 6,
  WITHDRAW_MEMBER = 7,
}

export enum MessageType {
  REGULAR = 0,
  COMMAND = 1,
  BOT_RESPONSE = 2,
  SYSTEM = 3,
  PROPOSAL = 4,
}

// Types
export interface GroupMetadata {
  name: string
  description: string
  creator: string
  createdAt: bigint
  isPrivate: boolean
  memberCount: bigint
  requiredDeposit: bigint
}

export interface Member {
  wallet: string
  name: string
  joinedAt: bigint
  depositAmount: bigint
  hasDeposited: boolean
  isActive: boolean
}

export interface Proposal {
  id: bigint
  groupId: bigint
  proposer: string
  proposalType: ProposalType
  data: string
  votesFor: bigint
  votesAgainst: bigint
  createdAt: bigint
  deadline: bigint
  executed: boolean
  cancelled: boolean
}

export interface ChatMessage {
  id: bigint
  groupId: bigint
  sender: string
  content: string
  timestamp: bigint
  messageType: MessageType
  isBot: boolean
}

// Group Creation
export async function createGroup(
  account: any,
  name: string,
  description: string,
  requiredDeposit: bigint = 0n
) {
  const contract = getContract({
    client,
    chain: apeChainCurtis,
    address: GROUP_TREASURY_ADDRESSES.groupNFT,
  })

  const transaction = prepareContractCall({
    contract,
    method: "function createGroup(address to, string memory name, string memory description, uint256 requiredDeposit) external returns (uint256)",
    params: [account.address, name, description, requiredDeposit],
  })

  const result = await sendTransaction({
    transaction,
    account,
  })

  return result
}

// Initialize Group with Creator
export async function initializeGroup(
  account: any,
  groupId: bigint,
  creatorName: string
) {
  const contract = getContract({
    client,
    chain: apeChainCurtis,
    address: GROUP_TREASURY_ADDRESSES.manager,
  })

  const transaction = prepareContractCall({
    contract,
    method: "function initializeGroup(uint256 groupId, address creator, string memory creatorName) external",
    params: [groupId, account.address, creatorName],
  })

  const result = await sendTransaction({
    transaction,
    account,
  })

  return result
}

// Get Group Metadata
export async function getGroupMetadata(groupId: bigint): Promise<GroupMetadata> {
  const contract = getContract({
    client,
    chain: apeChainCurtis,
    address: GROUP_TREASURY_ADDRESSES.groupNFT,
  })

  const result = await readContract({
    contract,
    method: "function getGroupMetadata(uint256 tokenId) external view returns (tuple(string name, string description, address creator, uint256 createdAt, bool isPrivate, uint256 memberCount, uint256 requiredDeposit))",
    params: [groupId],
  })

  return result as GroupMetadata
}

// Get Token Bound Account
export async function getTokenBoundAccount(groupId: bigint): Promise<string> {
  const contract = getContract({
    client,
    chain: apeChainCurtis,
    address: GROUP_TREASURY_ADDRESSES.groupNFT,
  })

  const result = await readContract({
    contract,
    method: "function getTokenBoundAccount(uint256 tokenId) external view returns (address)",
    params: [groupId],
  })

  return result as string
}

// Make Deposit
export async function makeDeposit(
  account: any,
  groupId: bigint,
  amount: bigint
) {
  const contract = getContract({
    client,
    chain: apeChainCurtis,
    address: GROUP_TREASURY_ADDRESSES.manager,
  })

  const transaction = prepareContractCall({
    contract,
    method: "function makeDeposit(uint256 groupId) external payable",
    params: [groupId],
    value: amount,
  })

  const result = await sendTransaction({
    transaction,
    account,
  })

  return result
}

// Create Proposal
export async function createProposal(
  account: any,
  groupId: bigint,
  proposalType: ProposalType,
  data: string
) {
  const contract = getContract({
    client,
    chain: apeChainCurtis,
    address: GROUP_TREASURY_ADDRESSES.manager,
  })

  const transaction = prepareContractCall({
    contract,
    method: "function createProposal(uint256 groupId, uint8 proposalType, bytes memory data) external returns (uint256)",
    params: [groupId, proposalType, data as `0x${string}`],
  })

  const result = await sendTransaction({
    transaction,
    account,
  })

  return result
}

// Vote on Proposal
export async function voteOnProposal(
  account: any,
  proposalId: bigint,
  support: boolean
) {
  const contract = getContract({
    client,
    chain: apeChainCurtis,
    address: GROUP_TREASURY_ADDRESSES.manager,
  })

  const transaction = prepareContractCall({
    contract,
    method: "function vote(uint256 proposalId, bool support) external",
    params: [proposalId, support],
  })

  const result = await sendTransaction({
    transaction,
    account,
  })

  return result
}

// Execute Proposal
export async function executeProposal(account: any, proposalId: bigint) {
  const contract = getContract({
    client,
    chain: apeChainCurtis,
    address: GROUP_TREASURY_ADDRESSES.manager,
  })

  const transaction = prepareContractCall({
    contract,
    method: "function executeProposal(uint256 proposalId) external",
    params: [proposalId],
  })

  const result = await sendTransaction({
    transaction,
    account,
  })

  return result
}

// Get Group Members
export async function getGroupMembers(groupId: bigint): Promise<string[]> {
  const contract = getContract({
    client,
    chain: apeChainCurtis,
    address: GROUP_TREASURY_ADDRESSES.manager,
  })

  const result = await readContract({
    contract,
    method: "function getGroupMembers(uint256 groupId) external view returns (address[] memory)",
    params: [groupId],
  })

  return result as string[]
}

// Get Member Details
export async function getMember(groupId: bigint, wallet: string): Promise<Member> {
  const contract = getContract({
    client,
    chain: apeChainCurtis,
    address: GROUP_TREASURY_ADDRESSES.manager,
  })

  const result = await readContract({
    contract,
    method: "function getMember(uint256 groupId, address wallet) external view returns (tuple(address wallet, string name, uint256 joinedAt, uint256 depositAmount, bool hasDeposited, bool isActive))",
    params: [groupId, wallet as `0x${string}`],
  })

  return result as Member
}

// Get Group Proposals
export async function getGroupProposals(groupId: bigint): Promise<bigint[]> {
  const contract = getContract({
    client,
    chain: apeChainCurtis,
    address: GROUP_TREASURY_ADDRESSES.manager,
  })

  const result = await readContract({
    contract,
    method: "function getGroupProposals(uint256 groupId) external view returns (uint256[] memory)",
    params: [groupId],
  })

  return result as bigint[]
}

// Get Proposal Details
export async function getProposal(proposalId: bigint): Promise<Proposal> {
  const contract = getContract({
    client,
    chain: apeChainCurtis,
    address: GROUP_TREASURY_ADDRESSES.manager,
  })

  const result = await readContract({
    contract,
    method: "function getProposal(uint256 proposalId) external view returns (uint256 id, uint256 groupId, address proposer, uint8 proposalType, bytes memory data, uint256 votesFor, uint256 votesAgainst, uint256 createdAt, uint256 deadline, bool executed, bool cancelled)",
    params: [proposalId],
  })

  const [id, groupId, proposer, proposalType, data, votesFor, votesAgainst, createdAt, deadline, executed, cancelled] = result as any[]

  return {
    id,
    groupId,
    proposer,
    proposalType,
    data,
    votesFor,
    votesAgainst,
    createdAt,
    deadline,
    executed,
    cancelled,
  }
}

// Check if User Has Voted
export async function hasVoted(proposalId: bigint, voter: string): Promise<boolean> {
  const contract = getContract({
    client,
    chain: apeChainCurtis,
    address: GROUP_TREASURY_ADDRESSES.manager,
  })

  const result = await readContract({
    contract,
    method: "function hasVoted(uint256 proposalId, address voter) external view returns (bool)",
    params: [proposalId, voter as `0x${string}`],
  })

  return result as boolean
}

// Get Group Messages
export async function getGroupMessages(groupId: bigint): Promise<ChatMessage[]> {
  const contract = getContract({
    client,
    chain: apeChainCurtis,
    address: GROUP_TREASURY_ADDRESSES.chatRelay,
  })

  const result = await readContract({
    contract,
    method: "function getGroupMessages(uint256 groupId) external view returns (tuple(uint256 id, uint256 groupId, address sender, string content, uint256 timestamp, uint8 messageType, bool isBot)[] memory)",
    params: [groupId],
  })

  return result as ChatMessage[]
}

// Get Messages Paginated
export async function getGroupMessagesPaginated(
  groupId: bigint,
  offset: bigint,
  limit: bigint
): Promise<ChatMessage[]> {
  const contract = getContract({
    client,
    chain: apeChainCurtis,
    address: GROUP_TREASURY_ADDRESSES.chatRelay,
  })

  const result = await readContract({
    contract,
    method: "function getGroupMessagesPaginated(uint256 groupId, uint256 offset, uint256 limit) external view returns (tuple(uint256 id, uint256 groupId, address sender, string content, uint256 timestamp, uint8 messageType, bool isBot)[] memory)",
    params: [groupId, offset, limit],
  })

  return result as ChatMessage[]
}
