// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BundleNFT
 * @dev ERC721 token representing a bundle of NFTs
 * Each token is backed by an ERC6551 Token Bound Account that holds the bundled NFTs
 */
contract BundleNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

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

    // Address allowed to mint (BundleManager contract)
    address public bundleManager;

    // Events
    event BundleCreated(
        uint256 indexed tokenId,
        address indexed creator,
        string name,
        uint256 itemCount,
        address accountAddress
    );

    event BundleUnwrapped(
        uint256 indexed tokenId,
        address indexed owner
    );

    constructor() ERC721("Fortuna Square Bundle", "FSB") Ownable(msg.sender) {}

    /**
     * @dev Set the bundle manager address (only owner can call)
     */
    function setBundleManager(address _bundleManager) external onlyOwner {
        require(_bundleManager != address(0), "Invalid address");
        bundleManager = _bundleManager;
    }

    /**
     * @dev Mint a new bundle NFT
     * @param to Address to mint to
     * @param bundleName Name of the bundle
     * @param itemCount Number of items in the bundle
     * @param tokenURI Metadata URI for the bundle
     * @return tokenId The ID of the newly minted bundle
     */
    function mintBundle(
        address to,
        string memory bundleName,
        uint256 itemCount,
        string memory tokenURI
    ) external returns (uint256) {
        require(msg.sender == bundleManager, "Only bundle manager can mint");
        require(bytes(bundleName).length > 0, "Bundle name required");
        require(itemCount > 0, "Item count must be > 0");

        uint256 tokenId = _tokenIdCounter;
        unchecked {
            _tokenIdCounter++;
        }

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        bundles[tokenId] = BundleMetadata({
            name: bundleName,
            itemCount: itemCount,
            createdAt: block.timestamp,
            creator: to,
            exists: true
        });

        return tokenId;
    }

    /**
     * @dev Burn a bundle NFT (called when unwrapping)
     * @param tokenId The ID of the bundle to burn
     */
    function burnBundle(uint256 tokenId) external {
        require(msg.sender == bundleManager, "Only bundle manager can burn");
        require(bundles[tokenId].exists, "Bundle does not exist");

        address owner = ownerOf(tokenId);

        delete bundles[tokenId];
        _burn(tokenId);

        emit BundleUnwrapped(tokenId, owner);
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