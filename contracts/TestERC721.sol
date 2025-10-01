// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TestERC721
 * @dev Simple ERC721 for marketplace testing
 */
contract TestERC721 is ERC721, Ownable {
    uint256 private _nextTokenId;

    constructor() ERC721("Test NFT", "TEST") Ownable(msg.sender) {}

    /**
     * @dev Mint NFT to any address
     */
    function mint(address to) external returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        return tokenId;
    }

    /**
     * @dev Mint NFT with specific token ID (for testing)
     */
    function mintWithId(address to, uint256 tokenId) external {
        _safeMint(to, tokenId);
    }
}
