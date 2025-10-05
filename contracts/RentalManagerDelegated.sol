// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./RentalWrapperDelegated.sol";

/**
 * @title RentalManagerDelegated
 * @notice Marketplace for NFT rentals using Delegate.cash integration
 * @dev Handles wrapping NFTs, creating rental listings, and managing rentals
 *
 * Features:
 * - Wrap any ERC721 NFT for rental
 * - Create rental listings with custom price and duration
 * - Rent NFTs with automatic delegation via Delegate.cash
 * - Platform fees (2.5% default)
 * - Unwrap NFTs when not rented
 */
contract RentalManagerDelegated is Ownable {
    RentalWrapperDelegated public immutable rentalWrapper;

    // Platform fee (in basis points, 250 = 2.5%)
    uint256 public platformFeeBps = 250;
    address public feeRecipient;

    // Rental listing info
    struct RentalListing {
        uint256 wrapperId;
        address owner;
        uint256 pricePerDay;       // Price in wei per day
        uint256 minRentalDays;     // Minimum rental duration
        uint256 maxRentalDays;     // Maximum rental duration
        bool isActive;
        uint256 createdAt;
    }

    // Mapping: wrapperId => listing
    mapping(uint256 => RentalListing) public listings;

    // Array of all listing IDs
    uint256[] public allListingIds;

    // Events
    event NFTWrappedForRental(
        uint256 indexed wrapperId,
        address indexed owner,
        address originalContract,
        uint256 originalTokenId
    );

    event RentalListingCreated(
        uint256 indexed wrapperId,
        address indexed owner,
        uint256 pricePerDay,
        uint256 minDays,
        uint256 maxDays
    );

    event RentalListingUpdated(
        uint256 indexed wrapperId,
        uint256 newPricePerDay,
        uint256 newMinDays,
        uint256 newMaxDays
    );

    event RentalListingCancelled(
        uint256 indexed wrapperId,
        address indexed owner
    );

    event NFTRented(
        uint256 indexed wrapperId,
        address indexed renter,
        uint256 rentalDays,
        uint256 totalCost,
        uint64 expiresAt
    );

    event NFTUnwrapped(
        uint256 indexed wrapperId,
        address indexed owner
    );

    event PlatformFeeUpdated(uint256 newFeeBps);
    event FeeRecipientUpdated(address newRecipient);

    constructor(address _rentalWrapper, address _feeRecipient) Ownable(msg.sender) {
        rentalWrapper = RentalWrapperDelegated(_rentalWrapper);
        feeRecipient = _feeRecipient;
    }

    /**
     * @notice Wrap an NFT to make it rentable
     * @dev User must approve this contract to transfer their NFT first
     * @param originalContract The NFT contract address
     * @param originalTokenId The NFT token ID
     * @return wrapperId The new wrapper token ID
     */
    function wrapNFT(
        address originalContract,
        uint256 originalTokenId
    ) external returns (uint256 wrapperId) {
        // Transfer original NFT to this contract temporarily
        IERC721(originalContract).transferFrom(msg.sender, address(this), originalTokenId);

        // Approve wrapper to take it
        IERC721(originalContract).approve(address(rentalWrapper), originalTokenId);

        // Wrap the NFT (creates wrapper NFT + TBA)
        (wrapperId, ) = rentalWrapper.wrapNFT(originalContract, originalTokenId, msg.sender);

        emit NFTWrappedForRental(wrapperId, msg.sender, originalContract, originalTokenId);
    }

    /**
     * @notice Create a rental listing for a wrapped NFT
     * @dev Caller must own the wrapper NFT
     * @param wrapperId The wrapper token ID
     * @param pricePerDay Rental price in wei per day
     * @param minRentalDays Minimum rental duration in days
     * @param maxRentalDays Maximum rental duration in days
     */
    function createRentalListing(
        uint256 wrapperId,
        uint256 pricePerDay,
        uint256 minRentalDays,
        uint256 maxRentalDays
    ) external {
        require(rentalWrapper.ownerOf(wrapperId) == msg.sender, "Not wrapper owner");
        require(rentalWrapper.userOf(wrapperId) == address(0), "Currently rented");
        require(pricePerDay > 0, "Price must be > 0");
        require(minRentalDays > 0 && minRentalDays <= maxRentalDays, "Invalid duration");

        // Create listing
        listings[wrapperId] = RentalListing({
            wrapperId: wrapperId,
            owner: msg.sender,
            pricePerDay: pricePerDay,
            minRentalDays: minRentalDays,
            maxRentalDays: maxRentalDays,
            isActive: true,
            createdAt: block.timestamp
        });

        allListingIds.push(wrapperId);

        emit RentalListingCreated(wrapperId, msg.sender, pricePerDay, minRentalDays, maxRentalDays);
    }

    /**
     * @notice Update a rental listing
     * @dev Only listing owner can update
     * @param wrapperId The wrapper token ID
     * @param newPricePerDay New rental price per day
     * @param newMinDays New minimum rental duration
     * @param newMaxDays New maximum rental duration
     */
    function updateRentalListing(
        uint256 wrapperId,
        uint256 newPricePerDay,
        uint256 newMinDays,
        uint256 newMaxDays
    ) external {
        RentalListing storage listing = listings[wrapperId];
        require(listing.owner == msg.sender, "Not listing owner");
        require(listing.isActive, "Listing not active");
        require(newPricePerDay > 0, "Price must be > 0");
        require(newMinDays > 0 && newMinDays <= newMaxDays, "Invalid duration");

        listing.pricePerDay = newPricePerDay;
        listing.minRentalDays = newMinDays;
        listing.maxRentalDays = newMaxDays;

        emit RentalListingUpdated(wrapperId, newPricePerDay, newMinDays, newMaxDays);
    }

    /**
     * @notice Cancel a rental listing
     * @dev Only listing owner can cancel
     * @param wrapperId The wrapper token ID
     */
    function cancelRentalListing(uint256 wrapperId) external {
        RentalListing storage listing = listings[wrapperId];
        require(listing.owner == msg.sender, "Not listing owner");
        require(listing.isActive, "Listing not active");

        listing.isActive = false;

        emit RentalListingCancelled(wrapperId, msg.sender);
    }

    /**
     * @notice Rent an NFT
     * @dev Renter must pay the rental fee
     * @param wrapperId The wrapper token ID to rent
     * @param rentalDays Number of days to rent for
     */
    function rentNFT(uint256 wrapperId, uint256 rentalDays) external payable {
        RentalListing storage listing = listings[wrapperId];
        require(listing.isActive, "Listing not active");
        require(rentalWrapper.userOf(wrapperId) == address(0), "Currently rented");
        require(rentalDays >= listing.minRentalDays && rentalDays <= listing.maxRentalDays, "Invalid rental duration");

        // Calculate costs
        uint256 rentalCost = listing.pricePerDay * rentalDays;
        uint256 platformFee = (rentalCost * platformFeeBps) / 10000;
        uint256 totalCost = rentalCost + platformFee;

        require(msg.value >= totalCost, "Insufficient payment");

        // Calculate expiration
        uint64 expiresAt = uint64(block.timestamp + (rentalDays * 1 days));

        // Set user in wrapper (triggers delegation)
        rentalWrapper.setUser(wrapperId, msg.sender, expiresAt);

        // Transfer funds
        payable(listing.owner).transfer(rentalCost);
        payable(feeRecipient).transfer(platformFee);

        // Refund excess
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }

        emit NFTRented(wrapperId, msg.sender, rentalDays, totalCost, expiresAt);
    }

    /**
     * @notice Unwrap an NFT to get the original back
     * @dev Only wrapper owner can unwrap, and only when not rented
     * @param wrapperId The wrapper token ID
     */
    function unwrapNFT(uint256 wrapperId) external {
        require(rentalWrapper.ownerOf(wrapperId) == msg.sender, "Not wrapper owner");
        require(rentalWrapper.userOf(wrapperId) == address(0), "Currently rented");

        // Cancel listing if active
        if (listings[wrapperId].isActive) {
            listings[wrapperId].isActive = false;
        }

        // Unwrap via wrapper contract
        rentalWrapper.unwrapNFT(wrapperId);

        emit NFTUnwrapped(wrapperId, msg.sender);
    }

    /**
     * @notice Get all active rental listings
     * @return activeListings Array of active rental listings
     */
    function getActiveListings() external view returns (RentalListing[] memory activeListings) {
        uint256 activeCount = 0;

        // Count active listings
        for (uint256 i = 0; i < allListingIds.length; i++) {
            if (listings[allListingIds[i]].isActive && rentalWrapper.userOf(allListingIds[i]) == address(0)) {
                activeCount++;
            }
        }

        // Build array
        activeListings = new RentalListing[](activeCount);
        uint256 index = 0;

        for (uint256 i = 0; i < allListingIds.length; i++) {
            uint256 wrapperId = allListingIds[i];
            if (listings[wrapperId].isActive && rentalWrapper.userOf(wrapperId) == address(0)) {
                activeListings[index] = listings[wrapperId];
                index++;
            }
        }
    }

    /**
     * @notice Get rental info for a specific wrapper
     * @param wrapperId The wrapper token ID
     * @return listing The rental listing
     * @return currentRenter The current renter (address(0) if not rented)
     * @return expiresAt Rental expiration timestamp
     */
    function getRentalInfo(uint256 wrapperId)
        external
        view
        returns (
            RentalListing memory listing,
            address currentRenter,
            uint64 expiresAt
        )
    {
        listing = listings[wrapperId];
        currentRenter = rentalWrapper.userOf(wrapperId);
        expiresAt = rentalWrapper.userExpires(wrapperId);
    }

    /**
     * @notice Update platform fee
     * @dev Only owner can update
     * @param newFeeBps New fee in basis points (250 = 2.5%)
     */
    function updatePlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "Fee too high"); // Max 10%
        platformFeeBps = newFeeBps;
        emit PlatformFeeUpdated(newFeeBps);
    }

    /**
     * @notice Update fee recipient
     * @dev Only owner can update
     * @param newRecipient New fee recipient address
     */
    function updateFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
    }
}
