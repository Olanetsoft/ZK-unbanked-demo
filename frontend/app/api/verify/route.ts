import { NextRequest, NextResponse } from "next/server";

// Mock database for demo
const users = new Map<string, any>();
const nullifierToUser = new Map<string, string>();

// Mock attestation types
const ATTESTATION_TYPES = {
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "verify":
        return handleVerification(body);

      case "addAttestation":
        return handleAddAttestation(body);

      case "applyMicroloan":
        return handleMicroloan(body);

      case "claimAirdrop":
        return handleAirdrop(body);

      case "castVote":
        return handleGovernance(body);

      case "getUserProfile":
        return handleGetProfile(body);

      default:
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleVerification(body: any) {
  // In production, this would verify with Self Protocol
  // For demo, we'll simulate the verification

  const mockNullifier = `null_${Date.now()}`;
  const mockUserIdentifier = `0x${Math.random().toString(16).substr(2, 40)}`;

  // Check for duplicate registration
  if (nullifierToUser.has(mockNullifier)) {
    return NextResponse.json(
      { success: false, message: "Identity already registered" },
      { status: 409 }
    );
  }

  // Create new user
  const newUser = {
    nullifier: mockNullifier,
    userIdentifier: mockUserIdentifier,
    reputationScore: 0,
    attestations: [],
    transactions: [],
    createdAt: new Date().toISOString(),
  };

  users.set(mockUserIdentifier, newUser);
  nullifierToUser.set(mockNullifier, mockUserIdentifier);

  return NextResponse.json({
    success: true,
    message: "Identity verified successfully",
    userIdentifier: mockUserIdentifier,
    reputationScore: 0,
  });
}

async function handleAddAttestation(body: any) {
  const { userIdentifier, attestationType, attestedBy } = body;

  const user = users.get(userIdentifier);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  const attestationInfo =
    ATTESTATION_TYPES[attestationType as keyof typeof ATTESTATION_TYPES];
  if (!attestationInfo) {
    return NextResponse.json(
      { success: false, message: "Invalid attestation type" },
      { status: 400 }
    );
  }

  // Check for duplicate attestation
  const existingAttestation = user.attestations.find(
    (att: any) => att.type === attestationType && att.attestedBy === attestedBy
  );

  if (existingAttestation) {
    return NextResponse.json(
      { success: false, message: "Attestation already exists" },
      { status: 409 }
    );
  }

  // Add attestation
  const newAttestation = {
    id: `att_${Date.now()}`,
    type: attestationType,
    description: attestationInfo.description,
    score: attestationInfo.score,
    attestedBy: attestedBy || `0x${Math.random().toString(16).substr(2, 40)}`,
    timestamp: new Date().toISOString(),
  };

  user.attestations.push(newAttestation);
  user.reputationScore += attestationInfo.score;

  return NextResponse.json({
    success: true,
    attestation: newAttestation,
    newReputationScore: user.reputationScore,
  });
}

async function handleMicroloan(body: any) {
  const { userIdentifier, requestedAmount } = body;

  const user = users.get(userIdentifier);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  // Check reputation requirement
  if (user.reputationScore < 50) {
    return NextResponse.json(
      {
        success: false,
        message: `Insufficient reputation. Required: 50, Current: ${user.reputationScore}`,
      },
      { status: 403 }
    );
  }

  // Calculate loan eligibility
  const maxLoanAmount = Math.min(50 + user.reputationScore * 0.5, 500);
  const approvedAmount = Math.min(
    requestedAmount || maxLoanAmount,
    maxLoanAmount
  );

  // Check for active loans
  const activeLoan = user.transactions.find(
    (tx: any) => tx.type === "microloan" && tx.status === "pending"
  );

  if (activeLoan) {
    return NextResponse.json(
      { success: false, message: "Active loan already exists" },
      { status: 409 }
    );
  }

  // Create loan transaction
  const loanTransaction = {
    id: `loan_${Date.now()}`,
    type: "microloan",
    amount: `$${approvedAmount}`,
    status: "completed",
    timestamp: new Date().toISOString(),
  };

  user.transactions.push(loanTransaction);

  return NextResponse.json({
    success: true,
    message: "Microloan approved",
    approvedAmount,
    maxLoanAmount,
    transaction: loanTransaction,
  });
}

async function handleAirdrop(body: any) {
  const { userIdentifier, airdropId = "monthly" } = body;

  const user = users.get(userIdentifier);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  // Check if already claimed
  const existingClaim = user.transactions.find(
    (tx: any) => tx.type === "airdrop" && tx.id.includes(airdropId)
  );

  if (existingClaim) {
    return NextResponse.json(
      { success: false, message: "Airdrop already claimed" },
      { status: 409 }
    );
  }

  // Create airdrop transaction
  const airdropTransaction = {
    id: `airdrop_${airdropId}_${Date.now()}`,
    type: "airdrop",
    amount: "100 TOKENS",
    status: "completed",
    timestamp: new Date().toISOString(),
  };

  user.transactions.push(airdropTransaction);

  return NextResponse.json({
    success: true,
    message: "Airdrop claimed successfully",
    amount: "100 TOKENS",
    transaction: airdropTransaction,
  });
}

async function handleGovernance(body: any) {
  const { userIdentifier, proposalId, vote } = body;

  const user = users.get(userIdentifier);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  // Check reputation requirement
  if (user.reputationScore < 100) {
    return NextResponse.json(
      {
        success: false,
        message: `Insufficient reputation for governance. Required: 100, Current: ${user.reputationScore}`,
      },
      { status: 403 }
    );
  }

  // Check if already voted
  const existingVote = user.transactions.find(
    (tx: any) => tx.type === "governance" && tx.id.includes(proposalId)
  );

  if (existingVote) {
    return NextResponse.json(
      { success: false, message: "Already voted on this proposal" },
      { status: 409 }
    );
  }

  // Record vote
  const voteTransaction = {
    id: `vote_${proposalId}_${Date.now()}`,
    type: "governance",
    amount: vote || "Yes",
    status: "completed",
    timestamp: new Date().toISOString(),
  };

  user.transactions.push(voteTransaction);

  return NextResponse.json({
    success: true,
    message: "Vote recorded successfully",
    proposalId,
    vote: vote || "Yes",
    transaction: voteTransaction,
  });
}

async function handleGetProfile(body: any) {
  const { userIdentifier } = body;

  const user = users.get(userIdentifier);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
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
