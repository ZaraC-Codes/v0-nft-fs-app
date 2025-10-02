// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// ERC6551 Registry interface
interface IERC6551Registry {
    function createAccount(
        address implementation,
        bytes32 salt,
        uint256 chainId,
        address tokenContract,
        uint256 tokenId
    ) external returns (address);

    function account(
        address implementation,
        bytes32 salt,
        uint256 chainId,
        address tokenContract,
        uint256 tokenId
    ) external view returns (address);
}

// ERC6551 Account interface
interface IERC6551Account {
    function executeCall(
        address to,
        uint256 value,
        bytes calldata data
    ) external payable returns (bytes memory);
}

// Bundle NFT interface
interface IBundleNFT {
    function mintBundle(
        address to,
        string memory bundleName,
        uint256 itemCount,
        string memory tokenURI
    ) external returns (uint256);

    function burnBundle(uint256 tokenId) external;

    function ownerOf(uint256 tokenId) external view returns (address);
}

/**
 * @title BundleManager
 * @dev Manages the creation and unwrapping of NFT bundles using ERC6551 Token Bound Accounts
 */
contract BundleManager is Ownable, ReentrancyGuard, IERC721Receiver {
    // ERC6551 Registry and Account Implementation
    IERC6551Registry public immutable registry;
    address public immutable accountImplementation;

    // Bundle NFT contract
    IBundleNFT public bundleNFT;

    // Salt for deterministic account creation
    bytes32 public constant ACCOUNT_SALT = bytes32(0);

    // Events
    event BundleCreated(
        uint256 indexed bundleId,
        address indexed creator,
        address accountAddress,
        address[] nftContracts,
        uint256[] tokenIds
    );

    event BundleUnwrapped(
        uint256 indexed bundleId,
        address indexed owner,
        address[] nftContracts,
        uint256[] tokenIds
    );

    event NFTDeposited(
        uint256 indexed bundleId,
        address indexed nftContract,
        uint256 indexed tokenId
    );

    constructor(
        address _registry,
        address _accountImplementation
    ) Ownable(msg.sender) {
        require(_registry != address(0), "Invalid registry");
        require(_accountImplementation != address(0), "Invalid implementation");

        registry = IERC6551Registry(_registry);
        accountImplementation = _accountImplementation;
    }

    /**
     * @dev Set the BundleNFT contract address
     */
    function setBundleNFT(address _bundleNFT) external onlyOwner {
        require(_bundleNFT != address(0), "Invalid address");
        bundleNFT = IBundleNFT(_bundleNFT);
    }

    /**
     * @dev Create a new bundle from multiple NFTs
     * @param nftContracts Array of NFT contract addresses
     * @param tokenIds Array of token IDs (must match nftContracts length)
     * @param bundleName Name for the bundle
     * @param bundleTokenURI Metadata URI for the bundle
     * @return bundleId The ID of the created bundle
     * @return accountAddress The ERC6551 account address
     */
    function createBundle(
        address[] calldata nftContracts,
        uint256[] calldata tokenIds,
        string calldata bundleName,
        string calldata bundleTokenURI
    ) external nonReentrant returns (uint256 bundleId, address accountAddress) {
        require(nftContracts.length > 0, "Must bundle at least 1 NFT");
        require(nftContracts.length == tokenIds.length, "Array length mismatch");
        require(nftContracts.length <= 50, "Too many NFTs (max 50)");
        require(bytes(bundleName).length > 0, "Bundle name required");

        // Mint the bundle NFT
        bundleId = bundleNFT.mintBundle(
            msg.sender,
            bundleName,
            nftContracts.length,
            bundleTokenURI
        );

        // Create ERC6551 account for the bundle
        accountAddress = registry.createAccount(
            accountImplementation,
            ACCOUNT_SALT,
            block.chainid,
            address(bundleNFT),
            bundleId
        );

        // Transfer all NFTs into the bundle's TBA
        for (uint256 i = 0; i < nftContracts.length; i++) {
            IERC721 nft = IERC721(nftContracts[i]);

            // Verify caller owns the NFT
            require(
                nft.ownerOf(tokenIds[i]) == msg.sender,
                "Not NFT owner"
            );

            // Transfer NFT to the TBA
            nft.safeTransferFrom(msg.sender, accountAddress, tokenIds[i]);

            emit NFTDeposited(bundleId, nftContracts[i], tokenIds[i]);
        }

        emit BundleCreated(
            bundleId,
            msg.sender,
            accountAddress,
            nftContracts,
            tokenIds
        );
    }

    /**
     * @dev Batch approve multiple NFTs for transfer
     * Helper function to make bundle creation easier
     * Note: Each NFT contract must implement setApprovalForAll
     * @param nftContracts Array of NFT contracts to approve
     */
    function batchApproveNFTs(
        address[] calldata nftContracts
    ) external {
        for (uint256 i = 0; i < nftContracts.length; i++) {
            IERC721(nftContracts[i]).setApprovalForAll(address(this), true);
        }
    }

    /**
     * @dev Unwrap a bundle, returning all NFTs to the owner and burning the bundle
     * The bundle owner calls this directly. The TBA must have approved this contract
     * to transfer the NFTs, OR the bundle owner controls the TBA.
     * @param bundleId The ID of the bundle to unwrap
     * @param nftContracts Array of NFT contract addresses in the bundle
     * @param tokenIds Array of token IDs in the bundle
     */
    function unwrapBundle(
        uint256 bundleId,
        address[] calldata nftContracts,
        uint256[] calldata tokenIds
    ) external nonReentrant {
        require(nftContracts.length > 0, "Must specify NFTs");
        require(nftContracts.length == tokenIds.length, "Array length mismatch");

        // Verify caller owns the bundle
        address bundleOwner = bundleNFT.ownerOf(bundleId);
        require(msg.sender == bundleOwner, "Not bundle owner");

        // Get the TBA address
        address accountAddress = getBundleAccount(bundleId);

        // Transfer all NFTs from TBA to owner
        // This will succeed if:
        // 1. The TBA has approved this contract for all NFTs, OR
        // 2. The individual NFTs have been approved, OR
        // 3. The bundle owner is also the TBA owner (which they are by default)
        for (uint256 i = 0; i < nftContracts.length; i++) {
            IERC721 nft = IERC721(nftContracts[i]);

            // Try to transfer - this will revert if we don't have permission
            // The TBA is controlled by the bundle owner, so owner can approve this contract
            nft.transferFrom(accountAddress, bundleOwner, tokenIds[i]);
        }

        emit BundleUnwrapped(bundleId, bundleOwner, nftContracts, tokenIds);

        // Burn the bundle NFT
        bundleNFT.burnBundle(bundleId);
    }

    /**
     * @dev Helper function to approve BundleManager to manage TBA's NFTs
     * Bundle owner calls this via TBA.executeCall to grant permissions for unwrapping
     * @param bundleId The bundle ID
     * @param nftContracts Array of NFT contracts to approve
     */
    function approveBundleManagerForUnwrap(
        uint256 bundleId,
        address[] calldata nftContracts
    ) external {
        // Get the TBA address
        address accountAddress = getBundleAccount(bundleId);

        // This function must be called BY the TBA (via executeCall)
        require(msg.sender == accountAddress, "Must be called by TBA");

        // Approve BundleManager to transfer all NFTs from this TBA
        for (uint256 i = 0; i < nftContracts.length; i++) {
            IERC721(nftContracts[i]).setApprovalForAll(address(this), true);
        }
    }

    /**
     * @dev Get the ERC6551 account address for a bundle
     * @param bundleId The bundle token ID
     * @return The TBA address for this bundle
     */
    function getBundleAccount(uint256 bundleId) public view returns (address) {
        return registry.account(
            accountImplementation,
            ACCOUNT_SALT,
            block.chainid,
            address(bundleNFT),
            bundleId
        );
    }

    /**
     * @dev Check if a bundle account has been created
     * @param bundleId The bundle token ID
     * @return Whether the account exists (has code)
     */
    function bundleAccountExists(uint256 bundleId) external view returns (bool) {
        address accountAddress = getBundleAccount(bundleId);
        return accountAddress.code.length > 0;
    }

    /**
     * @dev Required to receive NFTs
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}