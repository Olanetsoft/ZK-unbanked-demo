// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {SelfVerificationRoot} from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import {ISelfVerificationRoot} from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title UnbankedCommunityAirdrop
 * @notice Enables privacy-preserving airdrops for unbanked communities using Self Protocol
 * @dev Implements sybil-resistant distribution without requiring traditional KYC
 */
contract UnbankedCommunityAirdrop is SelfVerificationRoot, Ownable {
    using SafeERC20 for IERC20;

    // Events
    event UserRegistered(
        uint256 indexed nullifier,
        uint256 indexed userIdentifier
    );
    event AirdropClaimed(address indexed user, uint256 amount);
    event ReputationBonusEarned(
        address indexed user,
        uint256 bonusAmount,
        string reason
    );
    event PhaseChanged(Phase newPhase);

    // Errors
    error RegistrationNotOpen();
    error ClaimNotOpen();
    error AlreadyRegistered();
    error NotRegistered();
    error AlreadyClaimed();
    error InvalidProof();
    error InsufficientBalance();

    // Phases of the airdrop
    enum Phase {
        Setup,
        Registration,
        Claim,
        Ended
    }

    // User registration data
    struct UserData {
        bool isRegistered;
        bool hasClaimed;
        uint256 baseAllocation;
        uint256 reputationBonus;
        uint256 registrationTime;
    }

    // State variables
    Phase public currentPhase;
    IERC20 public immutable token;
    bytes32 public verificationConfigId;
    bytes32 public merkleRoot;

    // Base allocation per verified user
    uint256 public constant BASE_ALLOCATION = 100 * 10 ** 18; // 100 tokens

    // Reputation bonus rates
    uint256 public constant EARLY_BIRD_BONUS = 20 * 10 ** 18; // 20 tokens for early registration
    uint256 public constant COMMUNITY_REFERRAL_BONUS = 10 * 10 ** 18; // 10 tokens per referral

    // Mappings
    mapping(uint256 => uint256) private nullifierToUserIdentifier;
    mapping(uint256 => UserData) public userData;
    mapping(address => bool) public claimed;

    // Statistics
    uint256 public totalRegistered;
    uint256 public totalClaimed;
    uint256 public totalDistributed;

    /**
     * @notice Constructor
     * @param _hubAddress Identity Verification Hub V2 address
     * @param _scope Unique scope for this airdrop
     * @param _token ERC20 token to distribute
     * @param _verificationConfigId Initial verification configuration
     */
    constructor(
        address _hubAddress,
        uint256 _scope,
        address _token,
        bytes32 _verificationConfigId
    ) SelfVerificationRoot(_hubAddress, _scope) Ownable(msg.sender) {
        token = IERC20(_token);
        verificationConfigId = _verificationConfigId;
        currentPhase = Phase.Setup;
    }

    /**
     * @notice Custom verification hook called after successful identity verification
     * @param output Verification output containing nullifier and user identifier
     */
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory /* _userData */
    ) internal override {
        if (currentPhase != Phase.Registration) revert RegistrationNotOpen();

        // Check for duplicate registration using nullifier
        if (nullifierToUserIdentifier[output.nullifier] != 0)
            revert AlreadyRegistered();

        // Register the user
        nullifierToUserIdentifier[output.nullifier] = output.userIdentifier;

        UserData storage user = userData[output.userIdentifier];
        user.isRegistered = true;
        user.baseAllocation = BASE_ALLOCATION;
        user.registrationTime = block.timestamp;

        // Award early bird bonus for first 100 registrants
        if (totalRegistered < 100) {
            user.reputationBonus += EARLY_BIRD_BONUS;
            emit ReputationBonusEarned(
                address(uint160(output.userIdentifier)),
                EARLY_BIRD_BONUS,
                "Early Bird"
            );
        }

        totalRegistered++;
        emit UserRegistered(output.nullifier, output.userIdentifier);
    }

    /**
     * @notice Claim airdrop tokens with optional merkle proof for bonus allocation
     * @param merkleProof Proof for additional bonus allocation (optional)
     * @param bonusAmount Additional bonus amount from merkle tree (optional)
     */
    function claimAirdrop(
        bytes32[] calldata merkleProof,
        uint256 bonusAmount
    ) external {
        if (currentPhase != Phase.Claim) revert ClaimNotOpen();

        uint256 userIdentifier = uint256(uint160(msg.sender));
        UserData storage user = userData[userIdentifier];

        if (!user.isRegistered) revert NotRegistered();
        if (user.hasClaimed) revert AlreadyClaimed();

        uint256 totalAmount = user.baseAllocation + user.reputationBonus;

        // Verify merkle proof for additional bonus if provided
        if (merkleProof.length > 0 && merkleRoot != bytes32(0)) {
            bytes32 leaf = keccak256(abi.encodePacked(msg.sender, bonusAmount));
            if (MerkleProof.verify(merkleProof, merkleRoot, leaf)) {
                totalAmount += bonusAmount;
                emit ReputationBonusEarned(
                    msg.sender,
                    bonusAmount,
                    "Community Contribution"
                );
            }
        }

        // Check contract has sufficient balance
        if (token.balanceOf(address(this)) < totalAmount)
            revert InsufficientBalance();

        // Mark as claimed and transfer tokens
        user.hasClaimed = true;
        claimed[msg.sender] = true;
        totalClaimed++;
        totalDistributed += totalAmount;

        token.safeTransfer(msg.sender, totalAmount);
        emit AirdropClaimed(msg.sender, totalAmount);
    }

    /**
     * @notice Award reputation bonus to a user (only owner)
     * @param user Address of the user
     * @param amount Bonus amount to award
     * @param reason Reason for the bonus
     */
    function awardReputationBonus(
        address user,
        uint256 amount,
        string calldata reason
    ) external onlyOwner {
        uint256 userIdentifier = uint256(uint160(user));
        userData[userIdentifier].reputationBonus += amount;
        emit ReputationBonusEarned(user, amount, reason);
    }

    /**
     * @notice Get configuration ID for verification
     */
    function getConfigId(
        bytes32 /* destinationChainId */,
        bytes32 /* userIdentifier */,
        bytes memory /* userDefinedData */
    ) public view override returns (bytes32) {
        return verificationConfigId;
    }

    // Admin functions

    /**
     * @notice Move to next phase
     */
    function advancePhase() external onlyOwner {
        if (currentPhase == Phase.Setup) {
            currentPhase = Phase.Registration;
        } else if (currentPhase == Phase.Registration) {
            currentPhase = Phase.Claim;
        } else if (currentPhase == Phase.Claim) {
            currentPhase = Phase.Ended;
        }
        emit PhaseChanged(currentPhase);
    }

    /**
     * @notice Update verification configuration
     */
    function setVerificationConfig(bytes32 _configId) external onlyOwner {
        verificationConfigId = _configId;
    }

    /**
     * @notice Set merkle root for bonus allocations
     */
    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }

    /**
     * @notice Emergency token recovery
     */
    function recoverTokens(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).safeTransfer(owner(), _amount);
    }

    // View functions

    /**
     * @notice Check if a user is registered
     */
    function isUserRegistered(address user) external view returns (bool) {
        return userData[uint256(uint160(user))].isRegistered;
    }

    /**
     * @notice Get user's total claimable amount
     */
    function getClaimableAmount(address user) external view returns (uint256) {
        UserData memory data = userData[uint256(uint160(user))];
        if (!data.isRegistered || data.hasClaimed) return 0;
        return data.baseAllocation + data.reputationBonus;
    }

    /**
     * @notice Get airdrop statistics
     */
    function getStats()
        external
        view
        returns (
            uint256 registered,
            uint256 totalClaims,
            uint256 distributed,
            uint256 remaining
        )
    {
        return (
            totalRegistered,
            totalClaimed,
            totalDistributed,
            token.balanceOf(address(this))
        );
    }
}
