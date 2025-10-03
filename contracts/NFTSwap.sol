// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NFTSwap
 * @notice A trustless NFT swap contract for Fortuna Square marketplace
 * @dev Allows users to list NFTs for swap with specific criteria and execute atomic swaps
 */
contract NFTSwap is ReentrancyGuard, Ownable {
    // Struct to store swap listing details
    struct SwapListing {
        address lister;              // Address of the user listing their NFT
        address nftContract;         // Contract address of the listed NFT
        uint256 tokenId;            // Token ID of the listed NFT
        address wantedNftContract;  // Contract address of the wanted NFT collection
        uint256 wantedTokenId;      // Token ID wanted (0 means "Any")
        bool isActive;              // Whether the listing is still active
        uint256 createdAt;          // Timestamp of listing creation
        uint256 expiresAt;          // Expiration timestamp
    }

    // Storage
    uint256 private _listingIdCounter;
    mapping(uint256 => SwapListing) public swapListings;
    mapping(address => mapping(uint256 => uint256)) public nftToListingId; // NFT contract + tokenId => listingId

    // Events
    event SwapListingCreated(
        uint256 indexed listingId,
        address indexed lister,
        address nftContract,
        uint256 tokenId,
        address wantedNftContract,
        uint256 wantedTokenId,
        uint256 expiresAt
    );

    event SwapExecuted(
        uint256 indexed listingId,
        address indexed lister,
        address indexed swapper,
        address listerNftContract,
        uint256 listerTokenId,
        address swapperNftContract,
        uint256 swapperTokenId
    );

    event SwapListingCancelled(
        uint256 indexed listingId,
        address indexed lister
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Create a new swap listing
     * @param nftContract Address of the NFT contract you want to swap
     * @param tokenId Token ID of the NFT you want to swap
     * @param wantedNftContract Address of the NFT collection you want in return
     * @param wantedTokenId Token ID you want (0 for "Any")
     * @param durationInDays How many days the listing should be active
     */
    function createSwapListing(
        address nftContract,
        uint256 tokenId,
        address wantedNftContract,
        uint256 wantedTokenId,
        uint256 durationInDays
    ) external nonReentrant returns (uint256) {
        require(nftContract != address(0), "Invalid NFT contract");
        require(wantedNftContract != address(0), "Invalid wanted NFT contract");
        require(durationInDays > 0 && durationInDays <= 365, "Invalid duration");

        // Verify ownership
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not the owner");

        // Verify approval
        require(
            nft.getApproved(tokenId) == address(this) ||
            nft.isApprovedForAll(msg.sender, address(this)),
            "Contract not approved"
        );

        // Check if NFT is already listed
        uint256 existingListingId = nftToListingId[nftContract][tokenId];
        if (existingListingId != 0 && swapListings[existingListingId].isActive) {
            revert("NFT already listed for swap");
        }

        // Create listing
        _listingIdCounter++;
        uint256 listingId = _listingIdCounter;
        uint256 expiresAt = block.timestamp + (durationInDays * 1 days);

        swapListings[listingId] = SwapListing({
            lister: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            wantedNftContract: wantedNftContract,
            wantedTokenId: wantedTokenId,
            isActive: true,
            createdAt: block.timestamp,
            expiresAt: expiresAt
        });

        nftToListingId[nftContract][tokenId] = listingId;

        emit SwapListingCreated(
            listingId,
            msg.sender,
            nftContract,
            tokenId,
            wantedNftContract,
            wantedTokenId,
            expiresAt
        );

        return listingId;
    }

    /**
     * @notice Execute a swap with a listed NFT
     * @param listingId The ID of the swap listing
     * @param myTokenId The token ID of the NFT you're offering to swap
     */
    function executeSwap(
        uint256 listingId,
        uint256 myTokenId
    ) external nonReentrant {
        SwapListing storage listing = swapListings[listingId];

        // Validation
        require(listing.isActive, "Listing not active");
        require(block.timestamp <= listing.expiresAt, "Listing expired");
        require(msg.sender != listing.lister, "Cannot swap with yourself");

        // Verify the offered NFT matches criteria
        IERC721 wantedNft = IERC721(listing.wantedNftContract);
        require(wantedNft.ownerOf(myTokenId) == msg.sender, "Not the owner of offered NFT");

        // If specific token ID is required, verify it matches
        if (listing.wantedTokenId != 0) {
            require(myTokenId == listing.wantedTokenId, "Token ID does not match");
        }

        // Verify approvals
        require(
            wantedNft.getApproved(myTokenId) == address(this) ||
            wantedNft.isApprovedForAll(msg.sender, address(this)),
            "Your NFT not approved"
        );

        IERC721 listedNft = IERC721(listing.nftContract);
        require(
            listedNft.getApproved(listing.tokenId) == address(this) ||
            listedNft.isApprovedForAll(listing.lister, address(this)),
            "Listed NFT not approved"
        );

        // Execute atomic swap
        listedNft.safeTransferFrom(listing.lister, msg.sender, listing.tokenId);
        wantedNft.safeTransferFrom(msg.sender, listing.lister, myTokenId);

        // Mark listing as inactive
        listing.isActive = false;
        delete nftToListingId[listing.nftContract][listing.tokenId];

        emit SwapExecuted(
            listingId,
            listing.lister,
            msg.sender,
            listing.nftContract,
            listing.tokenId,
            listing.wantedNftContract,
            myTokenId
        );
    }

    /**
     * @notice Cancel a swap listing
     * @param listingId The ID of the listing to cancel
     */
    function cancelSwapListing(uint256 listingId) external nonReentrant {
        SwapListing storage listing = swapListings[listingId];

        require(listing.isActive, "Listing not active");
        require(listing.lister == msg.sender, "Not the lister");

        listing.isActive = false;
        delete nftToListingId[listing.nftContract][listing.tokenId];

        emit SwapListingCancelled(listingId, msg.sender);
    }

    /**
     * @notice Get swap listing details
     * @param listingId The ID of the listing
     */
    function getSwapListing(uint256 listingId) external view returns (SwapListing memory) {
        return swapListings[listingId];
    }

    /**
     * @notice Check if a listing is still valid
     * @param listingId The ID of the listing
     */
    function isListingValid(uint256 listingId) external view returns (bool) {
        SwapListing memory listing = swapListings[listingId];
        return listing.isActive && block.timestamp <= listing.expiresAt;
    }

    /**
     * @notice Get the current listing ID counter
     */
    function getCurrentListingId() external view returns (uint256) {
        return _listingIdCounter;
    }

    /**
     * @dev Required to receive ERC721 tokens
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
