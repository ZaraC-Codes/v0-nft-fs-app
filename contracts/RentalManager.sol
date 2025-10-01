// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./RentalWrapper.sol";

// ERC6551 Registry Interface
interface IERC6551Registry {
    function createAccount(
        address implementation,
        uint256 chainId,
        address tokenContract,
        uint256 tokenId,
        uint256 salt,
        bytes calldata initData
    ) external returns (address);
}

/**
 * @title RentalManager
 * @notice Manages NFT rentals using ERC4907 wrapper + ERC6551 Token Bound Accounts
 * @dev Wraps any ERC721 NFT into an ERC4907 wrapper with rental capabilities
 *
 * Flow:
 * 1. wrapForRental() - Mint wrapper, create TBA, transfer original NFT to TBA
 * 2. rentNFT() - Renter pays, gets userOf() rights via ERC4907
 * 3. After expiration - Owner can unwrap or re-rent without moving NFT
 */
contract RentalManager is ReentrancyGuard, Ownable {
    // ERC6551 Registry and Account Implementation
    address public immutable erc6551Registry;
    address public immutable accountImplementation;

    // Rental Wrapper Contract
    RentalWrapper public rentalWrapper;

    // Platform fee (in basis points: 100 bp = 1%)
    uint256 public platformFeeBps = 250; // 2.5%
    address public feeRecipient;

    // Structs
    struct RentalListing {
        uint256 wrapperId;
        address owner;
        bool isActive;
        uint256 totalRentals;
        uint256 totalEarnings;
    }

    struct ActiveRental {
        address renter;
        uint256 startTime;
        uint256 endTime;
        uint256 paidAmount;
    }

    // State
    mapping(uint256 => RentalListing) public listings;
    mapping(uint256 => ActiveRental) public activeRentals;

    // Events
    event NFTWrappedForRental(
        uint256 indexed wrapperId,
        address indexed owner,
        address originalContract,
        uint256 originalTokenId,
        address tbaAccount,
        uint256 pricePerDay
    );

    event NFTRented(
        uint256 indexed wrapperId,
        address indexed renter,
        uint256 startTime,
        uint256 endTime,
        uint256 totalCost,
        uint256 platformFee
    );

    event NFTUnwrapped(
        uint256 indexed wrapperId,
        address indexed owner,
        address originalContract,
        uint256 originalTokenId
    );

    event RentalExpired(uint256 indexed wrapperId, address indexed renter);

    event PlatformFeeUpdated(uint256 newFeeBps);

    constructor(
        address _erc6551Registry,
        address _accountImplementation,
        address _feeRecipient
    ) Ownable(msg.sender) {
        require(_erc6551Registry != address(0), "Invalid registry");
        require(_accountImplementation != address(0), "Invalid implementation");
        require(_feeRecipient != address(0), "Invalid fee recipient");

        erc6551Registry = _erc6551Registry;
        accountImplementation = _accountImplementation;
        feeRecipient = _feeRecipient;
    }

    /**
     * @notice Set the rental wrapper contract
     * @dev Only owner, can only be set once
     */
    function setRentalWrapper(address _rentalWrapper) external onlyOwner {
        require(address(rentalWrapper) == address(0), "Already set");
        require(_rentalWrapper != address(0), "Invalid address");
        rentalWrapper = RentalWrapper(_rentalWrapper);
    }

    /**
     * @notice Update platform fee
     * @dev Only owner, max 10% (1000 bps)
     */
    function setPlatformFee(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 1000, "Fee too high");
        platformFeeBps = _feeBps;
        emit PlatformFeeUpdated(_feeBps);
    }

    /**
     * @notice Wrap an NFT for rental
     * @dev Creates wrapper NFT, TBA, and transfers original NFT to TBA
     */
    function wrapForRental(
        address nftContract,
        uint256 tokenId,
        uint256 pricePerDay,
        uint256 minDays,
        uint256 maxDays
    ) external nonReentrant returns (uint256 wrapperId) {
        require(nftContract != address(0), "Invalid NFT contract");
        require(pricePerDay > 0, "Price must be > 0");
        require(minDays > 0 && maxDays >= minDays, "Invalid duration");
        require(maxDays <= 365, "Max duration is 365 days");

        // Verify ownership
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not NFT owner");

        // Get original NFT metadata
        string memory originalURI;
        try IERC721Metadata(nftContract).tokenURI(tokenId) returns (string memory uri) {
            originalURI = uri;
        } catch {
            originalURI = "";
        }

        // Mint wrapper NFT to owner
        wrapperId = rentalWrapper.mint(
            msg.sender,
            nftContract,
            tokenId,
            address(0), // TBA address set below
            pricePerDay,
            minDays,
            maxDays,
            originalURI
        );

        // Create Token Bound Account for wrapper
        address tbaAccount = IERC6551Registry(erc6551Registry).createAccount(
            accountImplementation,
            block.chainid,
            address(rentalWrapper),
            wrapperId,
            0,
            ""
        );

        // Update wrapper with TBA address
        (
            address originalContract,
            uint256 originalTokenId,
            ,
            uint256 price,
            uint256 min,
            uint256 max,
            bool isActive,
            uint256 createdAt
        ) = rentalWrapper.wrapperInfo(wrapperId);

        // Transfer original NFT to TBA
        nft.safeTransferFrom(msg.sender, tbaAccount, tokenId);

        // Create listing
        listings[wrapperId] = RentalListing({
            wrapperId: wrapperId,
            owner: msg.sender,
            isActive: true,
            totalRentals: 0,
            totalEarnings: 0
        });

        emit NFTWrappedForRental(
            wrapperId,
            msg.sender,
            nftContract,
            tokenId,
            tbaAccount,
            pricePerDay
        );

        return wrapperId;
    }

    /**
     * @notice Rent a wrapped NFT
     * @dev Renter pays and gets userOf() rights via ERC4907
     */
    function rentNFT(uint256 wrapperId, uint256 durationInDays)
        external
        payable
        nonReentrant
    {
        RentalListing storage listing = listings[wrapperId];
        require(listing.isActive, "Listing not active");
        require(rentalWrapper.ownerOf(wrapperId) == listing.owner, "Owner changed");

        // Check not currently rented
        require(!rentalWrapper.isRented(wrapperId), "Already rented");

        // Get rental terms
        (
            ,
            ,
            ,
            uint256 pricePerDay,
            uint256 minDays,
            uint256 maxDays,
            ,
        ) = rentalWrapper.wrapperInfo(wrapperId);

        require(durationInDays >= minDays && durationInDays <= maxDays, "Invalid duration");

        // Calculate costs
        uint256 rentalCost = pricePerDay * durationInDays;
        uint256 platformFee = (rentalCost * platformFeeBps) / 10000;
        uint256 totalCost = rentalCost + platformFee;

        require(msg.value >= totalCost, "Insufficient payment");

        // Calculate rental period
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + (durationInDays * 1 days);

        // Set user via ERC4907
        rentalWrapper.setUser(wrapperId, msg.sender, uint64(endTime));

        // Store rental info
        activeRentals[wrapperId] = ActiveRental({
            renter: msg.sender,
            startTime: startTime,
            endTime: endTime,
            paidAmount: rentalCost
        });

        // Update listing stats
        listing.totalRentals++;
        listing.totalEarnings += rentalCost;

        // Distribute payments
        payable(listing.owner).transfer(rentalCost);
        payable(feeRecipient).transfer(platformFee);

        // Refund excess
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }

        emit NFTRented(wrapperId, msg.sender, startTime, endTime, totalCost, platformFee);
    }

    /**
     * @notice Unwrap NFT to retrieve original
     * @dev Only owner can unwrap, only when not rented
     */
    function unwrapNFT(uint256 wrapperId) external nonReentrant {
        require(rentalWrapper.ownerOf(wrapperId) == msg.sender, "Not wrapper owner");
        require(!rentalWrapper.isRented(wrapperId), "Cannot unwrap while rented");

        // Get original NFT info
        (
            address originalContract,
            uint256 originalTokenId,
            address tbaAccount,
            ,
            ,
            ,
            ,
        ) = rentalWrapper.wrapperInfo(wrapperId);

        // Transfer original NFT from TBA back to owner
        IERC721(originalContract).safeTransferFrom(tbaAccount, msg.sender, originalTokenId);

        // Delete listing
        delete listings[wrapperId];
        delete activeRentals[wrapperId];

        // Burn wrapper NFT
        rentalWrapper.burn(wrapperId);

        emit NFTUnwrapped(wrapperId, msg.sender, originalContract, originalTokenId);
    }

    /**
     * @notice Calculate rental cost for a given duration
     */
    function calculateRentalCost(uint256 wrapperId, uint256 durationInDays)
        public
        view
        returns (uint256 rentalCost, uint256 platformFee, uint256 totalCost)
    {
        (
            ,
            ,
            ,
            uint256 pricePerDay,
            ,
            ,
            ,
        ) = rentalWrapper.wrapperInfo(wrapperId);

        rentalCost = pricePerDay * durationInDays;
        platformFee = (rentalCost * platformFeeBps) / 10000;
        totalCost = rentalCost + platformFee;

        return (rentalCost, platformFee, totalCost);
    }

    /**
     * @notice Check if a wrapper is available for rent
     */
    function isAvailableForRent(uint256 wrapperId) public view returns (bool) {
        return listings[wrapperId].isActive && !rentalWrapper.isRented(wrapperId);
    }

    /**
     * @notice Get active rental details
     */
    function getRentalDetails(uint256 wrapperId)
        public
        view
        returns (
            address renter,
            uint256 startTime,
            uint256 endTime,
            uint256 timeRemaining
        )
    {
        ActiveRental memory rental = activeRentals[wrapperId];

        if (rental.endTime > block.timestamp) {
            timeRemaining = rental.endTime - block.timestamp;
        } else {
            timeRemaining = 0;
        }

        return (rental.renter, rental.startTime, rental.endTime, timeRemaining);
    }
}