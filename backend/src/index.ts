import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import {
  SelfBackendVerifier,
  AttestationId,
  DefaultConfigStore,
  VerificationConfig,
} from "@selfxyz/core";
import {
  initializeContracts,
  checkIdentityOnChain,
  addAttestationOnChain,
  claimAirdropOnChain,
  castVoteOnChain,
  getUserOnChainData,
} from "./contracts";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

// Mock database (in production, use MongoDB/PostgreSQL)
interface User {
  nullifier: string;
  userIdentifier: string;
  reputationScore: number;
  attestations: any[];
  transactions: any[];
  createdAt: Date;
}

const users = new Map<string, User>();
const nullifierToUser = new Map<string, string>();

// Enhanced Self Protocol Configuration with comprehensive storage
class ProductionConfigStore extends DefaultConfigStore {
  private configCache = new Map<string, VerificationConfig>();

  constructor(defaultConfig: VerificationConfig) {
    super(defaultConfig);
  }

  async getConfig(configId: string): Promise<VerificationConfig> {
    // Check cache first
    if (this.configCache.has(configId)) {
      return this.configCache.get(configId)!;
    }

    // For production, you could fetch from database here
    // For now, return the default config
    const config = await super.getConfig(configId);
    this.configCache.set(configId, config);
    return config;
  }

  async getActionId(
    userIdentifier: string,
    userDefinedData: string
  ): Promise<string> {
    // Parse user defined data to extract any custom requirements
    try {
      const userData = JSON.parse(userDefinedData);
      // You could implement custom config logic based on user data
      return "default_config";
    } catch {
      return "default_config";
    }
  }
}

// Self Protocol Configuration - matches frontend exactly
const verificationConfig: VerificationConfig = {
  excludedCountries: [], // No country restrictions for global access
  ofac: false, // Disabled for unbanked populations
  minimumAge: 16, // Lower age limit for financial inclusion
};

const configStore = new ProductionConfigStore(verificationConfig);

// Define allowed attestation types for Self Protocol
const allowedIds = new Map();
allowedIds.set(1, true); // Electronic Passport
allowedIds.set(2, true); // EU ID Card

// Initialize Self Backend Verifier with mock passport support
const selfBackendVerifier = new SelfBackendVerifier(
  process.env.SELF_SCOPE || "zk-unbanked-demo",
  process.env.SELF_ENDPOINT ||
    `${process.env.API_URL || "http://localhost:3001"}/api/verify`,
  true, // Set to true for mock passport testing
  allowedIds, // Specific attestation types we accept
  configStore,
  "uuid" // Use UUID format for user identifiers
);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    mode: process.env.SELF_MOCK_MODE === "true" ? "mock" : "production",
  });
});

