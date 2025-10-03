// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title GroupTreasuryManager
 * @dev Manages group treasury operations including:
 * - Member management with voting
 * - Transaction proposals and voting (90% threshold)
 * - Deposit tracking
 * - AI bot commands execution
 */
contract GroupTreasuryManager is IERC721Receiver, ReentrancyGuard {

    // Member structure
    struct Member {
        address wallet;
        string name;
        uint256 joinedAt;
        uint256 depositAmount;
        bool hasDeposited;
        bool isActive;
    }

    // Proposal structure
    struct Proposal {
        uint256 id;
        uint256 groupId;
        address proposer;
        ProposalType proposalType;
        bytes data; // Encoded proposal data
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 createdAt;
        uint256 deadline;
        bool executed;
        bool cancelled;
        mapping(address => bool) hasVoted;
    }

    enum ProposalType {
        BUY_NFT,
        SELL_NFT,
        RENT_NFT,
        SWAP_NFT,
        TRANSFER_FUNDS,
        ADD_MEMBER,
        REMOVE_MEMBER,
        WITHDRAW_MEMBER
    }

    // State variables
    address public groupNFTContract;
    uint256 private proposalCounter;

    // Mappings
    mapping(uint256 => mapping(address => Member)) public groupMembers; // groupId => wallet => Member
    mapping(uint256 => address[]) public groupMemberList; // groupId => member addresses
    mapping(uint256 => Proposal) public proposals; // proposalId => Proposal
    mapping(uint256 => uint256[]) public groupProposals; // groupId => proposalIds

    // Constants
    uint256 public constant VOTE_THRESHOLD_PERCENT = 90; // 90% approval required
    uint256 public constant PROPOSAL_DURATION = 7 days;

    // Events
    event MemberAdded(uint256 indexed groupId, address indexed member, string name);
    event MemberRemoved(uint256 indexed groupId, address indexed member);
    event DepositMade(uint256 indexed groupId, address indexed member, uint256 amount);
    event ProposalCreated(
        uint256 indexed proposalId,
        uint256 indexed groupId,
        address indexed proposer,
        ProposalType proposalType
    );
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support
    );
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);

    constructor(address _groupNFTContract) {
        groupNFTContract = _groupNFTContract;
    }

    /**
     * @dev Initialize group with creator as first member
     */
    function initializeGroup(
        uint256 groupId,
        address creator,
        string memory creatorName
    ) external {
        require(groupMembers[groupId][creator].wallet == address(0), "Group already initialized");

        _addMember(groupId, creator, creatorName, 0, true);
    }

    /**
     * @dev Add a member to the group (internal)
     */
    function _addMember(
        uint256 groupId,
        address wallet,
        string memory name,
        uint256 depositAmount,
        bool hasDeposited
    ) internal {
        require(groupMembers[groupId][wallet].wallet == address(0), "Member already exists");

        groupMembers[groupId][wallet] = Member({
            wallet: wallet,
            name: name,
            joinedAt: block.timestamp,
            depositAmount: depositAmount,
            hasDeposited: hasDeposited,
            isActive: true
        });

        groupMemberList[groupId].push(wallet);

        emit MemberAdded(groupId, wallet, name);
    }

    /**
     * @dev Make deposit as a member
     */
    function makeDeposit(uint256 groupId) external payable {
        Member storage member = groupMembers[groupId][msg.sender];
        require(member.wallet != address(0), "Not a member");
        require(!member.hasDeposited, "Already deposited");
        require(msg.value > 0, "Deposit amount must be greater than 0");

        member.depositAmount = msg.value;
        member.hasDeposited = true;

        emit DepositMade(groupId, msg.sender, msg.value);
    }

    /**
     * @dev Create a proposal
     */
    function createProposal(
        uint256 groupId,
        ProposalType proposalType,
        bytes memory data
    ) external returns (uint256) {
        Member storage member = groupMembers[groupId][msg.sender];
        require(member.isActive, "Not an active member");

        uint256 proposalId = proposalCounter++;

        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.groupId = groupId;
        proposal.proposer = msg.sender;
        proposal.proposalType = proposalType;
        proposal.data = data;
        proposal.votesFor = 0;
        proposal.votesAgainst = 0;
        proposal.createdAt = block.timestamp;
        proposal.deadline = block.timestamp + PROPOSAL_DURATION;
        proposal.executed = false;
        proposal.cancelled = false;

        groupProposals[groupId].push(proposalId);

        emit ProposalCreated(proposalId, groupId, msg.sender, proposalType);

        return proposalId;
    }

    /**
     * @dev Vote on a proposal
     */
    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp < proposal.deadline, "Voting period ended");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.cancelled, "Proposal cancelled");

        Member storage member = groupMembers[proposal.groupId][msg.sender];
        require(member.isActive, "Not an active member");
        require(!proposal.hasVoted[msg.sender], "Already voted");

        proposal.hasVoted[msg.sender] = true;

        if (support) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }

        emit VoteCast(proposalId, msg.sender, support);
    }

    /**
     * @dev Execute a proposal if it has reached the vote threshold
     */
    function executeProposal(uint256 proposalId) external nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Already executed");
        require(!proposal.cancelled, "Proposal cancelled");

        uint256 totalMembers = groupMemberList[proposal.groupId].length;
        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;

        // Check if voting period ended or all members voted
        require(
            block.timestamp >= proposal.deadline || totalVotes == totalMembers,
            "Voting not complete"
        );

        // Calculate percentage (multiply by 100 for percentage)
        uint256 approvalPercent = (proposal.votesFor * 100) / totalMembers;
        require(approvalPercent >= VOTE_THRESHOLD_PERCENT, "Not enough votes");

        proposal.executed = true;

        // Execute proposal based on type
        _executeProposalAction(proposal);

        emit ProposalExecuted(proposalId);
    }

    /**
     * @dev Internal function to execute proposal action
     */
    function _executeProposalAction(Proposal storage proposal) internal {
        if (proposal.proposalType == ProposalType.ADD_MEMBER) {
            (address wallet, string memory name) = abi.decode(proposal.data, (address, string));
            _addMember(proposal.groupId, wallet, name, 0, false);
        } else if (proposal.proposalType == ProposalType.REMOVE_MEMBER) {
            address memberToRemove = abi.decode(proposal.data, (address));
            _removeMember(proposal.groupId, memberToRemove);
        } else if (proposal.proposalType == ProposalType.WITHDRAW_MEMBER) {
            _removeMember(proposal.groupId, proposal.proposer);
        }
        // Other proposal types (BUY, SELL, RENT, SWAP) handled by external contracts
    }

    /**
     * @dev Remove a member from the group
     */
    function _removeMember(uint256 groupId, address wallet) internal {
        Member storage member = groupMembers[groupId][wallet];
        require(member.isActive, "Member not active");

        member.isActive = false;

        emit MemberRemoved(groupId, wallet);
    }

    /**
     * @dev Get member count for a group
     */
    function getMemberCount(uint256 groupId) external view returns (uint256) {
        uint256 activeCount = 0;
        address[] memory members = groupMemberList[groupId];

        for (uint256 i = 0; i < members.length; i++) {
            if (groupMembers[groupId][members[i]].isActive) {
                activeCount++;
            }
        }

        return activeCount;
    }

    /**
     * @dev Get all members for a group
     */
    function getGroupMembers(uint256 groupId) external view returns (address[] memory) {
        return groupMemberList[groupId];
    }

    /**
     * @dev Get member details
     */
    function getMember(uint256 groupId, address wallet) external view returns (Member memory) {
        return groupMembers[groupId][wallet];
    }

    /**
     * @dev Get proposal details
     */
    function getProposal(uint256 proposalId) external view returns (
        uint256 id,
        uint256 groupId,
        address proposer,
        ProposalType proposalType,
        bytes memory data,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 createdAt,
        uint256 deadline,
        bool executed,
        bool cancelled
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.id,
            proposal.groupId,
            proposal.proposer,
            proposal.proposalType,
            proposal.data,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.createdAt,
            proposal.deadline,
            proposal.executed,
            proposal.cancelled
        );
    }

    /**
     * @dev Check if an address has voted on a proposal
     */
    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }

    /**
     * @dev Get all proposals for a group
     */
    function getGroupProposals(uint256 groupId) external view returns (uint256[] memory) {
        return groupProposals[groupId];
    }

    /**
     * @dev Required by IERC721Receiver
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
}
