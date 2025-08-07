// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IUnbankedIdentity
 * @notice Interface for the UnbankedIdentity contract
 */
interface IUnbankedIdentity {
    function getUserData(
        address user
    )
        external
        view
        returns (
            bool isRegistered,
            uint256 reputationScore,
            uint256 attestationCount,
            uint256 registrationTime
        );
    function totalUsers() external view returns (uint256);
}

/**
 * @title UnbankedGovernance
 * @notice Simple governance system for verified unbanked users
 * @dev Enables voting based on reputation from UnbankedIdentity contract
 */
contract UnbankedGovernance is Ownable {
    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        string description,
        uint256 endTime
    );
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 votingPower
    );
    event ProposalExecuted(uint256 indexed proposalId);

    // Errors
    error ProposalNotFound();
    error VotingNotActive();
    error AlreadyVoted();
    error InsufficientReputation(uint256 required, uint256 actual);
    error ProposalNotExecutable();
    error NotVerifiedIdentity();

    // Structs
    struct Proposal {
        uint256 id;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        mapping(address => bool) hasVoted;
        uint256 minReputationRequired;
    }

    // State variables
    uint256 public nextProposalId;
    mapping(uint256 => Proposal) public proposals;
    IUnbankedIdentity public immutable identityContract;

    // Minimum reputation required to create a proposal
    uint256 public constant MIN_REPUTATION_TO_CREATE_PROPOSAL = 150;

    /**
     * @notice Constructor
     * @param _identityContract Address of the UnbankedIdentity contract
     */
    constructor(address _identityContract) Ownable(msg.sender) {
        identityContract = IUnbankedIdentity(_identityContract);
        nextProposalId = 1;
    }

    /**
     * @notice Create a new governance proposal
     * @param _description Description of the proposal
     * @param _votingDurationDays Duration of the voting period in days
     * @param _minReputationRequired Minimum reputation score required to vote on this proposal
     */
    function createProposal(
        string memory _description,
        uint256 _votingDurationDays,
        uint256 _minReputationRequired
    ) external onlyOwner {
        uint256 proposalId = nextProposalId++;
        Proposal storage proposal = proposals[proposalId];

        proposal.id = proposalId;
        proposal.description = _description;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + (_votingDurationDays * 1 days);
        proposal.minReputationRequired = _minReputationRequired;

        emit ProposalCreated(proposalId, _description, proposal.endTime);
    }

    /**
     * @notice Cast a vote on a proposal
     * @param _proposalId ID of the proposal to vote on
     * @param _support True for 'for', false for 'against'
     */
    function vote(uint256 _proposalId, bool _support) external {
        Proposal storage proposal = proposals[_proposalId];
        if (proposal.id == 0) revert ProposalNotFound();
        if (
            block.timestamp > proposal.endTime ||
            block.timestamp < proposal.startTime
        ) revert VotingNotActive();
        if (proposal.hasVoted[msg.sender]) revert AlreadyVoted();

        (bool isRegistered, uint256 reputationScore, , ) = identityContract
            .getUserData(msg.sender);
        if (!isRegistered) revert NotVerifiedIdentity();
        if (reputationScore < proposal.minReputationRequired) {
            revert InsufficientReputation(
                proposal.minReputationRequired,
                reputationScore
            );
        }

        proposal.hasVoted[msg.sender] = true;
        uint256 votingPower = reputationScore; // Voting power scales with reputation

        if (_support) {
            proposal.forVotes += votingPower;
        } else {
            proposal.againstVotes += votingPower;
        }

        emit VoteCast(_proposalId, msg.sender, _support, votingPower);
    }

    /**
     * @notice Execute a proposal (only owner)
     * @param _proposalId ID of the proposal to execute
     */
    function executeProposal(uint256 _proposalId) external onlyOwner {
        Proposal storage proposal = proposals[_proposalId];
        if (proposal.id == 0) revert ProposalNotFound();
        if (block.timestamp <= proposal.endTime) revert VotingNotActive(); // Voting must be over
        if (proposal.executed) revert ProposalNotExecutable();
        if (proposal.forVotes <= proposal.againstVotes)
            revert ProposalNotExecutable(); // Must pass

        proposal.executed = true;
        // Add actual execution logic here (e.g., call another contract)
        emit ProposalExecuted(_proposalId);
    }

    /**
     * @notice Get proposal details
     * @param _proposalId ID of the proposal
     */
    function getProposal(
        uint256 _proposalId
    )
        external
        view
        returns (
            uint256 id,
            string memory description,
            uint256 startTime,
            uint256 endTime,
            uint256 forVotes,
            uint256 againstVotes,
            bool executed,
            uint256 minReputationRequired
        )
    {
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.id,
            proposal.description,
            proposal.startTime,
            proposal.endTime,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.executed,
            proposal.minReputationRequired
        );
    }

    /**
     * @notice Check if an address has voted on a proposal
     * @param _proposalId ID of the proposal
     * @param _voter Address of the voter
     */
    function hasVoted(
        uint256 _proposalId,
        address _voter
    ) external view returns (bool) {
        return proposals[_proposalId].hasVoted[_voter];
    }

    // Admin functions
    function setIdentityContract(address _newAddress) external onlyOwner {
        // Note: This is dangerous in production, consider making immutable
        // identityContract = IUnbankedIdentity(_newAddress);
    }
}
