// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

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
}

/**
 * @title UnbankedLending
 * @notice Reputation-based lending system for the unbanked
 * @dev Provides microloans based on community reputation without traditional credit checks
 */
contract UnbankedLending is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Events
    event LoanRequested(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount,
        uint256 duration,
        uint256 interestRate
    );
    event LoanApproved(uint256 indexed loanId, address indexed approver);
    event LoanRepaid(
        uint256 indexed loanId,
        uint256 amount,
        bool isFullRepayment
    );
    event LoanDefaulted(uint256 indexed loanId, uint256 remainingDebt);
    event CollateralDeposited(uint256 indexed loanId, uint256 amount);
    event PoolFunded(address indexed funder, uint256 amount);

    // Errors
    error NotRegistered();
    error InsufficientReputation();
    error LoanNotFound();
    error LoanAlreadyApproved();
    error LoanNotApproved();
    error LoanExpired();
    error InsufficientFunds();
    error InvalidAmount();
    error UnauthorizedAccess();

    // Loan structure
    struct Loan {
        uint256 id;
        address borrower;
        uint256 amount;
        uint256 duration; // in seconds
        uint256 interestRate; // basis points (e.g., 1200 = 12%)
        uint256 startTime;
        uint256 endTime;
        uint256 repaidAmount;
        bool approved;
        bool active;
        bool defaulted;
        uint256 collateralAmount;
    }

    // Borrower profile
    struct BorrowerProfile {
        uint256 totalBorrowed;
        uint256 totalRepaid;
        uint256 activeLoans;
        uint256 defaultedLoans;
        uint256 lastLoanTime;
        bool isBanned;
    }

    // State variables
    IERC20 public immutable lendingToken;
    uint256 public loanCounter;
    uint256 public totalPoolFunds;
    uint256 public totalActiveLoans;

    // Loan parameters
    uint256 public constant MIN_LOAN_AMOUNT = 10 * 10 ** 18; // 10 tokens
    uint256 public constant MAX_LOAN_AMOUNT = 1000 * 10 ** 18; // 1000 tokens
    uint256 public constant MIN_LOAN_DURATION = 7 days;
    uint256 public constant MAX_LOAN_DURATION = 90 days;
    uint256 public constant BASE_INTEREST_RATE = 1200; // 12% APR
    uint256 public constant MAX_ACTIVE_LOANS_PER_USER = 3;
    uint256 public constant MIN_REPUTATION_FOR_LOAN = 50;
    uint256 public constant COLLATERAL_RATIO = 150; // 150% collateralization

    // Mappings
    mapping(uint256 => Loan) public loans;
    mapping(address => BorrowerProfile) public borrowerProfiles;
    mapping(address => uint256[]) public userLoans;
    mapping(address => uint256) public collateralBalances;

    // Reference to identity contract
    IUnbankedIdentity public immutable identityContract;

    /**
     * @notice Constructor
     * @param _lendingToken Token to be used for lending
     * @param _identityContract Address of the identity contract
     */
    constructor(
        address _lendingToken,
        address _identityContract
    ) Ownable(msg.sender) {
        lendingToken = IERC20(_lendingToken);
        identityContract = IUnbankedIdentity(_identityContract);
    }

    /**
     * @notice Request a loan
     * @param amount Amount to borrow
     * @param duration Loan duration in seconds
     */
    function requestLoan(
        uint256 amount,
        uint256 duration
    ) external nonReentrant returns (uint256) {
        // Validate input parameters
        if (amount < MIN_LOAN_AMOUNT || amount > MAX_LOAN_AMOUNT) {
            revert InvalidAmount();
        }
        if (duration < MIN_LOAN_DURATION || duration > MAX_LOAN_DURATION) {
            revert InvalidAmount();
        }

        // Check borrower eligibility
        (bool isRegistered, uint256 reputationScore, , ) = identityContract
            .getUserData(msg.sender);

        if (!isRegistered) revert NotRegistered();
        if (reputationScore < MIN_REPUTATION_FOR_LOAN) {
            revert InsufficientReputation();
        }

        BorrowerProfile storage profile = borrowerProfiles[msg.sender];

        // Check if user is banned or has too many active loans
        if (profile.isBanned) revert UnauthorizedAccess();
        if (profile.activeLoans >= MAX_ACTIVE_LOANS_PER_USER) {
            revert UnauthorizedAccess();
        }

        // Calculate interest rate based on reputation and history
        uint256 interestRate = calculateInterestRate(
            msg.sender,
            reputationScore
        );

        // Check if pool has sufficient funds
        if (totalPoolFunds < amount) revert InsufficientFunds();

        // Create loan
        uint256 loanId = ++loanCounter;

        loans[loanId] = Loan({
            id: loanId,
            borrower: msg.sender,
            amount: amount,
            duration: duration,
            interestRate: interestRate,
            startTime: 0, // Set when approved
            endTime: 0,
            repaidAmount: 0,
            approved: false,
            active: false,
            defaulted: false,
            collateralAmount: 0
        });

        userLoans[msg.sender].push(loanId);

        emit LoanRequested(loanId, msg.sender, amount, duration, interestRate);

        return loanId;
    }

    /**
     * @notice Approve a loan (owner or automated system)
     * @param loanId ID of the loan to approve
     */
    function approveLoan(uint256 loanId) external onlyOwner {
        Loan storage loan = loans[loanId];

        if (loan.id == 0) revert LoanNotFound();
        if (loan.approved) revert LoanAlreadyApproved();
        if (totalPoolFunds < loan.amount) revert InsufficientFunds();

        // Approve and activate the loan
        loan.approved = true;
        loan.active = true;
        loan.startTime = block.timestamp;
        loan.endTime = block.timestamp + loan.duration;

        // Update tracking variables
        totalPoolFunds -= loan.amount;
        totalActiveLoans += loan.amount;
        borrowerProfiles[loan.borrower].activeLoans++;
        borrowerProfiles[loan.borrower].totalBorrowed += loan.amount;
        borrowerProfiles[loan.borrower].lastLoanTime = block.timestamp;

        // Transfer funds to borrower
        lendingToken.safeTransfer(loan.borrower, loan.amount);

        emit LoanApproved(loanId, msg.sender);
    }

    /**
     * @notice Repay a loan (partial or full)
     * @param loanId ID of the loan to repay
     * @param amount Amount to repay
     */
    function repayLoan(uint256 loanId, uint256 amount) external nonReentrant {
        Loan storage loan = loans[loanId];

        if (loan.id == 0) revert LoanNotFound();
        if (!loan.active) revert LoanNotApproved();
        if (loan.borrower != msg.sender) revert UnauthorizedAccess();
        if (amount == 0) revert InvalidAmount();

        // Calculate total amount due (principal + interest)
        uint256 totalDue = calculateTotalDue(loanId);
        uint256 remainingDebt = totalDue - loan.repaidAmount;

        // Ensure repayment doesn't exceed remaining debt
        uint256 repaymentAmount = amount > remainingDebt
            ? remainingDebt
            : amount;

        // Transfer repayment from borrower
        lendingToken.safeTransferFrom(
            msg.sender,
            address(this),
            repaymentAmount
        );

        // Update loan and pool
        loan.repaidAmount += repaymentAmount;
        totalPoolFunds += repaymentAmount;

        bool isFullRepayment = loan.repaidAmount >= totalDue;

        if (isFullRepayment) {
            // Loan fully repaid
            loan.active = false;
            totalActiveLoans -= loan.amount;
            borrowerProfiles[loan.borrower].activeLoans--;
            borrowerProfiles[loan.borrower].totalRepaid += loan.repaidAmount;

            // Return any collateral
            if (loan.collateralAmount > 0) {
                collateralBalances[loan.borrower] += loan.collateralAmount;
                loan.collateralAmount = 0;
            }
        }

        emit LoanRepaid(loanId, repaymentAmount, isFullRepayment);
    }

    /**
     * @notice Deposit collateral for a loan
     * @param loanId ID of the loan
     * @param amount Amount of collateral to deposit
     */
    function depositCollateral(uint256 loanId, uint256 amount) external {
        Loan storage loan = loans[loanId];

        if (loan.id == 0) revert LoanNotFound();
        if (loan.borrower != msg.sender) revert UnauthorizedAccess();
        if (!loan.active) revert LoanNotApproved();

        lendingToken.safeTransferFrom(msg.sender, address(this), amount);
        loan.collateralAmount += amount;

        emit CollateralDeposited(loanId, amount);
    }

    /**
     * @notice Mark a loan as defaulted (owner only)
     * @param loanId ID of the loan to default
     */
    function markAsDefaulted(uint256 loanId) external onlyOwner {
        Loan storage loan = loans[loanId];

        if (loan.id == 0) revert LoanNotFound();
        if (!loan.active) revert LoanNotApproved();
        if (block.timestamp <= loan.endTime) revert LoanExpired();

        // Mark as defaulted
        loan.defaulted = true;
        loan.active = false;

        // Update borrower profile
        BorrowerProfile storage profile = borrowerProfiles[loan.borrower];
        profile.activeLoans--;
        profile.defaultedLoans++;

        // Seize collateral if any
        if (loan.collateralAmount > 0) {
            totalPoolFunds += loan.collateralAmount;
            loan.collateralAmount = 0;
        }

        // Calculate remaining debt
        uint256 totalDue = calculateTotalDue(loanId);
        uint256 remainingDebt = totalDue - loan.repaidAmount;

        totalActiveLoans -= loan.amount;

        emit LoanDefaulted(loanId, remainingDebt);
    }

    /**
     * @notice Add funds to the lending pool
     * @param amount Amount to add
     */
    function fundPool(uint256 amount) external {
        if (amount == 0) revert InvalidAmount();

        lendingToken.safeTransferFrom(msg.sender, address(this), amount);
        totalPoolFunds += amount;

        emit PoolFunded(msg.sender, amount);
    }

    /**
     * @notice Calculate interest rate for a borrower
     * @param borrower Address of the borrower
     * @param reputationScore Reputation score from identity contract
     */
    function calculateInterestRate(
        address borrower,
        uint256 reputationScore
    ) public view returns (uint256) {
        BorrowerProfile memory profile = borrowerProfiles[borrower];

        // Base rate adjusted by reputation and history
        uint256 rate = BASE_INTEREST_RATE;

        // Reputation bonus (higher reputation = lower rate)
        if (reputationScore > 100) {
            rate = (rate * 80) / 100; // 20% discount for high reputation
        } else if (reputationScore > 75) {
            rate = (rate * 90) / 100; // 10% discount for good reputation
        }

        // History penalty (defaults increase rate)
        if (profile.defaultedLoans > 0) {
            rate = (rate * (100 + profile.defaultedLoans * 10)) / 100;
        }

        // Good payment history bonus
        if (
            profile.totalRepaid > profile.totalBorrowed &&
            profile.defaultedLoans == 0
        ) {
            rate = (rate * 95) / 100; // 5% discount for excellent history
        }

        return rate;
    }

    /**
     * @notice Calculate total amount due for a loan
     * @param loanId ID of the loan
     */
    function calculateTotalDue(uint256 loanId) public view returns (uint256) {
        Loan memory loan = loans[loanId];

        if (loan.id == 0) return 0;

        // Simple interest calculation
        uint256 timeElapsed = block.timestamp > loan.endTime
            ? loan.duration
            : block.timestamp - loan.startTime;
        uint256 interest = (loan.amount * loan.interestRate * timeElapsed) /
            (10000 * 365 days);

        return loan.amount + interest;
    }

    /**
     * @notice Get loan details
     * @param loanId ID of the loan
     */
    function getLoan(uint256 loanId) external view returns (Loan memory) {
        return loans[loanId];
    }

    /**
     * @notice Get user's loan IDs
     * @param user Address of the user
     */
    function getUserLoans(
        address user
    ) external view returns (uint256[] memory) {
        return userLoans[user];
    }

    /**
     * @notice Get borrower profile
     * @param borrower Address of the borrower
     */
    function getBorrowerProfile(
        address borrower
    ) external view returns (BorrowerProfile memory) {
        return borrowerProfiles[borrower];
    }

    /**
     * @notice Withdraw funds from pool (owner only)
     * @param amount Amount to withdraw
     */
    function withdrawFromPool(uint256 amount) external onlyOwner {
        if (amount > totalPoolFunds) revert InsufficientFunds();

        totalPoolFunds -= amount;
        lendingToken.safeTransfer(owner(), amount);
    }

    /**
     * @notice Ban/unban a borrower (owner only)
     * @param borrower Address to ban/unban
     * @param banned True to ban, false to unban
     */
    function setBorrowerBan(address borrower, bool banned) external onlyOwner {
        borrowerProfiles[borrower].isBanned = banned;
    }
}
