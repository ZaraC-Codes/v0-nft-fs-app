// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title GroupTreasuryNFT
 * @dev ERC721 NFT representing group treasury membership
 * Each group gets one NFT with a Token Bound Account (ERC6551)
 */
contract GroupTreasuryNFT is ERC721, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    // Group metadata
    struct GroupMetadata {
        string name;
        string description;
        address creator;
        uint256 createdAt;
        bool isPrivate;
        uint256 memberCount;
        uint256 requiredDeposit; // Deposit required to join (in wei)
    }

    // Mapping from token ID to group metadata
    mapping(uint256 => GroupMetadata) public groupMetadata;

    // Mapping from token ID to Token Bound Account address
    mapping(uint256 => address) public tokenBoundAccounts;

    event GroupCreated(
        uint256 indexed tokenId,
        address indexed creator,
        string name,
        address tbaAddress,
        uint256 requiredDeposit
    );

    constructor() ERC721("Fortuna Square Group Treasury", "FSGT") {}

    /**
     * @dev Mint a new group treasury NFT
     * @param to Address to mint the NFT to (group creator)
     * @param name Name of the group
     * @param description Description of the group
     * @param requiredDeposit Required deposit amount in wei (0 if no deposit required)
     * @return tokenId The ID of the newly minted NFT
     */
    function createGroup(
        address to,
        string memory name,
        string memory description,
        uint256 requiredDeposit
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);

        groupMetadata[tokenId] = GroupMetadata({
            name: name,
            description: description,
            creator: to,
            createdAt: block.timestamp,
            isPrivate: true, // All groups are private
            memberCount: 1, // Creator is first member
            requiredDeposit: requiredDeposit
        });

        return tokenId;
    }

    /**
     * @dev Set the Token Bound Account address for a group
     * @param tokenId The token ID
     * @param tbaAddress The Token Bound Account address
     */
    function setTokenBoundAccount(uint256 tokenId, address tbaAddress) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        tokenBoundAccounts[tokenId] = tbaAddress;

        emit GroupCreated(
            tokenId,
            groupMetadata[tokenId].creator,
            groupMetadata[tokenId].name,
            tbaAddress,
            groupMetadata[tokenId].requiredDeposit
        );
    }

    /**
     * @dev Update member count for a group
     * @param tokenId The token ID
     * @param memberCount New member count
     */
    function updateMemberCount(uint256 tokenId, uint256 memberCount) external {
        require(_exists(tokenId), "Token does not exist");
        require(
            msg.sender == owner() ||
            tokenBoundAccounts[tokenId] == msg.sender,
            "Not authorized"
        );

        groupMetadata[tokenId].memberCount = memberCount;
    }

    /**
     * @dev Get group metadata
     * @param tokenId The token ID
     */
    function getGroupMetadata(uint256 tokenId) external view returns (GroupMetadata memory) {
        require(_exists(tokenId), "Token does not exist");
        return groupMetadata[tokenId];
    }

    /**
     * @dev Get Token Bound Account address for a group
     * @param tokenId The token ID
     */
    function getTokenBoundAccount(uint256 tokenId) external view returns (address) {
        require(_exists(tokenId), "Token does not exist");
        return tokenBoundAccounts[tokenId];
    }

    /**
     * @dev Override tokenURI to return metadata
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        // In production, this would return a proper URI pointing to metadata
        // For now, return a placeholder
        return string(abi.encodePacked("https://fortuna-square.com/api/group/", toString(tokenId)));
    }

    /**
     * @dev Helper function to convert uint to string
     */
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
