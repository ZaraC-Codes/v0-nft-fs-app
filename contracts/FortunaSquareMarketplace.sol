// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title FortunaSquareMarketplace
 * @notice Custom NFT marketplace for Fortuna Square with integrated support for:
 *         - Direct listings (buy/sell)
 *         - Bundle NFTs (ERC6551)
 *         - Swap listings (P2P trades via SwapManager)
 *         - Rental listings (ERC4907 via RentalManager)
 * @dev Optimized for gas efficiency and clear error messages
 */
contract FortunaSquareMarketplace is Ownable, ReentrancyGuard {

    // ============================================
    // STATE VARIABLES
    // ============================================

    /// @notice Platform fee percentage (in basis points: 250 = 2.5%)
    uint256 public saleFeePercent = 250;

    /// @notice Platform fee recipient address
    address public feeRecipient;

    /// @notice Counter for listing IDs
    uint256 private _listingIdCounter;

    /// @notice Mapping of listing ID to listing data
    mapping(uint256 => Listing) public listings;

    /// @notice Mapping of user address to their listing IDs
    mapping(address => uint256[]) public userListings;

    // ============================================
    // STRUCTS
    // ============================================

    struct Listing {
        uint256 listingId;
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 quantity;      // 1 for ERC721, can be >1 for ERC1155
        address currency;      // Address of payment token (0xEeee...eE for native)
        uint256 pricePerToken;
        uint256 startTime;
        uint256 endTime;
        bool active;
        TokenType tokenType;
    }

    enum TokenType {
        ERC721,
        ERC1155
    }

    // ============================================
    // EVENTS
    // ============================================

    event ListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 pricePerToken,
        TokenType tokenType
    );

    event ListingCancelled(
        uint256 indexed listingId,
        address indexed seller
    );

    event ListingUpdated(
        uint256 indexed listingId,
        uint256 newPrice
    );

    event Sale(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed seller,
        address nftContract,
        uint256 tokenId,
        uint256 quantity,
        uint256 totalPrice,
        uint256 platformFee
    );

    event FeeUpdated(uint256 newFeePercent);

    event FeeRecipientUpdated(address indexed newRecipient);

    // ============================================
    // CONSTRUCTOR
    // ============================================

    constructor(address _feeRecipient) Ownable(msg.sender) {
        require(_feeRecipient != address(0), "FortunaSquare: Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }

    // ============================================
    // CORE LISTING FUNCTIONS
    // ============================================

    /**
     * @notice Create a new listing for an NFT
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to list
     * @param quantity Quantity to list (1 for ERC721, can be >1 for ERC1155)
     * @param currency Payment token address (0xEeee...eE for native token)
     * @param pricePerToken Price per token in wei
     * @param duration Duration of listing in seconds (max 90 days)
     */
    function createListing(
        address nftContract,
        uint256 tokenId,
        uint256 quantity,
        address currency,
        uint256 pricePerToken,
        uint256 duration
    ) external nonReentrant returns (uint256) {
        require(nftContract != address(0), "FortunaSquare: Invalid NFT contract");
        require(quantity > 0, "FortunaSquare: Invalid quantity");
        require(pricePerToken > 0, "FortunaSquare: Price must be > 0");
        require(duration > 0 && duration <= 90 days, "FortunaSquare: Invalid duration");

        // Detect token type
        TokenType tokenType = _detectTokenType(nftContract);

        // Verify ownership and approval
        if (tokenType == TokenType.ERC721) {
            require(quantity == 1, "FortunaSquare: ERC721 quantity must be 1");
            IERC721 nft = IERC721(nftContract);
            require(nft.ownerOf(tokenId) == msg.sender, "FortunaSquare: You don't own this NFT");
            require(
                nft.getApproved(tokenId) == address(this) ||
                nft.isApprovedForAll(msg.sender, address(this)),
                "FortunaSquare: Marketplace not approved - please approve this NFT first"
            );
        } else {
            IERC1155 nft = IERC1155(nftContract);
            require(
                nft.balanceOf(msg.sender, tokenId) >= quantity,
                "FortunaSquare: Insufficient balance"
            );
            require(
                nft.isApprovedForAll(msg.sender, address(this)),
                "FortunaSquare: Marketplace not approved - please approve this NFT first"
            );
        }

        // Create listing
        uint256 listingId = _listingIdCounter++;
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + duration;

        listings[listingId] = Listing({
            listingId: listingId,
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            quantity: quantity,
            currency: currency,
            pricePerToken: pricePerToken,
            startTime: startTime,
            endTime: endTime,
            active: true,
            tokenType: tokenType
        });

        userListings[msg.sender].push(listingId);

        emit ListingCreated(
            listingId,
            msg.sender,
            nftContract,
            tokenId,
            pricePerToken,
            tokenType
        );

        return listingId;
    }

    /**
     * @notice Buy from a listing
     * @param listingId ID of the listing to purchase
     * @param quantity Quantity to buy (for ERC1155, must be <= listing quantity)
     */
    function buyFromListing(
        uint256 listingId,
        uint256 quantity
    ) external payable nonReentrant {
        Listing storage listing = listings[listingId];

        require(listing.active, "FortunaSquare: Listing not active");
        require(block.timestamp >= listing.startTime, "FortunaSquare: Listing not started");
        require(block.timestamp <= listing.endTime, "FortunaSquare: Listing expired");
        require(quantity > 0 && quantity <= listing.quantity, "FortunaSquare: Invalid quantity");
        require(msg.sender != listing.seller, "FortunaSquare: Cannot buy your own listing");

        uint256 totalPrice = listing.pricePerToken * quantity;
        uint256 platformFee = (totalPrice * saleFeePercent) / 10000;
        uint256 sellerProceeds = totalPrice - platformFee;

        // Handle payment
        if (listing.currency == 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE) {
            // Native token payment
            require(msg.value == totalPrice, "FortunaSquare: Incorrect payment amount");

            // Transfer to seller
            (bool success1, ) = payable(listing.seller).call{value: sellerProceeds}("");
            require(success1, "FortunaSquare: Seller payment failed");

            // Transfer fee
            (bool success2, ) = payable(feeRecipient).call{value: platformFee}("");
            require(success2, "FortunaSquare: Fee payment failed");
        } else {
            // ERC20 payment (future feature)
            revert("FortunaSquare: ERC20 payments not yet supported");
        }

        // Transfer NFT
        if (listing.tokenType == TokenType.ERC721) {
            IERC721(listing.nftContract).safeTransferFrom(
                listing.seller,
                msg.sender,
                listing.tokenId
            );
            listing.active = false; // ERC721 sold completely
        } else {
            IERC1155(listing.nftContract).safeTransferFrom(
                listing.seller,
                msg.sender,
                listing.tokenId,
                quantity,
                ""
            );
            listing.quantity -= quantity;
            if (listing.quantity == 0) {
                listing.active = false;
            }
        }

        emit Sale(
            listingId,
            msg.sender,
            listing.seller,
            listing.nftContract,
            listing.tokenId,
            quantity,
            totalPrice,
            platformFee
        );
    }

    /**
     * @notice Cancel a listing
     * @param listingId ID of the listing to cancel
     */
    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];

        require(listing.active, "FortunaSquare: Listing not active");
        require(listing.seller == msg.sender, "FortunaSquare: Only seller can cancel");

        listing.active = false;

        emit ListingCancelled(listingId, msg.sender);
    }

    /**
     * @notice Update listing price
     * @param listingId ID of the listing to update
     * @param newPrice New price per token in wei
     */
    function updateListingPrice(
        uint256 listingId,
        uint256 newPrice
    ) external nonReentrant {
        Listing storage listing = listings[listingId];

        require(listing.active, "FortunaSquare: Listing not active");
        require(listing.seller == msg.sender, "FortunaSquare: Only seller can update");
        require(newPrice > 0, "FortunaSquare: Price must be > 0");

        listing.pricePerToken = newPrice;

        emit ListingUpdated(listingId, newPrice);
    }

    // ============================================
    // BUNDLE SUPPORT
    // ============================================

    /**
     * @notice Check if an NFT is a Bundle NFT (has Token Bound Account)
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to check
     * @return isBundle True if NFT is a bundle
     */
    function isBundleNFT(
        address nftContract,
        uint256 tokenId
    ) public view returns (bool isBundle) {
        // Bundle NFTs implement ERC6551 and have a registry
        // We can detect by checking if contract has account() function
        try IERC721(nftContract).ownerOf(tokenId) returns (address) {
            // If NFT exists, try to call account() function
            // This is a simple check - bundles will have this function
            (bool success, ) = nftContract.staticcall(
                abi.encodeWithSignature("account(uint256)", tokenId)
            );
            return success;
        } catch {
            return false;
        }
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    /**
     * @notice Get listing details
     * @param listingId ID of the listing
     */
    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }

    /**
     * @notice Get all listing IDs for a user
     * @param user Address of the user
     */
    function getUserListings(address user) external view returns (uint256[] memory) {
        return userListings[user];
    }

    /**
     * @notice Get the total number of listings created
     * @return Total listing count
     */
    function getTotalListings() external view returns (uint256) {
        return _listingIdCounter;
    }

    /**
     * @notice Check if listing is valid and active
     * @param listingId ID of the listing
     */
    function isListingValid(uint256 listingId) external view returns (bool) {
        Listing memory listing = listings[listingId];
        return listing.active &&
               block.timestamp >= listing.startTime &&
               block.timestamp <= listing.endTime;
    }

    // ============================================
    // SWAP & RENTAL INTEGRATION
    // ============================================
    // Note: These are reference addresses for integration
    // Actual swap/rental functionality lives in separate contracts

    address public swapManagerAddress;
    address public rentalManagerAddress;

    /**
     * @notice Set SwapManager contract address
     * @param _swapManager Address of SwapManager contract
     */
    function setSwapManager(address _swapManager) external onlyOwner {
        require(_swapManager != address(0), "FortunaSquare: Invalid address");
        swapManagerAddress = _swapManager;
    }

    /**
     * @notice Set RentalManager contract address
     * @param _rentalManager Address of RentalManager contract
     */
    function setRentalManager(address _rentalManager) external onlyOwner {
        require(_rentalManager != address(0), "FortunaSquare: Invalid address");
        rentalManagerAddress = _rentalManager;
    }

    // ============================================
    // ADMIN FUNCTIONS
    // ============================================

    /**
     * @notice Update platform fee percentage
     * @param newFeePercent New fee in basis points (250 = 2.5%)
     */
    function updateSaleFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 1000, "FortunaSquare: Fee too high (max 10%)");
        saleFeePercent = newFeePercent;
        emit FeeUpdated(newFeePercent);
    }

    /**
     * @notice Update fee recipient address
     * @param newRecipient New fee recipient address
     */
    function updateFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "FortunaSquare: Invalid recipient");
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
    }

    // ============================================
    // INTERNAL HELPERS
    // ============================================

    /**
     * @notice Detect if contract is ERC721 or ERC1155
     * @param nftContract Address of NFT contract
     */
    function _detectTokenType(address nftContract) internal view returns (TokenType) {
        // ERC1155 interface ID
        bytes4 ERC1155_INTERFACE_ID = 0xd9b67a26;

        // Try ERC1155 first
        try IERC165(nftContract).supportsInterface(ERC1155_INTERFACE_ID) returns (bool isERC1155) {
            if (isERC1155) {
                return TokenType.ERC1155;
            }
        } catch {
            // If supportsInterface fails, assume ERC721
        }

        return TokenType.ERC721;
    }

    // ============================================
    // RECEIVE FUNCTION
    // ============================================

    receive() external payable {
        // Allow contract to receive native tokens
    }
}
