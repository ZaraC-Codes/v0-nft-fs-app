// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IERC4907.sol";
import "./FortunaSquareRentalAccount.sol";

/**
 * @title RentalWrapperDelegated
 * @notice ERC721 + ERC4907 wrapper that makes any NFT rentable via Delegate.cash
 * @dev Each wrapper token represents a wrapped original NFT stored in its TBA
 *
 * How it works:
 * 1. User wraps their NFT → Creates wrapper NFT with TBA
 * 2. Original NFT transferred into wrapper's TBA
 * 3. When rented → TBA delegates original NFT to renter via Delegate.cash
 * 4. When rental expires → Delegation auto-revokes (ERC4907 userOf returns 0x0)
 * 5. Owner can unwrap anytime (if not actively rented)
 *
 * Key Features:
 * - Owner keeps wrapper NFT (can sell it while rented!)
 * - Renter gets delegation rights to original NFT
 * - Token-gated apps recognize renter via Delegate.cash
 * - Zero collateral needed
 */
contract RentalWrapperDelegated is ERC721, IERC4907, Ownable {
    // ERC6551 Registry (same address on all chains)
    address public constant ERC6551_REGISTRY = 0x000000006551c19487814612e58FE06813775758;

    // FortunaSquareRentalAccount implementation
    address public immutable accountImplementation;

    // Rental Manager contract (can create rentals)
    address public rentalManager;

    // Counter for wrapper token IDs
    uint256 private _nextTokenId;

    // Struct to track original NFT details
    struct WrappedNFT {
        address originalContract;  // Original NFT contract
        uint256 originalTokenId;   // Original NFT token ID
        address tbaAddress;        // Token Bound Account holding original NFT
    }

    // Struct to track rental info (ERC4907)
    struct UserInfo {
        address user;      // Current renter
        uint64 expires;    // Rental expiration timestamp
    }

    // Mapping: wrapperId => original NFT info
    mapping(uint256 => WrappedNFT) public wrappedNFTs;

    // Mapping: wrapperId => rental info
    mapping(uint256 => UserInfo) private _users;

    // Events
    event NFTWrapped(
        uint256 indexed wrapperId,
        address indexed originalContract,
        uint256 indexed originalTokenId,
        address owner,
        address tba
    );

    event NFTUnwrapped(
        uint256 indexed wrapperId,
        address indexed originalContract,
        uint256 indexed originalTokenId,
        address owner
    );

    event RentalStarted(
        uint256 indexed wrapperId,
        address indexed renter,
        uint64 expires
    );

    event RentalEnded(
        uint256 indexed wrapperId,
        address indexed previousRenter
    );

    constructor(
        address _accountImplementation,
        address _rentalManager
    ) ERC721("Fortuna Square Rental Wrapper", "FSRENTAL") Ownable(msg.sender) {
        accountImplementation = _accountImplementation;
        rentalManager = _rentalManager;
    }

    /**
     * @notice Update the rental manager address
     * @dev Only owner can update
     */
    function setRentalManager(address _rentalManager) external onlyOwner {
        rentalManager = _rentalManager;
    }

    /**
     * @notice Wrap an NFT to make it rentable
     * @dev Creates wrapper NFT, TBA, and transfers original NFT into TBA
     * @param originalContract The original NFT contract
     * @param originalTokenId The original NFT token ID
     * @param owner The owner who will receive the wrapper NFT
     * @return wrapperId The new wrapper token ID
     * @return tba The Token Bound Account address
     */
    function wrapNFT(
        address originalContract,
        uint256 originalTokenId,
        address owner
    ) external returns (uint256 wrapperId, address tba) {
        require(msg.sender == rentalManager, "Only RentalManager");

        // Mint wrapper NFT
        wrapperId = _nextTokenId++;
        _safeMint(owner, wrapperId);

        // Create TBA for this wrapper
        tba = _createTBA(wrapperId);

        // Store wrapped NFT info
        wrappedNFTs[wrapperId] = WrappedNFT({
            originalContract: originalContract,
            originalTokenId: originalTokenId,
            tbaAddress: tba
        });

        // Transfer original NFT into TBA
        IERC721(originalContract).transferFrom(msg.sender, tba, originalTokenId);

        emit NFTWrapped(wrapperId, originalContract, originalTokenId, owner, tba);
    }

    /**
     * @notice Unwrap an NFT to return the original
     * @dev Only callable by owner when not actively rented
     * @param wrapperId The wrapper token ID to unwrap
     */
    function unwrapNFT(uint256 wrapperId) external {
        require(ownerOf(wrapperId) == msg.sender, "Not owner");
        require(userOf(wrapperId) == address(0), "Currently rented");

        WrappedNFT memory wrapped = wrappedNFTs[wrapperId];

        // Transfer original NFT from TBA back to owner
        bytes memory data = abi.encodeWithSignature(
            "transferFrom(address,address,uint256)",
            wrapped.tbaAddress,
            msg.sender,
            wrapped.originalTokenId
        );

        FortunaSquareRentalAccount(payable(wrapped.tbaAddress)).executeCall(
            wrapped.originalContract,
            0,
            data
        );

        // Burn wrapper NFT
        _burn(wrapperId);

        emit NFTUnwrapped(wrapperId, wrapped.originalContract, wrapped.originalTokenId, msg.sender);
    }

    /**
     * @notice Set the renter and expiration for a wrapper (ERC4907)
     * @dev Only rental manager can call this
     * @param tokenId The wrapper token ID
     * @param user The renter address
     * @param expires The rental expiration timestamp
     */
    function setUser(uint256 tokenId, address user, uint64 expires) external override {
        require(msg.sender == rentalManager, "Only RentalManager");
        require(expires > block.timestamp, "Expires must be future");

        WrappedNFT memory wrapped = wrappedNFTs[tokenId];

        // If we're setting a new user (rental starting)
        if (user != address(0)) {
            // Delegate original NFT to renter via TBA
            FortunaSquareRentalAccount(payable(wrapped.tbaAddress)).delegateNFT(
                user,                       // Renter gets delegation
                wrapped.originalContract,   // Original NFT contract
                wrapped.originalTokenId,    // Original NFT token ID
                true                        // Enable delegation
            );

            emit RentalStarted(tokenId, user, expires);
        } else {
            // Rental ending - revoke delegation
            address previousUser = _users[tokenId].user;

            if (previousUser != address(0)) {
                FortunaSquareRentalAccount(payable(wrapped.tbaAddress)).delegateNFT(
                    previousUser,
                    wrapped.originalContract,
                    wrapped.originalTokenId,
                    false  // Disable delegation
                );

                emit RentalEnded(tokenId, previousUser);
            }
        }

        // Update rental info
        _users[tokenId] = UserInfo(user, expires);

        emit UpdateUser(tokenId, user, expires);
    }

    /**
     * @notice Get the current renter of a wrapper (ERC4907)
     * @dev Returns address(0) if not rented or expired
     * @param tokenId The wrapper token ID
     * @return address The current renter
     */
    function userOf(uint256 tokenId) public view override returns (address) {
        if (uint256(_users[tokenId].expires) >= block.timestamp) {
            return _users[tokenId].user;
        }
        return address(0);
    }

    /**
     * @notice Get the rental expiration timestamp (ERC4907)
     * @param tokenId The wrapper token ID
     * @return uint64 The expiration timestamp
     */
    function userExpires(uint256 tokenId) external view override returns (uint64) {
        return _users[tokenId].expires;
    }

    /**
     * @notice Create a Token Bound Account for a wrapper token
     * @dev Uses ERC6551 registry to deploy TBA
     * @param tokenId The wrapper token ID
     * @return account The TBA address
     */
    function _createTBA(uint256 tokenId) internal returns (address account) {
        bytes memory data = abi.encodeWithSignature(
            "createAccount(address,bytes32,uint256,address,uint256)",
            accountImplementation,
            bytes32(0), // salt
            block.chainid,
            address(this),
            tokenId
        );

        (bool success, bytes memory result) = ERC6551_REGISTRY.call(data);
        require(success, "TBA creation failed");

        account = abi.decode(result, (address));
    }

    /**
     * @notice Get the TBA address for a wrapper token
     * @param tokenId The wrapper token ID
     * @return address The TBA address
     */
    function getTBA(uint256 tokenId) external view returns (address) {
        return wrappedNFTs[tokenId].tbaAddress;
    }

    /**
     * @notice Get original NFT details for a wrapper
     * @param tokenId The wrapper token ID
     * @return originalContract The original NFT contract
     * @return originalTokenId The original NFT token ID
     */
    function getOriginalNFT(uint256 tokenId) external view returns (address originalContract, uint256 originalTokenId) {
        WrappedNFT memory wrapped = wrappedNFTs[tokenId];
        return (wrapped.originalContract, wrapped.originalTokenId);
    }

    /**
     * @notice ERC165 interface detection
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override
        returns (bool)
    {
        return
            interfaceId == type(IERC4907).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
