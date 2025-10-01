// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SwapManager
 * @notice Manages peer-to-peer NFT swaps with specific or flexible matching criteria
 * @dev Allows users to list NFTs for swap with specific token IDs or any token from a collection
 */
contract SwapManager is ReentrancyGuard, Ownable {
    // Structs
    struct SwapListing {
        address lister;
        address nftContract;
        uint256 tokenId;
        address wantedNftContract;
        uint256 wantedTokenId; // 0 means "any token from collection"
        bool isActive;
        uint256 createdAt;
        uint256 expiresAt;
    }

    // State
    uint256 private _listingIdCounter;
    mapping(uint256 => SwapListing) public listings;

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
        address nftContract,
        uint256 tokenId,
        address swappedNftContract,
        uint256 swappedTokenId
    );

    event SwapListingCancelled(uint256 indexed listingId, address indexed lister);

    constructor() Ownable(msg.sender) {
        _listingIdCounter = 1; // Start from 1
    }

    /**
     * @notice Create a new swap listing
     * @param nftContract The NFT contract to swap
     * @param tokenId The token ID to swap
     * @param wantedNftContract The NFT contract wanted in return
     * @param wantedTokenId The specific token ID wanted (0 for any)
     * @param durationInDays How long the listing is valid
     * @return listingId The ID of the created listing
     */
    function createSwapListing(
        address nftContract,
        uint256 tokenId,
        address wantedNftContract,
        uint256 wantedTokenId,
        uint256 durationInDays
    ) external nonReentrant returns (uint256 listingId) {
        require(nftContract != address(0), "Invalid NFT contract");
        require(wantedNftContract != address(0), "Invalid wanted NFT contract");
        require(durationInDays > 0 && durationInDays <= 365, "Duration must be 1-365 days");

        // Verify ownership
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not NFT owner");

        // Verify approval
        require(
            nft.getApproved(tokenId) == address(this) ||
            nft.isApprovedForAll(msg.sender, address(this)),
            "Contract not approved"
        );

        // Create listing
        listingId = _listingIdCounter++;
        uint256 expiresAt = block.timestamp + (durationInDays * 1 days);

        listings[listingId] = SwapListing({
            lister: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            wantedNftContract: wantedNftContract,
            wantedTokenId: wantedTokenId,
            isActive: true,
            createdAt: block.timestamp,
            expiresAt: expiresAt
        });

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
     * @notice Execute a swap with a listing
     * @param listingId The ID of the listing to swap with
     * @param myTokenId The token ID you're offering for the swap
     */
    function executeSwap(uint256 listingId, uint256 myTokenId) external nonReentrant {
        SwapListing storage listing = listings[listingId];

        // Validate listing
        require(listing.isActive, "Listing not active");
        require(block.timestamp <= listing.expiresAt, "Listing expired");
        require(listing.lister != msg.sender, "Cannot swap with yourself");

        // Verify the swapper owns the NFT they're offering
        IERC721 wantedNft = IERC721(listing.wantedNftContract);
        require(wantedNft.ownerOf(myTokenId) == msg.sender, "Not owner of offered NFT");

        // Verify the token matches criteria
        if (listing.wantedTokenId != 0) {
            require(myTokenId == listing.wantedTokenId, "Token ID does not match");
        }

        // Verify approvals
        require(
            wantedNft.getApproved(myTokenId) == address(this) ||
            wantedNft.isApprovedForAll(msg.sender, address(this)),
            "Offered NFT not approved"
        );

        IERC721 listedNft = IERC721(listing.nftContract);
        require(
            listedNft.getApproved(listing.tokenId) == address(this) ||
            listedNft.isApprovedForAll(listing.lister, address(this)),
            "Listed NFT not approved"
        );

        // Mark listing as inactive before transfers
        listing.isActive = false;

        // Execute swap
        // Transfer listed NFT to swapper
        listedNft.safeTransferFrom(listing.lister, msg.sender, listing.tokenId);

        // Transfer swapper's NFT to lister
        wantedNft.safeTransferFrom(msg.sender, listing.lister, myTokenId);

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
    function cancelSwapListing(uint256 listingId) external {
        SwapListing storage listing = listings[listingId];

        require(listing.lister == msg.sender, "Not listing owner");
        require(listing.isActive, "Listing not active");

        listing.isActive = false;

        emit SwapListingCancelled(listingId, msg.sender);
    }

    /**
     * @notice Get swap listing details
     * @param listingId The ID of the listing
     * @return The swap listing data
     */
    function getSwapListing(uint256 listingId) external view returns (SwapListing memory) {
        return listings[listingId];
    }

    /**
     * @notice Check if a listing is valid (active and not expired)
     * @param listingId The ID of the listing
     * @return Whether the listing is valid
     */
    function isListingValid(uint256 listingId) external view returns (bool) {
        SwapListing memory listing = listings[listingId];
        return listing.isActive && block.timestamp <= listing.expiresAt;
    }

    /**
     * @notice Get the total number of listings created
     * @return The total listing count
     */
    function getTotalListings() external view returns (uint256) {
        return _listingIdCounter - 1;
    }
}