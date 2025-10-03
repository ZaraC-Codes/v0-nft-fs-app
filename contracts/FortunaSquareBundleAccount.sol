// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC1271.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title FortunaSquareBundleAccount
 * @dev Custom ERC-6551 implementation optimized for Fortuna Square bundles
 * Key improvements:
 * - Allows bundle contract to execute calls on behalf of owner
 * - Bundle-specific access controls
 * - Gas-optimized for common bundle operations
 * - Enhanced security features
 */
contract FortunaSquareBundleAccount is
    IERC165,
    IERC1271,
    IERC721Receiver,
    IERC1155Receiver,
    ReentrancyGuard
{
    // Storage slot for owner data (ERC-6551 standard)
    bytes32 private constant OWNER_SLOT = bytes32(uint256(keccak256("erc6551.owner")) - 1);

    // Mutable bundle contract address (can be set after deployment)
    address public bundleContract;
    address public immutable FACTORY; // Deployer address
    bool public initialized;

    error NotAuthorized();
    error InvalidOperation();
    error AlreadyInitialized();

    modifier onlyAuthorized() {
        if (!_isAuthorized(msg.sender)) revert NotAuthorized();
        _;
    }

    constructor() {
        FACTORY = msg.sender;
        bundleContract = address(0); // Start with zero address
        initialized = false;
    }

    /**
     * @dev Initialize with bundle contract address (one-time only)
     * Can only be called by deployer before initialization
     */
    function initialize(address _bundleContract) external {
        require(msg.sender == FACTORY && !initialized, "Cannot initialize");
        require(_bundleContract != address(0), "Invalid bundle contract");
        bundleContract = _bundleContract;
        initialized = true;
    }

    /**
     * @dev Enhanced authorization - allows both owner and bundle contract
     */
    function _isAuthorized(address caller) internal view returns (bool) {
        // During deployment phase, factory can call
        if (!initialized && caller == FACTORY) return true;

        // After initialization, bundle contract and owner can call
        if (initialized) {
            if (caller == bundleContract) return true;
            if (caller == owner()) return true;
        }

        return false;
    }

    /**
     * @dev Execute calls with enhanced authorization
     */
    function executeCall(
        address to,
        uint256 value,
        bytes calldata data
    ) external payable nonReentrant onlyAuthorized returns (bytes memory result) {
        require(to != address(this), "Cannot call self");
        require(to != address(0), "Invalid target");

        bool success;
        (success, result) = to.call{value: value}(data);

        if (!success) {
            // Forward revert reason
            assembly {
                revert(add(result, 32), mload(result))
            }
        }

        return result;
    }

    /**
     * @dev Batch execute multiple calls (gas optimization for bundles)
     */
    function executeBatch(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata datas
    ) external payable nonReentrant onlyAuthorized returns (bytes[] memory results) {
        require(targets.length == values.length && values.length == datas.length, "Length mismatch");

        results = new bytes[](targets.length);

        for (uint256 i = 0; i < targets.length; i++) {
            require(targets[i] != address(this), "Cannot call self");
            require(targets[i] != address(0), "Invalid target");

            bool success;
            (success, results[i]) = targets[i].call{value: values[i]}(datas[i]);

            if (!success) {
                // Forward revert reason
                bytes memory result = results[i];
                assembly {
                    revert(add(result, 32), mload(result))
                }
            }
        }

        return results;
    }

    /**
     * @dev Get the owner of this account (ERC-6551 standard)
     */
    function owner() public view returns (address) {
        (uint256 chainId, address tokenContract, uint256 tokenId) = context();
        if (chainId != block.chainid) return address(0);

        return IERC721(tokenContract).ownerOf(tokenId);
    }

    /**
     * @dev Get account context (ERC-6551 standard)
     */
    function context() public view returns (uint256, address, uint256) {
        bytes memory footer = new bytes(0x60);

        assembly {
            extcodecopy(address(), add(footer, 0x20), 0x4d, 0x60)
        }

        return abi.decode(footer, (uint256, address, uint256));
    }

    /**
     * @dev ERC-1271 signature validation
     */
    function isValidSignature(bytes32 hash, bytes memory signature)
        external
        view
        returns (bytes4)
    {
        bool isValid = SignatureChecker.isValidSignatureNow(owner(), hash, signature);
        if (isValid) {
            return IERC1271.isValidSignature.selector;
        }
        return bytes4(0);
    }

    // Required interface implementations
    function onERC721Received(address, address, uint256, bytes memory)
        external
        pure
        returns (bytes4)
    {
        return IERC721Receiver.onERC721Received.selector;
    }

    function onERC1155Received(address, address, uint256, uint256, bytes memory)
        external
        pure
        returns (bytes4)
    {
        return IERC1155Receiver.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) external pure returns (bytes4) {
        return IERC1155Receiver.onERC1155BatchReceived.selector;
    }

    function supportsInterface(bytes4 interfaceId)
        external
        pure
        returns (bool)
    {
        return
            interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(IERC1271).interfaceId ||
            interfaceId == type(IERC721Receiver).interfaceId ||
            interfaceId == type(IERC1155Receiver).interfaceId;
    }

    // Allow contract to receive ETH
    receive() external payable {}
}
