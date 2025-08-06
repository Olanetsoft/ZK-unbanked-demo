"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coins,
  Vote,
  Send,
  Award,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Globe,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import {
  calculateLoanAmount,
  generateMockTransaction,
  SERVICE_REQUIREMENTS,
} from "@/lib/utils";
import toast from "react-hot-toast";

interface ServiceGridProps {
  userIdentifier: string;
  reputationScore: number;
  onBack: () => void;
}

interface Transaction {
  id: string;
  type: string;
  amount: string;
  status: string;
  timestamp: string;
  hash?: string;
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({
  userIdentifier,
  reputationScore,
  onBack,
}) => {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const services = [
    {
      id: "microloan",
      icon: Coins,
      title: "Anonymous Microloans",
      description: "Get instant credit based on your reputation score",
      minScore: SERVICE_REQUIREMENTS.MICROLOAN.minScore,
      available: reputationScore >= SERVICE_REQUIREMENTS.MICROLOAN.minScore,
      stats: {
        available: `$${calculateLoanAmount(reputationScore)}`,
        apr: "12%",
        term: "30 days",
      },
    },
    {
      id: "airdrop",
      icon: Award,
      title: "Community Airdrops",
      description: "Claim tokens from community distributions",
      minScore: SERVICE_REQUIREMENTS.AIRDROP.minScore,
      available: true,
      stats: {
        available: "100 TOKENS",
        frequency: "Monthly",
        nextDrop: "In 5 days",
      },
    },
    {
      id: "governance",
      icon: Vote,
      title: "DAO Governance",
      description: "Vote on community proposals anonymously",
      minScore: SERVICE_REQUIREMENTS.GOVERNANCE.minScore,
      available: reputationScore >= SERVICE_REQUIREMENTS.GOVERNANCE.minScore,
      stats: {
        activeProposals: "3",
        votingPower: reputationScore,
        participation: "87%",
      },
    },
    {
      id: "remittance",
      icon: Send,
      title: "Private Remittances",
      description: "Send money across borders with complete privacy",
      minScore: SERVICE_REQUIREMENTS.REMITTANCE.minScore,
      available: true,
      stats: {
        fee: "1%",
        speed: "Instant",
        limit: "$5,000/mo",
      },
    },
  ];

  const handleServiceAction = async (serviceId: string) => {
    setIsProcessing(true);

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    let transaction: Transaction | null = null;

    switch (serviceId) {
      case "microloan":
        const loanAmount = calculateLoanAmount(reputationScore);
        transaction = generateMockTransaction("Microloan", `$${loanAmount}`);
        toast.success(`Microloan of $${loanAmount} approved!`, {
          icon: "💰",
          style: {
            borderRadius: "10px",
            background: "#1a1a2e",
            color: "#fff",
            border: "1px solid #22c55e",
          },
        });
        break;

      case "airdrop":
        transaction = generateMockTransaction("Airdrop", "100 TOKENS");
        toast.success("Successfully claimed 100 TOKENS!", {
          icon: "🎉",
          style: {
            borderRadius: "10px",
            background: "#1a1a2e",
            color: "#fff",
            border: "1px solid #7c3aed",
          },
        });
        break;

      case "governance":
        transaction = generateMockTransaction("Vote", "Proposal #42");
        toast.success("Your vote has been recorded!", {
          icon: "🗳️",
          style: {
            borderRadius: "10px",
            background: "#1a1a2e",
            color: "#fff",
            border: "1px solid #3b82f6",
          },
        });
        break;

      case "remittance":
        toast("Remittance feature coming soon!", {
          icon: "🚧",
          style: {
            borderRadius: "10px",
            background: "#1a1a2e",
            color: "#fff",
            border: "1px solid #f59e0b",
          },
        });
        break;
    }

    if (transaction) {
      setTransactions([transaction, ...transactions]);
    }

    setIsProcessing(false);
    setSelectedService(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Reputation</span>
        </button>

        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Financial Services Portal
          </h2>
          <p className="text-lg text-gray-300">
            Access DeFi services with your verified identity and reputation
          </p>
        </div>
      </motion.div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard
              className={`p-6 h-full ${!service.available ? "opacity-60" : ""}`}
              hover={service.available}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      service.available ? "bg-purple-500/20" : "bg-gray-500/20"
                    }`}
                  >
                    <service.icon
                      className={`w-6 h-6 ${
                        service.available ? "text-purple-400" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{service.title}</h3>
                    {!service.available && (
                      <p className="text-xs text-red-400 mt-1">
                        Requires {service.minScore} reputation points
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-gray-400 mb-6">{service.description}</p>

              {/* Service Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {Object.entries(service.stats).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-lg font-semibold text-white">
                      {value}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </div>
                  </div>
                ))}
              </div>

              <NeonButton
                onClick={() => setSelectedService(service.id)}
                disabled={!service.available}
                variant={service.available ? "purple" : "blue"}
                size="sm"
                className="w-full"
              >
                {service.available ? "Access Service" : "Locked"}
              </NeonButton>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Transaction History */}
      {transactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-8">
            <h3 className="text-2xl font-semibold mb-6">Recent Transactions</h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                      Amount/Details
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, index) => (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/5"
                    >
                      <td className="py-4 px-4">
                        <span className="text-white font-medium">
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-300">{tx.amount}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center space-x-1 text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">{tx.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-400">
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Service Modal */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !isProcessing && setSelectedService(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full"
            >
              <GlassCard className="p-8">
                {(() => {
                  const service = services.find(
                    (s) => s.id === selectedService
                  );
                  if (!service) return null;

                  return (
                    <>
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <service.icon className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-2xl font-semibold">
                          {service.title}
                        </h3>
                      </div>

                      <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="text-gray-400">Your Reputation</span>
                          <span className="font-semibold">
                            {reputationScore} points
                          </span>
                        </div>

                        {selectedService === "microloan" && (
                          <>
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                              <span className="text-gray-400">
                                Available Credit
                              </span>
                              <span className="font-semibold text-green-400">
                                ${calculateLoanAmount(reputationScore)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                              <span className="text-gray-400">
                                Interest Rate
                              </span>
                              <span className="font-semibold">12% APR</span>
                            </div>
                          </>
                        )}

                        {selectedService === "airdrop" && (
                          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <span className="text-gray-400">
                              Claimable Amount
                            </span>
                            <span className="font-semibold text-purple-400">
                              100 TOKENS
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-yellow-300">
                            This transaction will be recorded on-chain with
                            complete privacy. No personal information will be
                            revealed.
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <NeonButton
                          onClick={() => handleServiceAction(selectedService)}
                          disabled={isProcessing}
                          variant="green"
                          className="flex-1"
                        >
                          {isProcessing ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Processing...</span>
                            </div>
                          ) : (
                            "Confirm"
                          )}
                        </NeonButton>

                        <button
                          onClick={() => setSelectedService(null)}
                          disabled={isProcessing}
                          className="flex-1 py-3 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  );
                })()}
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
