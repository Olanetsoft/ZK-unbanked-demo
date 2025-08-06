import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import {
  SelfBackendVerifier,
  AllIds,
  DefaultConfigStore,
  VerificationConfig,
} from "@selfxyz/core";

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

// Self Protocol Configuration
const verificationConfig: VerificationConfig = {
  excludedCountries: [],
  ofac: false,
  minimumAge: 16,
};

const configStore = new DefaultConfigStore(verificationConfig);

// Initialize Self Backend Verifier
const selfBackendVerifier = new SelfBackendVerifier(
  process.env.SELF_SCOPE || "zk-unbanked-demo",
  `${process.env.API_URL || "http://localhost:3001"}/api/verify`,
  process.env.SELF_MOCK_MODE === "true",
  AllIds,
  configStore,
  "HEX" // Default user ID type as string
);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    mode: process.env.SELF_MOCK_MODE === "true" ? "mock" : "production",
  });
});

// Main API endpoint
app.post("/api/verify", async (req: Request, res: Response) => {
  try {
    const { action } = req.body;

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
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Handle identity verification
async function handleVerification(req: Request, res: Response) {
  const { attestationId, proof, publicSignals, userContextData } = req.body;

  try {
    if (process.env.SELF_MOCK_MODE === "true") {
      // Mock mode for demo
      const mockNullifier = `null_${Date.now()}`;
      const mockUserIdentifier = `0x${Math.random()
        .toString(16)
        .substr(2, 40)}`;

      if (nullifierToUser.has(mockNullifier)) {
        return res.status(409).json({
          success: false,
          message: "Identity already registered",
        });
      }

      const newUser: User = {
        nullifier: mockNullifier,
        userIdentifier: mockUserIdentifier,
        reputationScore: 0,
        attestations: [],
        transactions: [],
        createdAt: new Date(),
      };

      users.set(mockUserIdentifier, newUser);
      nullifierToUser.set(mockNullifier, mockUserIdentifier);

      return res.json({
        success: true,
        message: "Identity verified successfully",
        userIdentifier: mockUserIdentifier,
        reputationScore: 0,
      });
    } else {
      // Production mode with real Self verification
      const result = await selfBackendVerifier.verify(
        attestationId,
        proof,
        publicSignals,
        userContextData
      );

      if (!result.isValidDetails.isValid) {
        return res.status(400).json({
          success: false,
          message: "Verification failed",
          details: result.isValidDetails,
        });
      }

      const { userIdentifier, userDefinedData } = result.userData;

      // Use userIdentifier as both identifier and nullifier for now
      // since the API structure has changed

      if (nullifierToUser.has(userIdentifier)) {
        return res.status(409).json({
          success: false,
          message: "Identity already registered",
        });
      }

      const newUser: User = {
        nullifier: userIdentifier, // Using userIdentifier as nullifier
        userIdentifier,
        reputationScore: 0,
        attestations: [],
        transactions: [],
        createdAt: new Date(),
      };

      users.set(userIdentifier, newUser);
      nullifierToUser.set(userIdentifier, userIdentifier);

      return res.json({
        success: true,
        message: "Identity verified successfully",
        userIdentifier,
        reputationScore: 0,
        disclosures: result.discloseOutput,
      });
    }
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Verification failed",
      error: error instanceof Error ? error.message : "Unknown error",
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

  return res.json({
    success: true,
    attestation: newAttestation,
    newReputationScore: user.reputationScore,
  });
}

// Handle microloan application
async function handleMicroloan(req: Request, res: Response) {
  const { userIdentifier, requestedAmount } = req.body;

  const user = users.get(userIdentifier);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
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

  const user = users.get(userIdentifier);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
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

  const airdropTransaction = {
    id: `airdrop_${airdropId}_${Date.now()}`,
    type: "airdrop",
    amount: "100 TOKENS",
    status: "completed",
    timestamp: new Date(),
  };

  user.transactions.push(airdropTransaction);

  return res.json({
    success: true,
    message: "Airdrop claimed successfully",
    amount: "100 TOKENS",
    transaction: airdropTransaction,
  });
}

// Handle governance voting
async function handleGovernance(req: Request, res: Response) {
  const { userIdentifier, proposalId, vote } = req.body;

  const user = users.get(userIdentifier);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (user.reputationScore < 100) {
    return res.status(403).json({
      success: false,
      message: `Insufficient reputation for governance. Required: 100, Current: ${user.reputationScore}`,
    });
  }

  const voteTransaction = {
    id: `vote_${proposalId}_${Date.now()}`,
    type: "governance",
    amount: vote || "Yes",
    status: "completed",
    timestamp: new Date(),
  };

  user.transactions.push(voteTransaction);

  return res.json({
    success: true,
    message: "Vote recorded successfully",
    proposalId,
    vote: vote || "Yes",
    transaction: voteTransaction,
  });
}

// Handle get user profile
async function handleGetProfile(req: Request, res: Response) {
  const { userIdentifier } = req.body;

  const user = users.get(userIdentifier);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
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

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 ZK Identity Backend Server Running
====================================
📍 URL: http://localhost:${PORT}
🔧 Mode: ${process.env.SELF_MOCK_MODE === "true" ? "Mock" : "Production"}
📡 CORS: ${process.env.FRONTEND_URL || "http://localhost:3000"}
🔐 Scope: ${process.env.SELF_SCOPE || "zk-unbanked-demo"}

Available endpoints:
- GET  /health           - Health check
- POST /api/verify       - Main API endpoint

Actions:
- verify                 - Verify identity
- addAttestation        - Add reputation attestation  
- applyMicroloan        - Apply for microloan
- claimAirdrop          - Claim airdrop tokens
- castVote              - Vote on governance
- getUserProfile        - Get user profile
  `);
});
