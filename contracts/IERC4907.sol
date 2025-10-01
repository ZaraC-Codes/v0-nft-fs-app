// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IERC4907
 * @notice Interface for ERC4907 - Rental NFT Standard
 * @dev See https://eips.ethereum.org/EIPS/eip-4907
 *
 * Separates ownership from usage rights:
 * - owner: The actual owner who can sell/transfer the NFT
 * - user: Temporary user who can use the NFT but cannot transfer it
 */
interface IERC4907 {
    /**
     * @notice Emitted when the user of an NFT is changed or expires
     * @param tokenId The NFT that changed user
     * @param user The new user address (0x0 if no user)
     * @param expires The timestamp when user rights expire
     */
    event UpdateUser(uint256 indexed tokenId, address indexed user, uint64 expires);

    /**
     * @notice Set the user and expiration time for an NFT
     * @dev The zero address indicates there is no user
     * @param tokenId The NFT to set user for
     * @param user The new user address
     * @param expires UNIX timestamp when user rights expire
     */
    function setUser(uint256 tokenId, address user, uint64 expires) external;

    /**
     * @notice Get the current user of an NFT
     * @dev Returns zero address if no user or if expired
     * @param tokenId The NFT to query
     * @return address The current user address
     */
    function userOf(uint256 tokenId) external view returns (address);

    /**
     * @notice Get the expiration timestamp of the user
     * @dev Returns 0 if no user
     * @param tokenId The NFT to query
     * @return uint64 UNIX timestamp when user rights expire
     */
    function userExpires(uint256 tokenId) external view returns (uint64);
}