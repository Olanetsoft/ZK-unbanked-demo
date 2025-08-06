import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function generateRandomId(): string {
  return `0x${Math.random().toString(16).substr(2, 40)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function calculateReputation(attestations: any[]): number {
  return attestations.reduce((sum, att) => sum + att.score, 0);
}

export const ATTESTATION_TYPES = {
  VILLAGE_ELDER: {
    type: "village_elder",
    title: "Village Elder Verification",
    description: "Verified by local community leader",
    score: 50,
    icon: "👴",
    color: "purple",
  },
  MERCHANT_VOUCHER: {
    type: "merchant_voucher",
    title: "Merchant Voucher",
    description: "Regular customer of local shop",
    score: 30,
    icon: "🏪",
    color: "blue",
  },
  SAVINGS_GROUP: {
    type: "savings_group",
    title: "Savings Group Member",
    description: "Active in community savings circle",
    score: 40,
    icon: "💰",
    color: "green",
  },
  EDUCATION_COMPLETION: {
    type: "education_completion",
    title: "Education Completion",
    description: "Completed local education program",
    score: 35,
    icon: "🎓",
    color: "yellow",
  },
  BUSINESS_OWNER: {
    type: "business_owner",
    title: "Business Owner",
    description: "Runs a local business",
    score: 45,
    icon: "🏢",
    color: "pink",
  },
};

export const SERVICE_REQUIREMENTS = {
  MICROLOAN: {
    minScore: 50,
    name: "Microloans",
    description: "Access credit based on reputation",
  },
  AIRDROP: {
    minScore: 0,
    name: "Airdrops",
    description: "Claim community rewards",
  },
  GOVERNANCE: {
    minScore: 100,
    name: "Governance",
    description: "Vote on community decisions",
  },
  REMITTANCE: {
    minScore: 0,
    name: "Remittances",
    description: "Send money across borders",
  },
};

export function calculateLoanAmount(reputationScore: number): number {
  const baseLoan = 50;
  const bonusPerPoint = 0.5;
  const maxLoan = 500;

  return Math.min(baseLoan + reputationScore * bonusPerPoint, maxLoan);
}

export function generateMockTransaction(type: string, amount: string) {
  return {
    id: Date.now().toString(),
    type,
    amount,
    status: "completed",
    timestamp: new Date().toISOString(),
    hash: generateRandomId(),
  };
}