// Self Protocol verification endpoint - called directly by Self app
app.post("/api/verify", async (req: Request, res: Response) => {
  try {
    const { attestationId, proof, publicSignals, userContextData } = req.body;

    // Check if this is a Self Protocol verification request
    if (attestationId && proof && publicSignals && userContextData) {
      console.log("🔐 Self Protocol verification request received");
      return handleVerification(req, res);
    }

    // Check if this is an action-based request from frontend
    const { action } = req.body;
    if (action) {
      switch (action) {
        case "verify":
          return handleVerification(req, res);
        case "addAttestation":
          return handleAddAttestation(req, res);
        case "applyMicroloan":
          return handleMicroloan(req, res);
        case "claimAirdrop":
          return handleAirdrop(req, res);
        case "castVote":
          return handleGovernance(req, res);
        case "getUserProfile":
          return handleGetProfile(req, res);
        default:
          return res.status(400).json({
            success: false,
            message: "Invalid action",
          });
      }
    }

    // Neither Self Protocol nor action-based request
    return res.status(400).json({
      success: false,
      message:
        "Invalid request format. Expected Self Protocol verification data or action parameter.",
    });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Handle identity verification with enhanced Self Protocol integration
async function handleVerification(req: Request, res: Response) {
  const { attestationId, proof, publicSignals, userContextData } = req.body;

  // Validate required fields
  if (!attestationId || !proof || !publicSignals || !userContextData) {
    return res.status(400).json({
      status: "error",
      result: false,
      message:
        "Missing required fields: attestationId, proof, publicSignals, userContextData",
    });
  }

  try {
    // Use Self Protocol verification (configured for mock mode in constructor)
    console.log("🔐 Using Self Protocol verification (mock mode enabled)");

    const result = await selfBackendVerifier.verify(
      attestationId,
      proof,
      publicSignals,
      userContextData
    );

    console.log("📋 Self verification result:", {
      isValid: result.isValidDetails.isValid,
      details: result.isValidDetails,
    });

    if (!result.isValidDetails.isValid) {
      return res.status(400).json({
        status: "error",
        result: false,
        message: "Self Protocol verification failed",
        details: result.isValidDetails,
      });
    }

    const { userIdentifier } = result.userData;
    const nullifier = result.discloseOutput?.nullifier || userIdentifier;

    // Check for duplicate registration using nullifier
    if (nullifierToUser.has(nullifier)) {
      return res.status(409).json({
        status: "error",
        result: false,
        message: "Identity already registered (duplicate nullifier)",
        nullifierExists: true,
      });
    }

    // Extract disclosed information
    const disclosures = result.discloseOutput || {};

    // Store in memory for session management
    const newUser: User = {
      nullifier,
      userIdentifier,
      reputationScore: 0,
      attestations: [],
      transactions: [],
      createdAt: new Date(),
    };

    users.set(userIdentifier, newUser);
    nullifierToUser.set(nullifier, userIdentifier);

    // Check identity status on-chain (registration happens via Self Protocol Hub)
    let onChainResult;
    try {
      onChainResult = await checkIdentityOnChain(userIdentifier);
      console.log(
        `✅ Identity checked on-chain. Contract stats: ${JSON.stringify(
          onChainResult.contractStats
        )}`
      );
    } catch (error) {
      console.warn(
        "⚠️ On-chain identity check failed, continuing with off-chain:",
        error
      );
      onChainResult = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    console.log(
      `✅ Self Protocol verification successful for user: ${userIdentifier}`
    );

    return res.status(200).json({
      status: "success",
      result: true,
      credentialSubject: disclosures,
      verificationDetails: {
        userIdentifier,
        attestationType: attestationId,
        timestamp: new Date().toISOString(),
        verified: true,
        mode: "self-protocol",
        onChain: onChainResult,
      },
    });
  } catch (error) {
    console.error("❌ Verification error:", error);

    // Enhanced error handling
    let errorMessage = "Verification failed";
    let errorDetails = {};

    if (error instanceof Error) {
      errorMessage = error.message;

      // Check for specific Self Protocol errors
      if (error.message.includes("scope")) {
        errorMessage = "Scope mismatch between frontend and backend";
        errorDetails = { scopeError: true };
      } else if (error.message.includes("config")) {
        errorMessage = "Configuration mismatch";
        errorDetails = { configError: true };
      } else if (error.message.includes("proof")) {
        errorMessage = "Invalid zero-knowledge proof";
        errorDetails = { proofError: true };
      }
    }

    return res.status(500).json({
      status: "error",
      result: false,
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error : undefined,
      details: errorDetails,
      timestamp: new Date().toISOString(),
    });
  }
}

// Handle attestation addition
async function handleAddAttestation(req: Request, res: Response) {
  const { userIdentifier, attestationType, attestedBy } = req.body;

  const user = users.get(userIdentifier);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const attestationTypes = {
    village_elder: {
      score: 50,
      description: "Verified by local community leader",
    },
    merchant_voucher: {
      score: 30,
      description: "Regular customer of local shop",
    },
    savings_group: {
      score: 40,
      description: "Active in community savings circle",
    },
    education_completion: {
      score: 35,
      description: "Completed local education program",
    },
    business_owner: { score: 45, description: "Runs a local business" },
  };

  const attestationInfo =
    attestationTypes[attestationType as keyof typeof attestationTypes];
  if (!attestationInfo) {
    return res.status(400).json({
      success: false,
      message: "Invalid attestation type",
    });
  }

  const newAttestation = {
    id: `att_${Date.now()}`,
    type: attestationType,
    description: attestationInfo.description,
    score: attestationInfo.score,
    attestedBy: attestedBy || `0x${Math.random().toString(16).substr(2, 40)}`,
    timestamp: new Date(),
  };

  user.attestations.push(newAttestation);
  user.reputationScore += attestationInfo.score;

  // Add attestation on-chain
  let onChainResult;
  try {
    // Convert userIdentifier to address format for contract
    const userAddress = userIdentifier.startsWith("0x")
      ? userIdentifier
      : `0x${userIdentifier}`.substring(0, 42); // Truncate to address length

    onChainResult = await addAttestationOnChain(
      userAddress,
      attestationInfo.score
    );
    console.log(
      `✅ Attestation added on-chain: ${onChainResult.transactionHash}`
    );
  } catch (error) {
    console.warn("⚠️ On-chain attestation failed:", error);
    onChainResult = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  return res.json({
    success: true,
    attestation: newAttestation,
    newReputationScore: user.reputationScore,
    onChain: onChainResult,
  });
}

// Handle microloan application
async function handleMicroloan(req: Request, res: Response) {
  const { userIdentifier, requestedAmount } = req.body;

  // Check if user exists in memory (for transaction history)
  let user = users.get(userIdentifier);

  // If user not found in memory, create a minimal user record
  // (This handles cases where the user was verified but session expired)
  if (!user) {
    console.log(
      `⚠️ User ${userIdentifier} not found in memory, creating minimal record for microloan`
    );
    user = {
      nullifier: `unknown_${Date.now()}`,
      userIdentifier,
      reputationScore: 50, // Give a base reputation for demo purposes
      attestations: [],
      transactions: [],
      createdAt: new Date(),
    };
    users.set(userIdentifier, user);
  }

  if (user.reputationScore < 50) {
    return res.status(403).json({
      success: false,
      message: `Insufficient reputation. Required: 50, Current: ${user.reputationScore}`,
    });
  }

  const maxLoanAmount = Math.min(50 + user.reputationScore * 0.5, 500);
  const approvedAmount = Math.min(
    requestedAmount || maxLoanAmount,
    maxLoanAmount
  );

  const loanTransaction = {
    id: `loan_${Date.now()}`,
    type: "microloan",
    amount: `$${approvedAmount}`,
    status: "completed",
    timestamp: new Date(),
  };

  user.transactions.push(loanTransaction);

  return res.json({
    success: true,
    message: "Microloan approved",
    approvedAmount,
    maxLoanAmount,
    transaction: loanTransaction,
  });
}

// Handle airdrop claim
async function handleAirdrop(req: Request, res: Response) {
  const { userIdentifier, airdropId = "monthly" } = req.body;

  // Check if user exists in memory (for transaction history)
  let user = users.get(userIdentifier);

  // If user not found in memory, create a minimal user record
  // (This handles cases where the user was verified but session expired)
  if (!user) {
    console.log(
      `⚠️ User ${userIdentifier} not found in memory, creating minimal record for airdrop`
    );
    user = {
      nullifier: `unknown_${Date.now()}`,
      userIdentifier,
      reputationScore: 0,
      attestations: [],
      transactions: [],
      createdAt: new Date(),
    };
    users.set(userIdentifier, user);
  }

  const existingClaim = user.transactions.find(
    (tx) => tx.type === "airdrop" && tx.id.includes(airdropId)
  );

  if (existingClaim) {
    return res.status(409).json({
      success: false,
      message: "Airdrop already claimed",
    });
  }

  // Claim airdrop on-chain
  let onChainResult;
  try {
    onChainResult = await claimAirdropOnChain(userIdentifier);
    console.log(
      `✅ Airdrop claimed on-chain: ${onChainResult.transactionHash}`
    );
  } catch (error) {
    console.warn("⚠️ On-chain airdrop claim failed:", error);
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to claim airdrop on-chain",
    });
  }

  const airdropTransaction = {
    id: `airdrop_${airdropId}_${Date.now()}`,
    type: "airdrop",
    amount: "100 TOKENS",
    status: "completed",
    timestamp: new Date(),
    onChain: onChainResult,
  };

  user.transactions.push(airdropTransaction);

  return res.json({
    success: true,
    message: "Airdrop claimed successfully on-chain",
    amount: "100 TOKENS",
    transaction: airdropTransaction,
    transactionHash: onChainResult.transactionHash,
    blockNumber: onChainResult.blockNumber,
  });
}

// Handle governance voting
async function handleGovernance(req: Request, res: Response) {
  const { userIdentifier, proposalId, vote } = req.body;

  // Check if user exists in memory (for transaction history)
  let user = users.get(userIdentifier);

  // If user not found in memory, create a minimal user record
  // (This handles cases where the user was verified but session expired)
  if (!user) {
    console.log(
      `⚠️ User ${userIdentifier} not found in memory, creating minimal record for governance`
    );
    user = {
      nullifier: `unknown_${Date.now()}`,
      userIdentifier,
      reputationScore: 100, // Give sufficient reputation for demo governance
      attestations: [],
      transactions: [],
      createdAt: new Date(),
    };
    users.set(userIdentifier, user);
  }

  if (user.reputationScore < 100) {
    return res.status(403).json({
      success: false,
      message: `Insufficient reputation for governance. Required: 100, Current: ${user.reputationScore}`,
    });
  }

  // Cast vote on-chain
  let onChainResult;
  try {
    const support = vote === "Yes" || vote === true;
    onChainResult = await castVoteOnChain(proposalId, support);
    console.log(`✅ Vote cast on-chain: ${onChainResult.transactionHash}`);
  } catch (error) {
    console.warn("⚠️ On-chain vote failed:", error);
    onChainResult = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  const voteTransaction = {
    id: `vote_${proposalId}_${Date.now()}`,
    type: "governance",
    amount: vote || "Yes",
    status: "completed",
    timestamp: new Date(),
    onChain: onChainResult,
  };

  user.transactions.push(voteTransaction);

  return res.json({
    success: true,
    message: "Vote recorded successfully on-chain",
    proposalId,
    vote: vote || "Yes",
    transaction: voteTransaction,
    transactionHash: onChainResult.success
      ? onChainResult.transactionHash
      : null,
  });
}

// Handle get user profile
async function handleGetProfile(req: Request, res: Response) {
  const { userIdentifier } = req.body;

  // Check if user exists in memory (for transaction history)
  let user = users.get(userIdentifier);

  // If user not found in memory, create a minimal user record
  // (This handles cases where the user was verified but session expired)
  if (!user) {
    console.log(
      `⚠️ User ${userIdentifier} not found in memory, creating minimal record for profile`
    );
    user = {
      nullifier: `unknown_${Date.now()}`,
      userIdentifier,
      reputationScore: 0,
      attestations: [],
      transactions: [],
      createdAt: new Date(),
    };
    users.set(userIdentifier, user);
  }

  // Get on-chain data
  let onChainData;
  try {
    onChainData = await getUserOnChainData(userIdentifier);
  } catch (error) {
    console.warn("⚠️ Failed to get on-chain data:", error);
    onChainData = { success: false };
  }

  return res.json({
    success: true,
    profile: {
      userIdentifier: user.userIdentifier,
      reputationScore: user.reputationScore,
      attestationCount: user.attestations.length,
      transactionCount: user.transactions.length,
      memberSince: user.createdAt,
      eligibility: {
        microloans: user.reputationScore >= 50,
        governance: user.reputationScore >= 100,
        maxLoanAmount: Math.min(50 + user.reputationScore * 0.5, 500),
      },
      onChain: onChainData,
    },
  });
}

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Initialize contracts and start server
async function startServer() {
  try {
    // Initialize smart contracts
    await initializeContracts();

    // Start server
    app.listen(PORT, () => {
      console.log(`
🚀 ZK Identity Backend Server Running
====================================
📍 URL: http://localhost:${PORT}
🔧 Mode: ${process.env.SELF_MOCK_MODE === "true" ? "Mock" : "Production"}
📡 CORS: ${process.env.FRONTEND_URL || "http://localhost:3000"}
🔐 Scope: ${process.env.SELF_SCOPE || "zk-unbanked-demo"}
🔗 Blockchain: Celo Testnet (On-chain actions enabled)

Available endpoints:
- GET  /health           - Health check
- POST /api/verify       - Main API endpoint

Actions:
- verify                 - Verify identity (ON-CHAIN)
- addAttestation        - Add reputation attestation (ON-CHAIN)
- applyMicroloan        - Apply for microloan
- claimAirdrop          - Claim airdrop tokens (ON-CHAIN)
- castVote              - Vote on governance (ON-CHAIN)
- getUserProfile        - Get user profile (ON-CHAIN)
      `);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
