"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Users,
  TrendingUp,
  Plus,
  ChevronRight,
  Star,
  Shield,
  Zap,
  Lock,
  Unlock,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { ATTESTATION_TYPES, SERVICE_REQUIREMENTS } from "@/lib/utils";
import toast from "react-hot-toast";

interface ReputationDashboardProps {
  userIdentifier: string;
  score: number;
  attestations: any[];
  onAttestationAdded: (attestation: any) => void;
  onContinue: () => void;
}

export const ReputationDashboard: React.FC<ReputationDashboardProps> = ({
  userIdentifier,
  score,
  attestations,
  onAttestationAdded,
  onContinue,
}) => {
  const [isAddingAttestation, setIsAddingAttestation] = useState(false);
  const [selectedAttestationType, setSelectedAttestationType] = useState<
    string | null
  >(null);

  const availableAttestations = Object.values(ATTESTATION_TYPES).filter(
    (type) => !attestations.find((att) => att.type === type.type)
  );

  const handleAddAttestation = (type: any) => {
    setIsAddingAttestation(true);

    // Simulate attestation process
    setTimeout(() => {
      const newAttestation = {
        id: Date.now().toString(),
        ...type,
        timestamp: new Date().toISOString(),
        attester: `0x${Math.random().toString(16).substr(2, 40)}`,
      };

      onAttestationAdded(newAttestation);
      setIsAddingAttestation(false);
      setSelectedAttestationType(null);

      toast.success(`${type.title} added successfully!`, {
        icon: type.icon,
        style: {
          borderRadius: "10px",
          background: "#1a1a2e",
          color: "#fff",
          border: "1px solid #7c3aed",
        },
      });
    }, 2000);
  };

  const getServiceStatus = (minScore: number) => {
    if (score >= minScore) return "unlocked";
    const progress = (score / minScore) * 100;
    if (progress >= 75) return "nearly";
    return "locked";
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Build Your Reputation
        </h2>
        <p className="text-base lg:text-lg text-gray-300 max-w-2xl mx-auto">
          Gain trust through community attestations to unlock financial services
        </p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Reputation Score Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="xl:col-span-1"
        >
          <GlassCard className="p-6 lg:p-8 h-full" variant="purple" glow>
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="relative inline-block mb-6"
              >
                {/* Circular Progress */}
                <svg className="w-32 h-32 lg:w-40 lg:h-40 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="rgba(124, 58, 237, 0.2)"
                    strokeWidth="8"
                    fill="none"
                    className="lg:hidden"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="rgba(124, 58, 237, 0.2)"
                    strokeWidth="12"
                    fill="none"
                    className="hidden lg:block"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 352" }}
                    animate={{ strokeDasharray: `${(score / 200) * 352} 352` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="lg:hidden"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 440" }}
                    animate={{ strokeDasharray: `${(score / 200) * 440} 440` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="hidden lg:block"
                  />
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Score Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="text-3xl lg:text-5xl font-bold text-white">
                      {score}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-400">
                      Reputation
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              <h3 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6">
                Your Trust Level
              </h3>

              {/* Service Unlock Status */}
              <div className="space-y-2 lg:space-y-3">
                {Object.entries(SERVICE_REQUIREMENTS).map(
                  ([key, service], index) => {
                    const status = getServiceStatus(service.minScore);
                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className={`flex items-center justify-between p-2 lg:p-3 rounded-lg text-sm ${
                          status === "unlocked"
                            ? "bg-green-500/10 border border-green-500/30"
                            : status === "nearly"
                            ? "bg-yellow-500/10 border border-yellow-500/30"
                            : "bg-gray-500/10 border border-gray-500/30"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          {status === "unlocked" ? (
                            <Unlock className="w-3 h-3 lg:w-4 lg:h-4 text-green-400" />
                          ) : (
                            <Lock className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" />
                          )}
                          <span
                            className={`text-xs lg:text-sm ${
                              status === "unlocked"
                                ? "text-green-400"
                                : "text-gray-400"
                            }`}
                          >
                            {service.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {service.minScore > 0
                            ? `${service.minScore} pts`
                            : "Free"}
                        </span>
                      </motion.div>
                    );
                  }
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Attestations Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-2"
        >
          <GlassCard className="p-6 lg:p-8 h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h3 className="text-xl lg:text-2xl font-semibold">
                Community Attestations
              </h3>
              <NeonButton
                onClick={() =>
                  setSelectedAttestationType(
                    availableAttestations[0]?.type || null
                  )
                }
                disabled={
                  availableAttestations.length === 0 || isAddingAttestation
                }
                size="sm"
                variant="blue"
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Attestation
              </NeonButton>
            </div>

            {/* Attestation List */}
            {attestations.length === 0 ? (
              <div className="text-center py-8 lg:py-12">
                <Users className="w-12 h-12 lg:w-16 lg:h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No attestations yet</p>
                <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                  Build your reputation by getting verified by community members
                </p>
              </div>
            ) : (
              <div className="space-y-3 lg:space-y-4 max-h-96 overflow-y-auto">
                {attestations.map((attestation, index) => (
                  <motion.div
                    key={attestation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GlassCard className="p-3 lg:p-4" hover={false}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center space-x-3 lg:space-x-4 flex-1 min-w-0">
                          <div className="text-2xl lg:text-3xl flex-shrink-0">
                            {attestation.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white text-sm lg:text-base truncate">
                              {attestation.title}
                            </h4>
                            <p className="text-xs lg:text-sm text-gray-400 line-clamp-2">
                              {attestation.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Verified{" "}
                              {new Date(
                                attestation.timestamp
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 lg:space-x-2 flex-shrink-0">
                          <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 text-green-400" />
                          <span className="text-green-400 font-semibold text-sm lg:text-base">
                            +{attestation.score}
                          </span>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Continue Button */}
            {score >= 50 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 lg:mt-8 text-center border-t border-white/10 pt-6"
              >
                <NeonButton
                  onClick={onContinue}
                  size="lg"
                  variant="green"
                  className="group w-full sm:w-auto"
                >
                  <span className="flex items-center justify-center">
                    Access Financial Services
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </NeonButton>
                <p className="text-sm text-gray-400 mt-3">
                  You've unlocked access to DeFi services!
                </p>
              </motion.div>
            )}
          </GlassCard>
        </motion.div>
      </div>

      {/* Add Attestation Modal */}
      {selectedAttestationType && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() =>
            !isAddingAttestation && setSelectedAttestationType(null)
          }
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <GlassCard className="p-8 max-w-md w-full">
              <h3 className="text-2xl font-semibold mb-6">Add Attestation</h3>

              {availableAttestations.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">All attestations completed!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableAttestations.map((type) => (
                    <motion.button
                      key={type.type}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAddAttestation(type)}
                      disabled={isAddingAttestation}
                      className="w-full p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 transition-all text-left"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{type.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">
                            {type.title}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {type.description}
                          </p>
                          <div className="flex items-center mt-2">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-sm text-yellow-400">
                              +{type.score} points
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {!isAddingAttestation && (
                <button
                  onClick={() => setSelectedAttestationType(null)}
                  className="mt-6 w-full py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              )}
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
