// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IERC4907.sol";

/**
 * @title RentalWrapper
 * @notice ERC4907-compatible wrapper NFT that owns original NFTs via Token Bound Account
 * @dev Combines ERC721 + ERC4907 to enable rentals of any existing NFT
 *
 * Architecture:
 * 1. Original NFT transferred to this wrapper's Token Bound Account (TBA)
 * 2. Wrapper NFT implements ERC4907 for rental functionality
 * 3. Owner retains ownership, renter gets temporary user rights
 * 4. After expiration, owner can unwrap to retrieve original NFT
 */
contract RentalWrapper is ERC721, ERC721URIStorage, Ownable, IERC4907 {
    // Structs
    struct WrapperInfo {
        address originalContract;
        uint256 originalTokenId;
        address tbaAccount;
        uint256 pricePerDay;
        uint256 minDays;
        uint256 maxDays;
        bool isActive;
        uint256 createdAt;
    }

    struct UserInfo {
        address user;
        uint64 expires;
    }

    // State
    uint256 private _tokenIdCounter;
    address public rentalManager;

    mapping(uint256 => WrapperInfo) public wrapperInfo;
    mapping(uint256 => UserInfo) private _users;

    // Events
    event WrapperCreated(
        uint256 indexed wrapperId,
        address indexed owner,
        address originalContract,
        uint256 originalTokenId,
        address tbaAccount
    );

    event RentalTermsUpdated(
        uint256 indexed wrapperId,
        uint256 pricePerDay,
        uint256 minDays,
        uint256 maxDays
    );

    constructor() ERC721("Fortuna Square Rental Wrapper", "FSRENT") Ownable(msg.sender) {
        _tokenIdCounter = 1;
    }

    /**
     * @notice Set the rental manager contract address
     * @dev Only owner can set this
     */
    function setRentalManager(address _rentalManager) external onlyOwner {
        require(_rentalManager != address(0), "Invalid address");
        rentalManager = _rentalManager;
    }

    /**
     * @notice Mint a new wrapper NFT
     * @dev Only callable by rental manager
     */
    function mint(
        address to,
        address originalContract,
        uint256 originalTokenId,
        address tbaAccount,
        uint256 pricePerDay,
        uint256 minDays,
        uint256 maxDays,
        string memory tokenURI_
    ) external returns (uint256) {
        require(msg.sender == rentalManager, "Only rental manager can mint");

        uint256 wrapperId = _tokenIdCounter++;

        _safeMint(to, wrapperId);
        _setTokenURI(wrapperId, tokenURI_);

        wrapperInfo[wrapperId] = WrapperInfo({
            originalContract: originalContract,
            originalTokenId: originalTokenId,
            tbaAccount: tbaAccount,
            pricePerDay: pricePerDay,
            minDays: minDays,
            maxDays: maxDays,
            isActive: true,
            createdAt: block.timestamp
        });

        emit WrapperCreated(wrapperId, to, originalContract, originalTokenId, tbaAccount);

        return wrapperId;
    }

    /**
     * @notice Burn a wrapper NFT
     * @dev Only callable by rental manager, only when not rented
     */
    function burn(uint256 tokenId) external {
        require(msg.sender == rentalManager, "Only rental manager can burn");
        require(_users[tokenId].expires < block.timestamp, "Cannot burn while rented");

        delete wrapperInfo[tokenId];
        delete _users[tokenId];

        _burn(tokenId);
    }

    /**
     * @notice Update rental terms
     * @dev Only wrapper owner can update
     */
    function updateRentalTerms(
        uint256 tokenId,
        uint256 pricePerDay,
        uint256 minDays,
        uint256 maxDays
    ) external {
        require(ownerOf(tokenId) == msg.sender, "Not wrapper owner");
        require(_users[tokenId].expires < block.timestamp, "Cannot update while rented");

        wrapperInfo[tokenId].pricePerDay = pricePerDay;
        wrapperInfo[tokenId].minDays = minDays;
        wrapperInfo[tokenId].maxDays = maxDays;

        emit RentalTermsUpdated(tokenId, pricePerDay, minDays, maxDays);
    }

    /**
     * @notice Deactivate wrapper (remove from rental marketplace)
     * @dev Only wrapper owner can deactivate
     */
    function setActive(uint256 tokenId, bool active) external {
        require(ownerOf(tokenId) == msg.sender, "Not wrapper owner");
        wrapperInfo[tokenId].isActive = active;
    }

    // ============================================
    // ERC4907 Implementation
    // ============================================

    /**
     * @notice Set the user and expiration time for a wrapper
     * @dev Only rental manager can set user
     */
    function setUser(uint256 tokenId, address user, uint64 expires) public virtual override {
        require(msg.sender == rentalManager, "Only rental manager can set user");
        require(_ownerOf(tokenId) != address(0), "Wrapper does not exist");

        UserInfo storage info = _users[tokenId];
        info.user = user;
        info.expires = expires;

        emit UpdateUser(tokenId, user, expires);
    }

    /**
     * @notice Get the current user of a wrapper
     * @dev Returns zero address if expired
     */
    function userOf(uint256 tokenId) public view virtual override returns (address) {
        if (uint256(_users[tokenId].expires) >= block.timestamp) {
            return _users[tokenId].user;
        }
        return address(0);
    }

    /**
     * @notice Get the expiration timestamp
     */
    function userExpires(uint256 tokenId) public view virtual override returns (uint64) {
        return _users[tokenId].expires;
    }

    /**
     * @notice Check if wrapper is currently rented
     */
    function isRented(uint256 tokenId) public view returns (bool) {
        return userOf(tokenId) != address(0);
    }

    // ============================================
    // ERC721 Overrides
    // ============================================

    /**
     * @notice Override to prevent transfer while rented
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        // Allow transfers only if not currently rented or if burning
        if (to != address(0)) {
            require(!isRented(tokenId), "Cannot transfer while rented");
        }

        return super._update(to, tokenId, auth);
    }

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
        return interfaceId == type(IERC4907).interfaceId || super.supportsInterface(interfaceId);
    }

    /**
     * @notice Get total number of wrappers created
     */
    function totalWrappers() public view returns (uint256) {
        return _tokenIdCounter - 1;
    }
}