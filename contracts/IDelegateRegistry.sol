// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IDelegateRegistry
 * @notice Interface for Delegate.cash v2 Registry
 * @dev See https://docs.delegate.xyz/
 *
 * Registry Address (all EVM chains): 0x00000000000000447e69651d841bD8D104Bed493
 *
 * Allows vault owners to delegate NFTs to hot wallets without transferring ownership.
 * Perfect for rentals - renter gets delegation rights, not actual NFT ownership.
 */
interface IDelegateRegistry {
    /**
     * @notice Delegate an ERC721 token to another address
     * @param to The address receiving delegation rights (the renter)
     * @param contract_ The NFT contract address
     * @param tokenId The specific token ID being delegated
     * @param rights Specific rights identifier (use bytes32(0) for all rights)
     * @param enable true to enable delegation, false to revoke
     * @return delegationHash Unique hash identifying this delegation
     */
    function delegateERC721(
        address to,
        address contract_,
        uint256 tokenId,
        bytes32 rights,
        bool enable
    ) external payable returns (bytes32 delegationHash);

    /**
     * @notice Check if an address has delegation rights for a specific ERC721 token
     * @param to The address to check (potential renter)
     * @param from The vault/owner address holding the NFT
     * @param contract_ The NFT contract address
     * @param tokenId The specific token ID
     * @param rights Specific rights identifier (use bytes32(0) for all rights)
     * @return bool true if delegation exists and is active
     */
    function checkDelegateForERC721(
        address to,
        address from,
        address contract_,
        uint256 tokenId,
        bytes32 rights
    ) external view returns (bool);

    /**
     * @notice Delegate all tokens from a contract to another address
     * @param to The address receiving delegation rights
     * @param contract_ The contract address
     * @param rights Specific rights identifier
     * @param enable true to enable, false to revoke
     * @return delegationHash Unique hash identifying this delegation
     */
    function delegateContract(
        address to,
        address contract_,
        bytes32 rights,
        bool enable
    ) external payable returns (bytes32 delegationHash);

    /**
     * @notice Delegate all assets to another address
     * @param to The address receiving delegation rights
     * @param rights Specific rights identifier
     * @param enable true to enable, false to revoke
     * @return delegationHash Unique hash identifying this delegation
     */
    function delegateAll(
        address to,
        bytes32 rights,
        bool enable
    ) external payable returns (bytes32 delegationHash);
}
