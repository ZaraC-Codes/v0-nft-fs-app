// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TestERC1155
 * @dev Simple ERC1155 for marketplace testing
 */
contract TestERC1155 is ERC1155, Ownable {
    constructor() ERC1155("") Ownable(msg.sender) {}

    /**
     * @dev Mint tokens to any address
     */
    function mint(address to, uint256 id, uint256 amount) external {
        _mint(to, id, amount, "");
    }

    /**
     * @dev Batch mint multiple token types
     */
    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts) external {
        _mintBatch(to, ids, amounts, "");
    }
}
