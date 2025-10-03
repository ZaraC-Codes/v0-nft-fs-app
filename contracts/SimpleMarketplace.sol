// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleMarketplace
 * @dev A simple marketplace for ERC721 and ERC1155 NFTs
 */
contract SimpleMarketplace is ReentrancyGuard, Ownable {
    uint256 public listingCounter;
    uint256 public platformFeeBps = 250; // 2.5%
    address public platformFeeRecipient;

    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool isERC1155;
        uint256 quantity;
        bool active;
    }

    mapping(uint256 => Listing) public listings;

    event ListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price,
        bool isERC1155
    );

    event ListingCancelled(uint256 indexed listingId);

    event ListingSold(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 price
    );

    constructor() Ownable(msg.sender) {
        platformFeeRecipient = msg.sender;
    }

    function createListing(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        bool isERC1155,
        uint256 quantity
    ) external returns (uint256) {
        require(price > 0, "Price must be greater than 0");

        if (isERC1155) {
            require(quantity > 0, "Quantity must be greater than 0");
            require(
                IERC1155(nftContract).balanceOf(msg.sender, tokenId) >= quantity,
                "Insufficient balance"
            );
            require(
                IERC1155(nftContract).isApprovedForAll(msg.sender, address(this)),
                "Marketplace not approved"
            );
        } else {
            require(quantity == 1, "ERC721 quantity must be 1");
            require(
                IERC721(nftContract).ownerOf(tokenId) == msg.sender,
                "Not token owner"
            );
            require(
                IERC721(nftContract).isApprovedForAll(msg.sender, address(this)) ||
                IERC721(nftContract).getApproved(tokenId) == address(this),
                "Marketplace not approved"
            );
        }

        uint256 listingId = listingCounter++;
        listings[listingId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            isERC1155: isERC1155,
            quantity: quantity,
            active: true
        });

        emit ListingCreated(listingId, msg.sender, nftContract, tokenId, price, isERC1155);
        return listingId;
    }

    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not seller");

        listing.active = false;
        emit ListingCancelled(listingId);
    }

    function buyListing(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");

        listing.active = false;

        // Calculate platform fee
        uint256 platformFee = (listing.price * platformFeeBps) / 10000;
        uint256 sellerProceeds = listing.price - platformFee;

        // Transfer NFT
        if (listing.isERC1155) {
            IERC1155(listing.nftContract).safeTransferFrom(
                listing.seller,
                msg.sender,
                listing.tokenId,
                listing.quantity,
                ""
            );
        } else {
            IERC721(listing.nftContract).safeTransferFrom(
                listing.seller,
                msg.sender,
                listing.tokenId
            );
        }

        // Transfer payments
        payable(platformFeeRecipient).transfer(platformFee);
        payable(listing.seller).transfer(sellerProceeds);

        // Refund excess
        if (msg.value > listing.price) {
            payable(msg.sender).transfer(msg.value - listing.price);
        }

        emit ListingSold(listingId, msg.sender, listing.price);
    }

    function setPlatformFee(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 1000, "Fee too high"); // Max 10%
        platformFeeBps = _feeBps;
    }

    function setPlatformFeeRecipient(address _recipient) external onlyOwner {
        require(_recipient != address(0), "Invalid address");
        platformFeeRecipient = _recipient;
    }

    // Required for receiving ERC1155 tokens
    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) public pure returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public pure returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }
}
