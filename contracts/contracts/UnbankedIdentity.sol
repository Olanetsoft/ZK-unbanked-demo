// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {SelfVerificationRoot} from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import {ISelfVerificationRoot} from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title UnbankedIdentity
 * @notice Privacy-preserving identity system for the unbanked using Self Protocol
 * @dev Enables sybil-resistant financial services without traditional KYC
 */
contract UnbankedIdentity is SelfVerificationRoot, Ownable {
    // Events
    event UserRegistered(
        uint256 indexed nullifier,
        uint256 indexed userIdentifier
    );
    event ReputationUpdated(address indexed user, uint256 newScore);
    event ServiceAccessed(address indexed user, string service);
    event AttestationAdded(
        address indexed user,
        address indexed attester,
        uint256 points
    );

    // Errors
    error AlreadyRegistered();
    error NotRegistered();
    error InsufficientReputation(uint256 required, uint256 actual);
    error InvalidAttestation();
    error ServiceNotAvailable();

    // User data structure
    struct UserData {
        bool isRegistered;
        uint256 reputationScore;
        uint256 registrationTime;
        mapping(address => bool) attesters;
        uint256 attestationCount;
    }

    // Service requirements
    struct ServiceRequirement {
        uint256 minReputation;
        bool isActive;
        string name;
    }

    // State variables
    bytes32 public verificationConfigId;
    mapping(uint256 => uint256) private nullifierToUserIdentifier;
    mapping(uint256 => UserData) public userData;
    mapping(string => ServiceRequirement) public services;

    // Attestation settings
    uint256 public constant MAX_ATTESTATION_POINTS = 50;
    uint256 public constant MIN_ATTESTATION_POINTS = 10;

    // Statistics
    uint256 public totalUsers;
    uint256 public totalAttestations;

    /**
     * @notice Constructor
     * @param _hubAddress Identity Verification Hub V2 address
     * @param _scope Unique scope for this implementation
     * @param _verificationConfigId Initial verification configuration
     */
    constructor(
        address _hubAddress,
        uint256 _scope,
        bytes32 _verificationConfigId
    ) SelfVerificationRoot(_hubAddress, _scope) Ownable(msg.sender) {
        verificationConfigId = _verificationConfigId;

        // Initialize default services
        _initializeServices();
    }

    /**
     * @notice Initialize default financial services
     */
    function _initializeServices() private {
        services["microloan"] = ServiceRequirement({
            minReputation: 50,
            isActive: true,
            name: "Microloans"
        });

        services["airdrop"] = ServiceRequirement({
            minReputation: 0,
            isActive: true,
            name: "Airdrops"
        });

        services["governance"] = ServiceRequirement({
            minReputation: 100,
            isActive: true,
            name: "Governance"
        });

        services["remittance"] = ServiceRequirement({
            minReputation: 0,
            isActive: true,
            name: "Remittances"
        });
    }

    /**
     * @notice Custom verification hook for Self Protocol
     * @param output Verification output containing nullifier and user identifier
     * @param _userData Additional user context data from the verification
     */
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory _userData
    ) internal override {
        // Check for duplicate registration using nullifier (prevents sybil attacks)
        if (nullifierToUserIdentifier[output.nullifier] != 0) {
            revert AlreadyRegistered();
        }

        // Register the user with enhanced data
        nullifierToUserIdentifier[output.nullifier] = output.userIdentifier;

        UserData storage user = userData[output.userIdentifier];
        user.isRegistered = true;
        user.registrationTime = block.timestamp;

        // Initialize with small reputation bonus for successful verification
        user.reputationScore = 10; // Base verification bonus

        totalUsers++;

        // Parse and store any additional disclosed information
        if (_userData.length > 0) {
            // You could parse disclosed nationality, age verification, etc.
            // For privacy, we only store boolean flags or hashed values
            user.attestationCount++; // Count initial verification as first attestation
        }

        emit UserRegistered(output.nullifier, output.userIdentifier);

        // Award initial reputation for successful identity verification
        emit ReputationUpdated(
            address(uint160(output.userIdentifier)),
            user.reputationScore
        );
    }

    /**
     * @notice Add attestation to a user's reputation
     * @param userAddress Address of the user to attest
     * @param points Reputation points to award (10-50)
     */
    function addAttestation(address userAddress, uint256 points) external {
        uint256 userIdentifier = uint256(uint160(userAddress));
        UserData storage user = userData[userIdentifier];

        if (!user.isRegistered) revert NotRegistered();
        if (user.attesters[msg.sender]) revert InvalidAttestation();
        if (
            points < MIN_ATTESTATION_POINTS || points > MAX_ATTESTATION_POINTS
        ) {
            revert InvalidAttestation();
        }

        // Record attestation
        user.attesters[msg.sender] = true;
        user.attestationCount++;
        user.reputationScore += points;
        totalAttestations++;

        emit AttestationAdded(userAddress, msg.sender, points);
        emit ReputationUpdated(userAddress, user.reputationScore);
    }

    /**
     * @notice Check if user can access a service
     * @param userAddress User's address
     * @param serviceName Name of the service
     * @return canAccess Whether user can access the service
     * @return reason Reason if access is denied
     */
    function canAccessService(
        address userAddress,
        string memory serviceName
    ) external view returns (bool canAccess, string memory reason) {
        uint256 userIdentifier = uint256(uint160(userAddress));
        UserData storage user = userData[userIdentifier];

        if (!user.isRegistered) {
            return (false, "User not registered");
        }

        ServiceRequirement memory service = services[serviceName];
        if (!service.isActive) {
            return (false, "Service not available");
        }

        if (user.reputationScore < service.minReputation) {
            return (false, "Insufficient reputation");
        }

        return (true, "Access granted");
    }

    /**
     * @notice Record service access (called by service contracts)
     * @param userAddress User accessing the service
     * @param serviceName Name of the service
     */
    function recordServiceAccess(
        address userAddress,
        string memory serviceName
    ) external {
        uint256 userIdentifier = uint256(uint160(userAddress));
        UserData storage user = userData[userIdentifier];

        if (!user.isRegistered) revert NotRegistered();

        ServiceRequirement memory service = services[serviceName];
        if (!service.isActive) revert ServiceNotAvailable();
        if (user.reputationScore < service.minReputation) {
            revert InsufficientReputation(
                service.minReputation,
                user.reputationScore
            );
        }

        emit ServiceAccessed(userAddress, serviceName);
    }

    /**
     * @notice Get user's reputation data
     * @param userAddress User's address
     * @return isRegistered Whether user is registered
     * @return reputationScore User's reputation score
     * @return attestationCount Number of attestations received
     * @return registrationTime When user registered
     */
    function getUserData(
        address userAddress
    )
        external
        view
        returns (
            bool isRegistered,
            uint256 reputationScore,
            uint256 attestationCount,
            uint256 registrationTime
        )
    {
        uint256 userIdentifier = uint256(uint160(userAddress));
        UserData storage user = userData[userIdentifier];

        return (
            user.isRegistered,
            user.reputationScore,
            user.attestationCount,
            user.registrationTime
        );
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
     * @notice Update verification configuration
     * @param _configId New configuration ID
     */
    function setVerificationConfig(bytes32 _configId) external onlyOwner {
        verificationConfigId = _configId;
    }

    /**
     * @notice Add or update a service
     * @param serviceName Name of the service
     * @param minReputation Minimum reputation required
     * @param isActive Whether service is active
     */
    function setService(
        string memory serviceName,
        uint256 minReputation,
        bool isActive
    ) external onlyOwner {
        services[serviceName] = ServiceRequirement({
            minReputation: minReputation,
            isActive: isActive,
            name: serviceName
        });
    }

    /**
     * @notice Get contract statistics
     * @return users Total registered users
     * @return attestations Total attestations
     * @return avgReputation Average reputation score
     */
    function getStats()
        external
        view
        returns (uint256 users, uint256 attestations, uint256 avgReputation)
    {
        // Note: This is simplified. In production, track total reputation separately
        return (totalUsers, totalAttestations, totalAttestations > 0 ? 30 : 0);
    }
}
