// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/interfaces/IERC1271.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "./IDelegateRegistry.sol";

/**
 * @title FortunaSquareRentalAccount
 * @notice Custom ERC6551 Token Bound Account for NFT rentals with Delegate.cash integration
 * @dev Each rental wrapper NFT gets its own instance of this account to hold the original NFT
 *
 * Key Features:
 * - Holds original NFT securely
 * - Only wrapper contract can execute calls (using context() for authorization)
 * - Integrates with Delegate.cash to delegate NFT to renters
 * - Auto-revokes delegation when rental expires
 */
contract FortunaSquareRentalAccount is IERC165, IERC1271, IERC721Receiver {
    // Delegate.cash v2 Registry (same address on all EVM chains)
    address public constant DELEGATE_REGISTRY = 0x00000000000000447e69651d841bD8D104Bed493;

    // EIP-1271 magic value for valid signatures
    bytes4 internal constant MAGICVALUE = 0x1626ba7e;

    /**
     * @notice Returns the owner of this account (the holder of the wrapper NFT)
     * @dev Extracted from ERC6551 context
     */
    function owner() public view returns (address) {
        (, address tokenContract, uint256 tokenId) = context();
        return IERC721(tokenContract).ownerOf(tokenId);
    }

    /**
     * @notice Executes a low-level call from this account
     * @dev Only callable by authorized addresses (wrapper contract or owner)
     * @param to Target address
     * @param value ETH value to send
     * @param data Calldata to execute
     * @return result The return data from the call
     */
    function executeCall(
        address to,
        uint256 value,
        bytes calldata data
    ) external payable returns (bytes memory result) {
        require(_isAuthorized(msg.sender), "NotAuthorized");

        bool success;
        (success, result) = to.call{value: value}(data);

        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    /**
     * @notice Delegates an ERC721 token to a renter via Delegate.cash
     * @dev Only callable by the wrapper contract when rental starts
     * @param delegate The renter receiving delegation rights
     * @param nftContract The original NFT contract address
     * @param tokenId The original NFT token ID
     * @param enable true to enable delegation, false to revoke
     */
    function delegateNFT(
        address delegate,
        address nftContract,
        uint256 tokenId,
        bool enable
    ) external {
        require(_isAuthorized(msg.sender), "NotAuthorized");

        // Call Delegate.cash registry to create/revoke delegation
        IDelegateRegistry(DELEGATE_REGISTRY).delegateERC721(
            delegate,       // Renter gets rights
            nftContract,    // Original NFT contract
            tokenId,        // Original NFT token ID
            bytes32(0),     // All rights (no specific subset)
            enable          // Enable or revoke
        );
    }

    /**
     * @notice Checks if a caller is authorized to execute calls from this account
     * @dev Uses ERC6551 context() to get wrapper contract address (learned from bundle system!)
     * @param caller The address attempting to call
     * @return bool true if authorized
     */
    function _isAuthorized(address caller) internal view returns (bool) {
        // Get the wrapper contract address from ERC6551 context
        // This is the tokenContract that owns this TBA
        (, address tokenContract, ) = context();

        // Wrapper contract can always call (for delegation and unwrapping)
        if (caller == tokenContract) return true;

        // Owner of wrapper can always call
        if (caller == owner()) return true;

        return false;
    }

    /**
     * @notice Returns the ERC6551 context (chain ID, token contract, token ID)
     * @dev Extracts data from the account's address suffix (EIP-6551 standard)
     * @return chainId The chain ID where the wrapper NFT exists
     * @return tokenContract The wrapper contract address
     * @return tokenId The wrapper token ID
     */
    function context() public view returns (uint256 chainId, address tokenContract, uint256 tokenId) {
        bytes memory footer = new bytes(0x60);

        assembly {
            extcodecopy(address(), add(footer, 0x20), 0x4d, 0x60)
        }

        return abi.decode(footer, (uint256, address, uint256));
    }

    /**
     * @notice EIP-1271 signature validation
     * @dev Validates signatures on behalf of this account
     */
    function isValidSignature(bytes32 hash, bytes memory signature)
        external
        view
        returns (bytes4 magicValue)
    {
        bool isValid = SignatureChecker.isValidSignatureNow(owner(), hash, signature);
        return isValid ? MAGICVALUE : bytes4(0);
    }

    /**
     * @notice ERC721 token receiver hook
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
     * @notice ERC165 interface detection
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return
            interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(IERC1271).interfaceId ||
            interfaceId == type(IERC721Receiver).interfaceId;
    }

    /**
     * @notice Allow account to receive ETH
     */
    receive() external payable {}
}
