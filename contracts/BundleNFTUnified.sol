// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
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

/**
 * @title BundleNFTUnified
 * @dev Unified contract that is both the ERC721 bundle NFT and the bundle manager
 * This eliminates permission issues by having one contract control everything
 */
contract BundleNFTUnified is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard, IERC721Receiver {
    uint256 private _tokenIdCounter;

    // ERC6551 configuration
    IERC6551Registry public immutable registry;
    address public immutable accountImplementation;
    bytes32 public constant ACCOUNT_SALT = bytes32(0);

    // Bundle metadata
    struct BundleMetadata {
        string name;
        uint256 itemCount;
        uint256 createdAt;
        address creator;
        bool exists;
    }

    // Mapping from token ID to bundle metadata
    mapping(uint256 => BundleMetadata) public bundles;

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
    ) ERC721("Fortuna Square Bundle", "FSB") Ownable(msg.sender) {
        require(_registry != address(0), "Invalid registry");
        require(_accountImplementation != address(0), "Invalid implementation");

        registry = IERC6551Registry(_registry);
        accountImplementation = _accountImplementation;
    }

    /**
     * @dev Create a new bundle from multiple NFTs
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

        // Mint the bundle NFT to this contract first
        bundleId = _tokenIdCounter;
        unchecked {
            _tokenIdCounter++;
        }

        _safeMint(address(this), bundleId);
        _setTokenURI(bundleId, bundleTokenURI);

        bundles[bundleId] = BundleMetadata({
            name: bundleName,
            itemCount: nftContracts.length,
            createdAt: block.timestamp,
            creator: msg.sender,
            exists: true
        });

        // Create ERC6551 account for the bundle
        accountAddress = registry.createAccount(
            accountImplementation,
            ACCOUNT_SALT,
            block.chainid,
            address(this),
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

        // Transfer bundle NFT to the creator
        _transfer(address(this), msg.sender, bundleId);
    }

    /**
     * @dev Withdraw specific NFTs from a bundle without unwrapping
     */
    function withdrawFromBundle(
        uint256 bundleId,
        address[] calldata nftContracts,
        uint256[] calldata tokenIds,
        address recipient
    ) external nonReentrant {
        require(bundles[bundleId].exists, "Bundle does not exist");
        require(ownerOf(bundleId) == msg.sender, "Not bundle owner");
        require(nftContracts.length == tokenIds.length, "Array length mismatch");

        address tbaAddress = getBundleAccount(bundleId);
        IERC6551Account tba = IERC6551Account(tbaAddress);

        // Transfer each NFT out of the TBA
        for (uint256 i = 0; i < nftContracts.length; i++) {
            bytes memory transferData = abi.encodeWithSignature(
                "safeTransferFrom(address,address,uint256)",
                tbaAddress,
                recipient,
                tokenIds[i]
            );

            tba.executeCall(nftContracts[i], 0, transferData);
        }

        // Update bundle metadata
        bundles[bundleId].itemCount -= nftContracts.length;
    }

    /**
     * @dev Unwrap a bundle - transfers all NFTs to owner and burns bundle
     */
    function unwrapBundle(
        uint256 bundleId,
        address[] calldata nftContracts,
        uint256[] calldata tokenIds
    ) external nonReentrant {
        require(bundles[bundleId].exists, "Bundle does not exist");

        // Verify caller owns the bundle
        address bundleOwner = ownerOf(bundleId);
        require(msg.sender == bundleOwner, "Not bundle owner");
        require(nftContracts.length == tokenIds.length, "Array length mismatch");

        address tbaAddress = getBundleAccount(bundleId);
        IERC6551Account tba = IERC6551Account(tbaAddress);

        // Transfer all NFTs from TBA to bundle owner
        for (uint256 i = 0; i < nftContracts.length; i++) {
            bytes memory transferData = abi.encodeWithSignature(
                "safeTransferFrom(address,address,uint256)",
                tbaAddress,
                bundleOwner,
                tokenIds[i]
            );

            tba.executeCall(nftContracts[i], 0, transferData);
        }

        emit BundleUnwrapped(bundleId, bundleOwner, nftContracts, tokenIds);

        // Burn the bundle NFT
        delete bundles[bundleId];
        _burn(bundleId);
    }

    /**
     * @dev Get the ERC6551 account address for a bundle
     */
    function getBundleAccount(uint256 bundleId) public view returns (address) {
        return registry.account(
            accountImplementation,
            ACCOUNT_SALT,
            block.chainid,
            address(this),
            bundleId
        );
    }

    /**
     * @dev Check if a bundle account has been created
     */
    function bundleAccountExists(uint256 bundleId) external view returns (bool) {
        address accountAddress = getBundleAccount(bundleId);
        return accountAddress.code.length > 0;
    }

    /**
     * @dev Get bundle metadata
     */
    function getBundleMetadata(uint256 tokenId)
        external
        view
        returns (BundleMetadata memory)
    {
        require(bundles[tokenId].exists, "Bundle does not exist");
        return bundles[tokenId];
    }

    /**
     * @dev Check if a bundle exists
     */
    function bundleExists(uint256 tokenId) external view returns (bool) {
        return bundles[tokenId].exists;
    }

    /**
     * @dev Get total number of bundles created
     */
    function totalBundles() external view returns (uint256) {
        return _tokenIdCounter;
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

    // Override required functions
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
