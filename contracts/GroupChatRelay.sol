// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GroupChatRelay
 * @dev Handles gasless chat messages for group treasuries
 * Messages are stored on-chain with encrypted content
 * Backend relayer submits transactions with gas sponsorship
 */
contract GroupChatRelay {

    struct Message {
        uint256 id;
        uint256 groupId;
        address sender;
        string content; // Encrypted message content
        uint256 timestamp;
        MessageType messageType;
        bool isBot;
    }

    enum MessageType {
        REGULAR,
        COMMAND,
        BOT_RESPONSE,
        SYSTEM,
        PROPOSAL
    }

    // State variables
    uint256 private messageCounter;
    address public relayer; // Backend relayer address
    address public groupManager; // GroupTreasuryManager contract

    // Mappings
    mapping(uint256 => Message[]) public groupMessages; // groupId => messages
    mapping(address => bool) public authorizedRelayers; // Authorized relayers for gas sponsorship

    // Events
    event MessageSent(
        uint256 indexed messageId,
        uint256 indexed groupId,
        address indexed sender,
        MessageType messageType,
        uint256 timestamp
    );
    event BotMessageSent(
        uint256 indexed messageId,
        uint256 indexed groupId,
        string content,
        uint256 timestamp
    );
    event RelayerAuthorized(address indexed relayer);
    event RelayerRevoked(address indexed relayer);

    modifier onlyRelayer() {
        require(authorizedRelayers[msg.sender], "Not an authorized relayer");
        _;
    }

    constructor(address _groupManager) {
        groupManager = _groupManager;
        relayer = msg.sender;
        authorizedRelayers[msg.sender] = true;
    }

    /**
     * @dev Send a message to a group chat (called by backend relayer)
     * This enables gasless transactions for users
     */
    function sendMessage(
        uint256 groupId,
        address sender,
        string memory content,
        MessageType messageType
    ) external onlyRelayer returns (uint256) {
        uint256 messageId = messageCounter++;

        Message memory newMessage = Message({
            id: messageId,
            groupId: groupId,
            sender: sender,
            content: content,
            timestamp: block.timestamp,
            messageType: messageType,
            isBot: false
        });

        groupMessages[groupId].push(newMessage);

        emit MessageSent(messageId, groupId, sender, messageType, block.timestamp);

        return messageId;
    }

    /**
     * @dev Send a bot message (AI responses)
     */
    function sendBotMessage(
        uint256 groupId,
        string memory content,
        MessageType messageType
    ) external onlyRelayer returns (uint256) {
        uint256 messageId = messageCounter++;

        Message memory newMessage = Message({
            id: messageId,
            groupId: groupId,
            sender: address(this), // Bot is the sender
            content: content,
            timestamp: block.timestamp,
            messageType: messageType,
            isBot: true
        });

        groupMessages[groupId].push(newMessage);

        emit BotMessageSent(messageId, groupId, content, block.timestamp);

        return messageId;
    }

    /**
     * @dev Send a system message (e.g., member joined/left)
     */
    function sendSystemMessage(
        uint256 groupId,
        string memory content
    ) external onlyRelayer returns (uint256) {
        uint256 messageId = messageCounter++;

        Message memory newMessage = Message({
            id: messageId,
            groupId: groupId,
            sender: address(0), // System message
            content: content,
            timestamp: block.timestamp,
            messageType: MessageType.SYSTEM,
            isBot: false
        });

        groupMessages[groupId].push(newMessage);

        emit MessageSent(messageId, groupId, address(0), MessageType.SYSTEM, block.timestamp);

        return messageId;
    }

    /**
     * @dev Get all messages for a group
     */
    function getGroupMessages(uint256 groupId) external view returns (Message[] memory) {
        return groupMessages[groupId];
    }

    /**
     * @dev Get messages for a group with pagination
     */
    function getGroupMessagesPaginated(
        uint256 groupId,
        uint256 offset,
        uint256 limit
    ) external view returns (Message[] memory) {
        Message[] storage allMessages = groupMessages[groupId];
        uint256 totalMessages = allMessages.length;

        if (offset >= totalMessages) {
            return new Message[](0);
        }

        uint256 end = offset + limit;
        if (end > totalMessages) {
            end = totalMessages;
        }

        uint256 resultLength = end - offset;
        Message[] memory result = new Message[](resultLength);

        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = allMessages[offset + i];
        }

        return result;
    }

    /**
     * @dev Get message count for a group
     */
    function getMessageCount(uint256 groupId) external view returns (uint256) {
        return groupMessages[groupId].length;
    }

    /**
     * @dev Authorize a relayer for gasless transactions
     */
    function authorizeRelayer(address _relayer) external {
        require(msg.sender == relayer, "Only main relayer can authorize");
        authorizedRelayers[_relayer] = true;
        emit RelayerAuthorized(_relayer);
    }

    /**
     * @dev Revoke a relayer
     */
    function revokeRelayer(address _relayer) external {
        require(msg.sender == relayer, "Only main relayer can revoke");
        authorizedRelayers[_relayer] = false;
        emit RelayerRevoked(_relayer);
    }

    /**
     * @dev Update main relayer
     */
    function updateRelayer(address _newRelayer) external {
        require(msg.sender == relayer, "Only current relayer can update");
        relayer = _newRelayer;
        authorizedRelayers[_newRelayer] = true;
    }
}
